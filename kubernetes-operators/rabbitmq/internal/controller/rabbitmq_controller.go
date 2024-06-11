package controller

import (
	"context"
	"reflect"

	"github.com/go-logr/logr"
	corev1 "k8s.io/api/core/v1"
	"k8s.io/apimachinery/pkg/api/errors"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/apimachinery/pkg/types"
	ctrl "sigs.k8s.io/controller-runtime"
	"sigs.k8s.io/controller-runtime/pkg/client"
	"sigs.k8s.io/controller-runtime/pkg/controller/controllerutil"

	rabbitmqv1 "github.com/michwoj01/EOSI-Operator-Framework/kubernetes-operators/rabbitmq/api/v1"
)

// RabbitMQReconciler reconciles a RabbitMQ object
type RabbitMQReconciler struct {
	client.Client
	Log    logr.Logger
	Scheme *runtime.Scheme
}

//+kubebuilder:rbac:groups=kubernetes-operators.pl.edu.agh,resources=rabbitmqs,verbs=get;list;watch;create;update;patch;delete
//+kubebuilder:rbac:groups=kubernetes-operators.pl.edu.agh,resources=rabbitmqs/status,verbs=get;update;patch
//+kubebuilder:rbac:groups=kubernetes-operators.pl.edu.agh,resources=rabbitmqs/finalizers,verbs=update

func (r *RabbitMQReconciler) Reconcile(ctx context.Context, req ctrl.Request) (ctrl.Result, error) {
	logger := r.Log.WithValues("namespace", req.Namespace, "rabbitmq", req.Name)
	logger.Info("Reconciling RabbitMQ instance")

	rabbitmq := &rabbitmqv1.RabbitMQ{}
	err := r.Get(ctx, req.NamespacedName, rabbitmq)
	if err != nil {
		if errors.IsNotFound(err) {
			logger.Info("RabbitMQ resource not found. Ignoring since object must be deleted")
			return ctrl.Result{}, nil
		}
		logger.Error(err, "Failed to get RabbitMQ")
		return ctrl.Result{}, err
	}

	if err := r.ensurePod(ctx, rabbitmq); err != nil {
		logger.Error(err, "Failed to ensure Pod")
		return ctrl.Result{}, err
	}

	if err := r.updateStatus(ctx, rabbitmq); err != nil {
		logger.Error(err, "Failed to update RabbitMQ status")
		return ctrl.Result{}, err
	}

	return ctrl.Result{}, nil
}

func (r *RabbitMQReconciler) ensurePod(ctx context.Context, rabbitmq *rabbitmqv1.RabbitMQ) error {
	logger := r.Log.WithValues("namespace", rabbitmq.Namespace, "rabbitmq", rabbitmq.Name)
	logger.Info("Ensuring Pod for RabbitMQ")

	pod := r.newPodForCR(rabbitmq)
	foundPod := &corev1.Pod{}
	err := r.Get(ctx, types.NamespacedName{Name: pod.Name, Namespace: pod.Namespace}, foundPod)
	if err != nil && errors.IsNotFound(err) {
		logger.Info("Pod not found, creating a new one")
		if err := controllerutil.SetControllerReference(rabbitmq, pod, r.Scheme); err != nil {
			logger.Error(err, "Failed to set controller reference for Pod")
			return err
		}
		err = r.Create(ctx, pod)
		if err != nil {
			logger.Error(err, "Failed to create Pod")
			return err
		}
		return nil
	} else if err != nil {
		logger.Error(err, "Failed to get Pod")
		return err
	} else if !reflect.DeepEqual(pod.Spec, foundPod.Spec) {
		logger.Info("Pod spec has changed, updating Pod")
		foundPod.Spec = pod.Spec
		err = r.Update(ctx, foundPod)
		if err != nil {
			logger.Error(err, "Failed to update Pod")
			return err
		}
		return nil
	}

	logger.Info("Pod already exists and is up to date")
	return nil
}

func (r *RabbitMQReconciler) newPodForCR(cr *rabbitmqv1.RabbitMQ) *corev1.Pod {
	logger := r.Log.WithValues("namespace", cr.Namespace, "rabbitmq", cr.Name)
	logger.Info("Creating a new Pod for RabbitMQ")

	labels := map[string]string{
		"app": cr.Name,
	}

	return &corev1.Pod{
		ObjectMeta: metav1.ObjectMeta{
			Name:      cr.Name,
			Namespace: cr.Namespace,
			Labels:    labels,
		},
		Spec: corev1.PodSpec{
			ServiceAccountName: "kubernetes-operators-sa",
			Containers:         cr.Spec.Containers,
			RestartPolicy:      cr.Spec.RestartPolicy,
			Volumes:            cr.Spec.Volumes,
		},
	}
}

func (r *RabbitMQReconciler) updateStatus(ctx context.Context, rabbitmq *rabbitmqv1.RabbitMQ) error {
	logger := r.Log.WithValues("namespace", rabbitmq.Namespace, "rabbitmq", rabbitmq.Name)
	logger.Info("Updating RabbitMQ status with the pod names")

	podList := &corev1.PodList{}
	listOpts := []client.ListOption{
		client.InNamespace(rabbitmq.Namespace),
		client.MatchingLabels{"app": "rabbitmq"},
	}
	if err := r.List(ctx, podList, listOpts...); err != nil {
		logger.Error(err, "Failed to list pods")
		return err
	}

	podNames := getPodNames(podList.Items)
	if !reflect.DeepEqual(podNames, rabbitmq.Status.Nodes) {
		rabbitmq.Status.Nodes = podNames
		if err := r.Status().Update(ctx, rabbitmq); err != nil {
			logger.Error(err, "Failed to update RabbitMQ status")
			return err
		}
		logger.Info("RabbitMQ status updated", "Status.Nodes", rabbitmq.Status.Nodes)
	}

	return nil
}

func getPodNames(pods []corev1.Pod) []string {
	var podNames []string
	for _, pod := range pods {
		podNames = append(podNames, pod.Name)
	}
	return podNames
}

func (r *RabbitMQReconciler) SetupWithManager(mgr ctrl.Manager) error {
	logger := r.Log.WithValues("controller", "RabbitMQReconciler")
	logger.Info("Setting up the controller manager")
	return ctrl.NewControllerManagedBy(mgr).
		For(&rabbitmqv1.RabbitMQ{}).
		Owns(&corev1.Pod{}).
		Owns(&corev1.PersistentVolumeClaim{}).
		Complete(r)
}
