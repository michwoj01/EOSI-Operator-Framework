package controller

import (
	"context"

	"github.com/go-logr/logr"
	"k8s.io/apimachinery/pkg/api/errors"
	"k8s.io/apimachinery/pkg/api/resource"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/apimachinery/pkg/types"
	ctrl "sigs.k8s.io/controller-runtime"
	"sigs.k8s.io/controller-runtime/pkg/client"
	"sigs.k8s.io/controller-runtime/pkg/log"

	redisv1 "github.com/michwoj01/EOSI-Operator-Framework/kubernetes-operators/redis/api/v1"
	appsv1 "k8s.io/api/apps/v1"
	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// RedisReconciler reconciles a Redis object
type RedisReconciler struct {
	client.Client
	Log    logr.Logger
	Scheme *runtime.Scheme
}

//+kubebuilder:rbac:groups=database.mydomain,resources=redises,verbs=get;list;watch;create;update;patch;delete
//+kubebuilder:rbac:groups=database.mydomain,resources=redises/status,verbs=get;update;patch
//+kubebuilder:rbac:groups=database.mydomain,resources=redises/finalizers,verbs=update

func (r *RedisReconciler) Reconcile(ctx context.Context, req ctrl.Request) (ctrl.Result, error) {
	_ = log.FromContext(ctx)
	logger := r.Log.WithValues("redis", req.NamespacedName)

	// Fetch the Redis instance
	redis := &redisv1.Redis{}
	err := r.Get(ctx, req.NamespacedName, redis)
	if err != nil {
		if errors.IsNotFound(err) {
			return ctrl.Result{}, nil
		}
		return ctrl.Result{}, err
	}

	// Ensure the PVC exists
	pvc := &corev1.PersistentVolumeClaim{}
	err = r.Get(ctx, types.NamespacedName{Name: redis.Spec.DataPvcName, Namespace: redis.Namespace}, pvc)
	if err != nil && errors.IsNotFound(err) {
		// Define a new PVC
		pvc = r.pvcForRedis(redis)
		logger.Info("Creating a new PVC", "PVC.Namespace", pvc.Namespace, "PVC.Name", pvc.Name)
		err = r.Create(ctx, pvc)
		if err != nil {
			return ctrl.Result{}, err
		}
		// PVC created successfully - return and requeue
		return ctrl.Result{Requeue: true}, nil
	} else if err != nil {
		return ctrl.Result{}, err
	}

	// Check if the Deployment already exists, if not create a new one
	found := &appsv1.Deployment{}
	err = r.Get(ctx, types.NamespacedName{Name: redis.Name, Namespace: redis.Namespace}, found)
	if err != nil && errors.IsNotFound(err) {
		// Define a new Deployment
		dep := r.deploymentForRedis(redis)
		logger.Info("Creating a new Deployment", "Deployment.Namespace", dep.Namespace, "Deployment.Name", dep.Name)
		err = r.Create(ctx, dep)
		if err != nil {
			return ctrl.Result{}, err
		}
		// Deployment created successfully - return and requeue
		return ctrl.Result{Requeue: true}, nil
	} else if err != nil {
		return ctrl.Result{}, err
	}

	// Ensure the deployment size is the same as the spec
	size := redis.Spec.Size
	if *found.Spec.Replicas != size {
		found.Spec.Replicas = &size
		err = r.Update(ctx, found)
		if err != nil {
			return ctrl.Result{}, err
		}
	}

	return ctrl.Result{}, nil
}

// pvcForRedis returns a Redis PVC object
func (r *RedisReconciler) pvcForRedis(m *redisv1.Redis) *corev1.PersistentVolumeClaim {
	labels := labelsForRedis(m.Name)
	storageClassName := "standard" // Adjust as needed

	return &corev1.PersistentVolumeClaim{
		ObjectMeta: metav1.ObjectMeta{
			Name:      m.Spec.DataPvcName,
			Namespace: m.Namespace,
			Labels:    labels,
		},
		Spec: corev1.PersistentVolumeClaimSpec{
			AccessModes: []corev1.PersistentVolumeAccessMode{
				corev1.ReadWriteOnce,
			},
			Resources: corev1.ResourceRequirements{
				Requests: corev1.ResourceList{
					corev1.ResourceStorage: resource.MustParse("1Gi"), // Adjust as needed
				},
			},
			StorageClassName: &storageClassName,
		},
	}
}

// deploymentForRedis returns a Redis Deployment object
func (r *RedisReconciler) deploymentForRedis(m *redisv1.Redis) *appsv1.Deployment {
	ls := labelsForRedis(m.Name)
	replicas := m.Spec.Size

	dep := &appsv1.Deployment{
		ObjectMeta: metav1.ObjectMeta{
			Name:      m.Name,
			Namespace: m.Namespace,
		},
		Spec: appsv1.DeploymentSpec{
			Replicas: &replicas,
			Selector: &metav1.LabelSelector{
				MatchLabels: ls,
			},
			Template: corev1.PodTemplateSpec{
				ObjectMeta: metav1.ObjectMeta{
					Labels: ls,
				},
				Spec: corev1.PodSpec{
					Containers: []corev1.Container{{
						Image: m.Spec.Image,
						Name:  "redis",
						Ports: []corev1.ContainerPort{{
							ContainerPort: int32(m.Spec.Port),
							Name:          "redis",
						}},
						VolumeMounts: []corev1.VolumeMount{
							{
								Name:      "redis-storage",
								MountPath: "/data",
							},
						},
					}},
					Volumes: []corev1.Volume{
						{
							Name: "redis-storage",
							VolumeSource: corev1.VolumeSource{
								PersistentVolumeClaim: &corev1.PersistentVolumeClaimVolumeSource{
									ClaimName: m.Spec.DataPvcName,
								},
							},
						},
					},
				},
			},
		},
	}
	// Set Redis instance as the owner and controller
	ctrl.SetControllerReference(m, dep, r.Scheme)
	return dep
}

// labelsForRedis returns the labels for selecting the resources
// belonging to the given Redis CR name.
func labelsForRedis(name string) map[string]string {
	return map[string]string{"app": "redis", "redis_cr": name}
}

func (r *RedisReconciler) SetupWithManager(mgr ctrl.Manager) error {
	return ctrl.NewControllerManagedBy(mgr).
		For(&redisv1.Redis{}).
		Owns(&appsv1.Deployment{}).
		Complete(r)
}
