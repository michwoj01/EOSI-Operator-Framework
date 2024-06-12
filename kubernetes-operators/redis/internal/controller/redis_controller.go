package controller

import (
	"context"
	"reflect"

	"github.com/go-logr/logr"
	appsv1 "k8s.io/api/apps/v1"
	corev1 "k8s.io/api/core/v1"
	"k8s.io/apimachinery/pkg/api/errors"
	"k8s.io/apimachinery/pkg/api/resource"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/apimachinery/pkg/types"
	ctrl "sigs.k8s.io/controller-runtime"
	"sigs.k8s.io/controller-runtime/pkg/client"
	"sigs.k8s.io/controller-runtime/pkg/controller/controllerutil"

	redisv1 "github.com/michwoj01/EOSI-Operator-Framework/kubernetes-operators/redis/api/v1"
)

// RedisReconciler reconciles a Redis object
type RedisReconciler struct {
	client.Client
	Log    logr.Logger
	Scheme *runtime.Scheme
}

//+kubebuilder:rbac:groups=kubernetes-operators.pl.edu.agh,resources=redis,verbs=get;list;watch;create;update;patch;delete
//+kubebuilder:rbac:groups=kubernetes-operators.pl.edu.agh,resources=redis/status,verbs=get;update;patch
//+kubebuilder:rbac:groups=kubernetes-operators.pl.edu.agh,resources=redis/finalizers,verbs=update

func (r *RedisReconciler) Reconcile(ctx context.Context, req ctrl.Request) (ctrl.Result, error) {
	logger := r.Log.WithValues("namespace", req.Namespace, "redis", req.Name)
	logger.Info("Reconciling Redis instance")

	redis := &redisv1.Redis{}
	err := r.Get(ctx, req.NamespacedName, redis)
	if err != nil {
		if errors.IsNotFound(err) {
			logger.Info("Redis resource not found. Ignoring since object must be deleted")
			return ctrl.Result{}, nil
		}
		logger.Error(err, "Failed to get Redis")
		return ctrl.Result{}, err
	}

	if err := r.ensurePVC(ctx, redis.Spec.Volumes, redis); err != nil {
		logger.Error(err, "Failed to ensure data PVC")
		return ctrl.Result{}, err
	}

	if err := r.ensureDeployment(ctx, redis); err != nil {
		logger.Error(err, "Failed to ensure Deployment")
		return ctrl.Result{}, err
	}

	if err := r.updateStatus(ctx, redis); err != nil {
		logger.Error(err, "Failed to update Redis status")
		return ctrl.Result{}, err
	}

	return ctrl.Result{}, nil
}

func (r *RedisReconciler) ensurePVC(ctx context.Context, volumes []corev1.Volume, redis *redisv1.Redis) error {
	logger := r.Log.WithValues("namespace", redis.Namespace, "redis", redis.Name)
	logger.Info("Ensuring PVC for Redis")

	for _, volume := range volumes {
		if volume.PersistentVolumeClaim != nil {
			pvc := &corev1.PersistentVolumeClaim{}
			err := r.Get(ctx, types.NamespacedName{Name: volume.PersistentVolumeClaim.ClaimName, Namespace: redis.Namespace}, pvc)
			if err != nil && errors.IsNotFound(err) {
				logger.Info("PVC not found, creating a new one")
				pvc = &corev1.PersistentVolumeClaim{
					ObjectMeta: metav1.ObjectMeta{
						Name:      volume.PersistentVolumeClaim.ClaimName,
						Namespace: redis.Namespace,
						Labels:    map[string]string{"app": redis.Name},
					},
					Spec: corev1.PersistentVolumeClaimSpec{
						AccessModes: []corev1.PersistentVolumeAccessMode{
							corev1.ReadWriteOnce,
						},
						Resources: corev1.ResourceRequirements{
							Requests: corev1.ResourceList{
								corev1.ResourceStorage: resource.MustParse("1Gi"),
							},
						},
					},
				}
				if err := controllerutil.SetControllerReference(redis, pvc, r.Scheme); err != nil {
					logger.Error(err, "Failed to set controller reference for PVC")
					return err
				}
				err = r.Create(ctx, pvc)
				if err != nil {
					logger.Error(err, "Failed to create PVC")
					return err
				}
			} else if err != nil {
				logger.Error(err, "Failed to get PVC")
				return err
			} else {
				logger.Info("PVC already exists")
			}
		}
	}

	return nil
}

func (r *RedisReconciler) ensureDeployment(ctx context.Context, redis *redisv1.Redis) error {
	logger := r.Log.WithValues("namespace", redis.Namespace, "redis", redis.Name, "deployment", "redis")
	logger.Info("Ensuring Deployment for Redis")

	deployment := &appsv1.Deployment{
		ObjectMeta: metav1.ObjectMeta{
			Name:      "redis",
			Namespace: redis.Namespace,
			Labels:    map[string]string{"app": redis.Name},
		},
		Spec: appsv1.DeploymentSpec{
			Replicas: int32Ptr(1),
			Selector: &metav1.LabelSelector{
				MatchLabels: map[string]string{"app": "redis"},
			},
			Template: corev1.PodTemplateSpec{
				ObjectMeta: metav1.ObjectMeta{
					Labels: map[string]string{"app": "redis"},
				},
				Spec: corev1.PodSpec{
					Containers:    redis.Spec.Containers,
					RestartPolicy: redis.Spec.RestartPolicy,
					Volumes:       redis.Spec.Volumes,
				},
			},
		},
	}

	foundDeployment := &appsv1.Deployment{}
	err := r.Get(ctx, types.NamespacedName{Name: deployment.Name, Namespace: deployment.Namespace}, foundDeployment)
	if err != nil && errors.IsNotFound(err) {
		logger.Info("Deployment not found, creating a new one")
		if err := controllerutil.SetControllerReference(redis, deployment, r.Scheme); err != nil {
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

func (r *RedisReconciler) updateStatus(ctx context.Context, redis *redisv1.Redis) error {
	logger := r.Log.WithValues("namespace", redis.Namespace, "redis", redis.Name)
	logger.Info("Updating Redis status with the pod names")

	podList := &corev1.PodList{}
	listOpts := []client.ListOption{
		client.InNamespace(redis.Namespace),
		client.MatchingLabels{"app": "redis"},
	}
	if err := r.List(ctx, podList, listOpts...); err != nil {
		logger.Error(err, "Failed to list pods")
		return err
	}

	podNames := getPodNames(podList.Items)
	if !reflect.DeepEqual(podNames, redis.Status.Nodes) {
		redis.Status.Nodes = podNames
		if err := r.Status().Update(ctx, redis); err != nil {
			logger.Error(err, "Failed to update Redis status")
			return err
		}
		logger.Info("Redis status updated", "Status.Nodes", redis.Status.Nodes)
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

func (r *RedisReconciler) SetupWithManager(mgr ctrl.Manager) error {
	logger := r.Log.WithValues("controller", "RedisReconciler")
	logger.Info("Setting up the controller manager")
	return ctrl.NewControllerManagedBy(mgr).
		For(&redisv1.Redis{}).
		Owns(&appsv1.Deployment{}).
		Complete(r)
}

func int32Ptr(i int32) *int32 {
	return &i
}
