package controller

import (
	"context"
	"reflect"

	"github.com/go-logr/logr"
	"k8s.io/apimachinery/pkg/api/errors"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/apimachinery/pkg/types"
	ctrl "sigs.k8s.io/controller-runtime"
	"sigs.k8s.io/controller-runtime/pkg/client"
	"sigs.k8s.io/controller-runtime/pkg/controller/controllerutil"

	rabbitmqv1 "github.com/michwoj01/EOSI-Operator-Framework/kubernetes-operators/rabbitmq/api/v1"
	appsv1 "k8s.io/api/apps/v1"
	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
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
	// Create a logger with context specific to this reconcile loop
	logger := r.Log.WithValues("namespace", req.Namespace, "rabbitmq", req.Name)
	logger.Info("Reconciling RabbitMQ instance")

	// Fetch the RabbitMQ instance
	logger.Info("Fetching RabbitMQ instance")
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

	// Ensure Deployment exists
	if err := r.ensureDeployment(ctx, rabbitmq); err != nil {
		logger.Error(err, "Failed to ensure Deployment")
		return ctrl.Result{}, err
	}

	// Update the RabbitMQ status with the pod names
	if err := r.updateStatus(ctx, rabbitmq); err != nil {
		logger.Error(err, "Failed to update RabbitMQ status")
		return ctrl.Result{}, err
	}

	return ctrl.Result{}, nil
}

func (r *RabbitMQReconciler) ensureDeployment(ctx context.Context, rabbitmq *rabbitmqv1.RabbitMQ) error {
	logger := r.Log.WithValues("namespace", rabbitmq.Namespace, "rabbitmq", rabbitmq.Name, "deployment", "rabbitmq")
	logger.Info("Ensuring Deployment for RabbitMQ")

	deployment := &appsv1.Deployment{
		ObjectMeta: metav1.ObjectMeta{
			Name:      "rabbitmq",
			Namespace: rabbitmq.Namespace,
			Labels:    map[string]string{"app": rabbitmq.Name},
		},
		Spec: appsv1.DeploymentSpec{
			Replicas: int32Ptr(1),
			Selector: &metav1.LabelSelector{
				MatchLabels: map[string]string{"app": "rabbitmq"},
			},
			Template: corev1.PodTemplateSpec{
				ObjectMeta: metav1.ObjectMeta{
					Labels: map[string]string{"app": "rabbitmq"},
				},
				Spec: corev1.PodSpec{
					Containers:    rabbitmq.Spec.Containers,
					RestartPolicy: rabbitmq.Spec.RestartPolicy,
					Volumes:       rabbitmq.Spec.Volumes,
				},
			},
		},
	}

	foundDeployment := &appsv1.Deployment{}
	err := r.Get(ctx, types.NamespacedName{Name: deployment.Name, Namespace: deployment.Namespace}, foundDeployment)
	if err != nil && errors.IsNotFound(err) {
		logger.Info("Deployment not found, creating a new one")
		// Set RabbitMQ instance as the owner and controller
		if err := controllerutil.SetControllerReference(rabbitmq, deployment, r.Scheme); err != nil {
			logger.Error(err, "Failed to set controller reference for Deployment")
			return err
		}
		err = r.Create(ctx, deployment)
		if err != nil {
			logger.Error(err, "Failed to create Deployment")
			return err
		}
	} else if err != nil {
		logger.Error(err, "Failed to get Deployment")
		return err
	} else if !reflect.DeepEqual(deployment.Spec, foundDeployment.Spec) {
		logger.Info("Deployment spec has changed, updating Deployment")
		foundDeployment.Spec = deployment.Spec
		err = r.Update(ctx, foundDeployment)
		if err != nil {
			logger.Error(err, "Failed to update Deployment")
			return err
		}
	} else {
		logger.Info("Deployment already exists and is up to date")
	}

	return nil
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
		Owns(&appsv1.Deployment{}).
		Complete(r)
}

func int32Ptr(i int32) *int32 {
	return &i
}
