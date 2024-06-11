package controller

import (
	"context"
	"fmt"
	"reflect"

	"github.com/go-logr/logr"
	corev1 "k8s.io/api/core/v1"
	"k8s.io/apimachinery/pkg/api/errors"
	"k8s.io/apimachinery/pkg/api/resource"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/apimachinery/pkg/types"
	ctrl "sigs.k8s.io/controller-runtime"
	"sigs.k8s.io/controller-runtime/pkg/client"
	// "sigs.k8s.io/controller-runtime/pkg/controller"
	"sigs.k8s.io/controller-runtime/pkg/controller/controllerutil"
	// "sigs.k8s.io/controller-runtime/pkg/log"

	mydomainv1 "github.com/redis/api/v1"
)

// RedisReconciler reconciles a Redis object
type RedisReconciler struct {
	client.Client
	Scheme *runtime.Scheme
	Log    logr.Logger
}

//+kubebuilder:rbac:groups=my.domain,resources=redis,verbs=get;list;watch;create;update;patch;delete
//+kubebuilder:rbac:groups=my.domain,resources=redis/status,verbs=get;update;patch
//+kubebuilder:rbac:groups=my.domain,resources=redis/finalizers,verbs=update

func (r *RedisReconciler) Reconcile(ctx context.Context, req ctrl.Request) (ctrl.Result, error) {
	// Create a logger with context specific to this reconcile loop
	logger := r.Log.WithValues("namespace", req.Namespace, "redis", req.Name)
	logger.Info("Reconciling Redis instance")

	// Fetch the Redis instance
	logger.Info("Fetching Redis instance")
	redis := &mydomainv1.Redis{}
	err := r.Get(ctx, req.NamespacedName, redis)
	if err != nil {
		if errors.IsNotFound(err) {
			logger.Info("Redis resource not found. Ignoring since object must be deleted")
			return ctrl.Result{}, nil
		}
		logger.Error(err, "Failed to get Redis")
		return ctrl.Result{}, err
	}

	// Ensure PVCs exist
	if err := r.ensurePVC(ctx, redis.Spec.DataPvcName, redis); err != nil {
		logger.Error(err, "Failed to ensure data PVC")
		return ctrl.Result{}, err
	}

	// Check if the Pod already exists
	logger.Info("Checking if the Pod already exists")
	found := &corev1.Pod{}
	err = r.Get(ctx, types.NamespacedName{Name: redis.Name, Namespace: redis.Namespace}, found)
	if err != nil && errors.IsNotFound(err) {
		logger.Info("Pod does not exist, will create a new one")
		// Define a new Pod object
		logger.Info("Defining a new Pod object")
		pod := r.newPodForCR(redis)

		// Set Redis instance as the owner and controller
		if err := controllerutil.SetControllerReference(redis, pod, r.Scheme); err != nil {
			logger.Error(err, "Failed to set controller reference")
			return ctrl.Result{}, err
		}

		err = r.Create(ctx, pod)
		if err != nil {
			logger.Error(err, "Failed to create new Pod", "Pod.Namespace", pod.Namespace, "Pod.Name", pod.Name)
			return ctrl.Result{}, err
		}
		// Pod created successfully - return and requeue
		logger.Info("Pod created successfully")
		return ctrl.Result{Requeue: true}, nil
	} else if err != nil {
		logger.Error(err, "Failed to get Pod")
		return ctrl.Result{}, err
	} else {
		// If the Pod exists and is not managed by this operator, delete it
		if !metav1.IsControlledBy(found, redis) {
			logger.Info("Found existing Pod not managed by this operator, deleting it", "Pod.Namespace", found.Namespace, "Pod.Name", found.Name)
			err = r.Delete(ctx, found)
			if err != nil {
				logger.Error(err, "Failed to delete existing Pod", "Pod.Namespace", found.Namespace, "Pod.Name", found.Name)
				return ctrl.Result{}, err
			}
			logger.Info("Deleted existing Pod", "Pod.Namespace", found.Namespace, "Pod.Name", found.Name)
			return ctrl.Result{Requeue: true}, nil
		}
		logger.Info("Pod already exists and is managed by this operator", "Pod.Namespace", found.Namespace, "Pod.Name", found.Name)
	}

	// Update the Redis status with the pod names
	logger.Info("Updating Redis status with the pod names")
	podNames := []string{found.Name}
	if !reflect.DeepEqual(podNames, redis.Status.Nodes) {
		redis.Status.Nodes = podNames
		err := r.Status().Update(ctx, redis)
		if err != nil {
			logger.Error(err, "Failed to update Redis status")
			return ctrl.Result{}, err
		}
		logger.Info("Redis status updated", "Status.Nodes", redis.Status.Nodes)
	}

	return ctrl.Result{}, nil
}

func (r *RedisReconciler) ensurePVC(ctx context.Context, pvcName string, redis *mydomainv1.Redis) error {
	logger := r.Log.WithValues("namespace", redis.Namespace, "Redis", redis.Name, "pvcName", pvcName)
	logger.Info("Ensuring PVC for Redis")

	pvc := &corev1.PersistentVolumeClaim{}
	err := r.Get(ctx, types.NamespacedName{Name: pvcName, Namespace: redis.Namespace}, pvc)
	if err != nil && errors.IsNotFound(err) {
		logger.Info("PVC not found, creating a new one")
		pvc = &corev1.PersistentVolumeClaim{
			ObjectMeta: metav1.ObjectMeta{
				Name:      pvcName,
				Namespace: redis.Namespace,
				Labels:    map[string]string{"app": redis.Name},
			},
			Spec: corev1.PersistentVolumeClaimSpec{
				AccessModes: []corev1.PersistentVolumeAccessMode{
					corev1.ReadWriteOnce,
				},
				Resources: corev1.ResourceRequirements{
					Requests: corev1.ResourceList{
						corev1.ResourceStorage: resource.MustParse("100Mbi"),
					},
				},
			},
		}
		// Set Redis instance as the owner and controller
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

	return nil
}

func (r *RedisReconciler) newPodForCR(cr *mydomainv1.Redis) *corev1.Pod {
	logger := r.Log.WithValues("namespace", cr.Namespace, "redis", cr.Name)
	logger.Info("Creating a new Pod for Redis")

	labels := map[string]string{
		"app": cr.Name,
	}

	// Check if required PVC is set
	if cr.Spec.DataPvcName == "" {
		errMsg := fmt.Sprintf("Missing required PVC for Redis: DataPvcName=%s", cr.Spec.DataPvcName)
		logger.Error(fmt.Errorf(errMsg), "PVC not set")
		return nil
	}

	volumes := []corev1.Volume{
		{
			Name: "redis-cache",
			VolumeSource: corev1.VolumeSource{
				PersistentVolumeClaim: &corev1.PersistentVolumeClaimVolumeSource{
					ClaimName: cr.Spec.DataPvcName,
				},
			},
		},
	}

	volumeMounts := []corev1.VolumeMount{
		{
			Name:      "redis-cache",
			MountPath: "/redis_data",
		},
	}

	return &corev1.Pod{
		ObjectMeta: metav1.ObjectMeta{
			Name:      cr.Name,
			Namespace: cr.Namespace,
			Labels:    labels,
		},
		Spec: corev1.PodSpec{
			Containers: []corev1.Container{{
				Name:  "redis",
				Image: cr.Spec.Image,
				Ports: []corev1.ContainerPort{{
					ContainerPort: 6379,
				}, {
					ContainerPort: 8001,
				}},
				VolumeMounts: volumeMounts,
			}},
			Volumes: volumes,
		},
	}
}

// SetupWithManager sets up the controller with the Manager.
func (r *RedisReconciler) SetupWithManager(mgr ctrl.Manager) error {
	logger := r.Log.WithValues("controller", "RedisReconciler")
	logger.Info("Setting up the controller manager")
	return ctrl.NewControllerManagedBy(mgr).
		For(&mydomainv1.Redis{}).
		Owns(&corev1.Pod{}).
		Owns(&corev1.PersistentVolumeClaim{}).
		Complete(r)
}
