package controller

import (
	"context"
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

	if err := r.ensurePVC(ctx, redis.Spec.DataPvcName, redis); err != nil {
		logger.Error(err, "Failed to ensure data PVC")
		return ctrl.Result{}, err
	}

	if err := r.ensurePod(ctx, redis); err != nil {
		logger.Error(err, "Failed to ensure Pod")
		return ctrl.Result{}, err
	}

	if err := r.updateStatus(ctx, redis); err != nil {
		logger.Error(err, "Failed to update Redis status")
		return ctrl.Result{}, err
	}

	return ctrl.Result{}, nil
}

func (r *RedisReconciler) ensurePVC(ctx context.Context, pvcName string, redis *redisv1.Redis) error {
	logger := r.Log.WithValues("namespace", redis.Namespace, "redis", redis.Name, "pvcName", pvcName)
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

	return nil
}

func (r *RedisReconciler) ensurePod(ctx context.Context, redis *redisv1.Redis) error {
	logger := r.Log.WithValues("namespace", redis.Namespace, "redis", redis.Name)
	logger.Info("Ensuring Pod for Redis")

	pod := r.newPodForCR(redis)
	foundPod := &corev1.Pod{}
	err := r.Get(ctx, types.NamespacedName{Name: pod.Name, Namespace: pod.Namespace}, foundPod)
	if err != nil && errors.IsNotFound(err) {
		logger.Info("Pod not found, creating a new one")
		if err := controllerutil.SetControllerReference(redis, pod, r.Scheme); err != nil {
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

func (r *RedisReconciler) newPodForCR(cr *redisv1.Redis) *corev1.Pod {
	logger := r.Log.WithValues("namespace", cr.Namespace, "redis", cr.Name)
	logger.Info("Creating a new Pod for Redis")

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
			Containers: []corev1.Container{
				{
					Name:  "redis",
					Image: cr.Spec.Image,
					Ports: []corev1.ContainerPort{{
						ContainerPort: cr.Spec.Port,
					}},
					VolumeMounts: []corev1.VolumeMount{{
						Name:      "redis-cache",
						MountPath: "/redis_data",
					}},
				},
			},
			Volumes: []corev1.Volume{{
				Name: "redis-cache",
				VolumeSource: corev1.VolumeSource{
					PersistentVolumeClaim: &corev1.PersistentVolumeClaimVolumeSource{
						ClaimName: cr.Spec.DataPvcName,
					},
				},
			}},
		},
	}
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
		Owns(&corev1.Pod{}).
		Owns(&corev1.PersistentVolumeClaim{}).
		Complete(r)
}
