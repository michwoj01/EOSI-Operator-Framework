package controller

import (
	"context"
	"reflect"

	"github.com/go-logr/logr"
	appsv1 "k8s.io/api/apps/v1"
	corev1 "k8s.io/api/core/v1"
	"k8s.io/apimachinery/pkg/api/errors"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/apimachinery/pkg/types"
	ctrl "sigs.k8s.io/controller-runtime"
	"sigs.k8s.io/controller-runtime/pkg/client"
	"sigs.k8s.io/controller-runtime/pkg/controller/controllerutil"

	databasev1 "github.com/michwoj01/EOSI-Operator-Framework/kubernetes-operators/postgres/api/v1"
)

// PostgresReconciler reconciles a Postgres object
type PostgresReconciler struct {
	client.Client
	Log    logr.Logger
	Scheme *runtime.Scheme
}

//+kubebuilder:rbac:groups=kubernetes-operators.pl.edu.agh,resources=postgres,verbs=get;list;watch;create;update;patch;delete
//+kubebuilder:rbac:groups=kubernetes-operators.pl.edu.agh,resources=postgres/status,verbs=get;update;patch
//+kubebuilder:rbac:groups=kubernetes-operators.pl.edu.agh,resources=postgres/finalizers,verbs=update

func (r *PostgresReconciler) Reconcile(ctx context.Context, req ctrl.Request) (ctrl.Result, error) {
	logger := r.Log.WithValues("namespace", req.Namespace, "postgres", req.Name)
	logger.Info("Reconciling Postgres instance")

	postgres := &databasev1.Postgres{}
	err := r.Get(ctx, req.NamespacedName, postgres)
	if err != nil {
		if errors.IsNotFound(err) {
			logger.Info("Postgres resource not found. Ignoring since object must be deleted")
			return ctrl.Result{}, nil
		}
		logger.Error(err, "Failed to get Postgres")
		return ctrl.Result{}, err
	}

	if err := r.ensureDeployment(ctx, postgres); err != nil {
		logger.Error(err, "Failed to ensure Deployment")
		return ctrl.Result{}, err
	}

	if err := r.updateStatus(ctx, postgres); err != nil {
		logger.Error(err, "Failed to update Postgres status")
		return ctrl.Result{}, err
	}

	return ctrl.Result{}, nil
}

func (r *PostgresReconciler) ensureDeployment(ctx context.Context, postgres *databasev1.Postgres) error {
	logger := r.Log.WithValues("namespace", postgres.Namespace, "postgres", postgres.Name, "deployment", "postgres")
	logger.Info("Ensuring Deployment for Postgres")

	deployment := &appsv1.Deployment{
		ObjectMeta: metav1.ObjectMeta{
			Name:      "postgres",
			Namespace: postgres.Namespace,
			Labels:    map[string]string{"app": postgres.Name},
		},
		Spec: appsv1.DeploymentSpec{
			Replicas: int32Ptr(1),
			Selector: &metav1.LabelSelector{
				MatchLabels: map[string]string{"app": "postgres"},
			},
			Template: corev1.PodTemplateSpec{
				ObjectMeta: metav1.ObjectMeta{
					Labels: map[string]string{"app": "postgres"},
				},
				Spec: corev1.PodSpec{
					Containers:    postgres.Spec.Containers,
					RestartPolicy: postgres.Spec.RestartPolicy,
					Volumes:       postgres.Spec.Volumes,
				},
			},
		},
	}

	foundDeployment := &appsv1.Deployment{}
	err := r.Get(ctx, types.NamespacedName{Name: deployment.Name, Namespace: deployment.Namespace}, foundDeployment)
	if err != nil && errors.IsNotFound(err) {
		logger.Info("Deployment not found, creating a new one")
		if err := controllerutil.SetControllerReference(postgres, deployment, r.Scheme); err != nil {
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

func (r *PostgresReconciler) updateStatus(ctx context.Context, postgres *databasev1.Postgres) error {
	logger := r.Log.WithValues("namespace", postgres.Namespace, "postgres", postgres.Name)
	logger.Info("Updating Postgres status with the pod names")

	podList := &corev1.PodList{}
	listOpts := []client.ListOption{
		client.InNamespace(postgres.Namespace),
		client.MatchingLabels{"app": "postgres"},
	}
	if err := r.List(ctx, podList, listOpts...); err != nil {
		logger.Error(err, "Failed to list pods")
		return err
	}

	podNames := getPodNames(podList.Items)
	if !reflect.DeepEqual(podNames, postgres.Status.Nodes) {
		postgres.Status.Nodes = podNames
		if err := r.Status().Update(ctx, postgres); err != nil {
			logger.Error(err, "Failed to update Postgres status")
			return err
		}
		logger.Info("Postgres status updated", "Status.Nodes", postgres.Status.Nodes)
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

func (r *PostgresReconciler) SetupWithManager(mgr ctrl.Manager) error {
	logger := r.Log.WithValues("controller", "PostgresReconciler")
	logger.Info("Setting up the controller manager")
	return ctrl.NewControllerManagedBy(mgr).
		For(&databasev1.Postgres{}).
		Owns(&appsv1.Deployment{}).
		Complete(r)
}

func int32Ptr(i int32) *int32 {
	return &i
}
