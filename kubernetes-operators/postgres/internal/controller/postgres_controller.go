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

	postgresv1 "github.com/michwoj01/EOSI-Operator-Framework/kubernetes-operators/postgres/api/v1"
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

	postgres := &postgresv1.Postgres{}
	err := r.Get(ctx, req.NamespacedName, postgres)
	if err != nil {
		if errors.IsNotFound(err) {
			logger.Info("Postgres resource not found. Ignoring since object must be deleted")
			return ctrl.Result{}, nil
		}
		logger.Error(err, "Failed to get Postgres")
		return ctrl.Result{}, err
	}

	if err := r.ensurePVC(ctx, postgres.Spec.DataPvcName, postgres); err != nil {
		logger.Error(err, "Failed to ensure data PVC")
		return ctrl.Result{}, err
	}

	if err := r.ensurePod(ctx, postgres); err != nil {
		logger.Error(err, "Failed to ensure Pod")
		return ctrl.Result{}, err
	}

	if err := r.updateStatus(ctx, postgres); err != nil {
		logger.Error(err, "Failed to update Postgres status")
		return ctrl.Result{}, err
	}

	return ctrl.Result{}, nil
}

func (r *PostgresReconciler) ensurePVC(ctx context.Context, pvcName string, postgres *postgresv1.Postgres) error {
	logger := r.Log.WithValues("namespace", postgres.Namespace, "postgres", postgres.Name, "pvcName", pvcName)
	logger.Info("Ensuring PVC for Postgres")

	pvc := &corev1.PersistentVolumeClaim{}
	err := r.Get(ctx, types.NamespacedName{Name: pvcName, Namespace: postgres.Namespace}, pvc)
	if err != nil && errors.IsNotFound(err) {
		logger.Info("PVC not found, creating a new one")
		pvc = &corev1.PersistentVolumeClaim{
			ObjectMeta: metav1.ObjectMeta{
				Name:      pvcName,
				Namespace: postgres.Namespace,
				Labels:    map[string]string{"app": postgres.Name},
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
		if err := controllerutil.SetControllerReference(postgres, pvc, r.Scheme); err != nil {
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

func (r *PostgresReconciler) ensurePod(ctx context.Context, postgres *postgresv1.Postgres) error {
	logger := r.Log.WithValues("namespace", postgres.Namespace, "postgres", postgres.Name)
	logger.Info("Ensuring Pod for Postgres")

	pod := r.newPodForCR(postgres)
	foundPod := &corev1.Pod{}
	err := r.Get(ctx, types.NamespacedName{Name: pod.Name, Namespace: pod.Namespace}, foundPod)
	if err != nil && errors.IsNotFound(err) {
		logger.Info("Pod not found, creating a new one")
		if err := controllerutil.SetControllerReference(postgres, pod, r.Scheme); err != nil {
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

func (r *PostgresReconciler) newPodForCR(cr *postgresv1.Postgres) *corev1.Pod {
	logger := r.Log.WithValues("namespace", cr.Namespace, "postgres", cr.Name)
	logger.Info("Creating a new Pod for Postgres")

	labels := map[string]string{
		"app": cr.Name,
	}

	volumes := []corev1.Volume{
		{
			Name: "postgres-data",
			VolumeSource: corev1.VolumeSource{
				PersistentVolumeClaim: &corev1.PersistentVolumeClaimVolumeSource{
					ClaimName: cr.Spec.DataPvcName,
				},
			},
		},
	}

	volumeMounts := []corev1.VolumeMount{
		{
			Name:      "postgres-data",
			MountPath: "/var/lib/postgresql/data",
		},
	}

	if cr.Spec.InitScriptsConfigMap != "" {
		logger.Info("Adding init scripts volume to the Pod")

		volumes = append(volumes, corev1.Volume{
			Name: "init-scripts",
			VolumeSource: corev1.VolumeSource{
				ConfigMap: &corev1.ConfigMapVolumeSource{
					LocalObjectReference: corev1.LocalObjectReference{
						Name: cr.Spec.InitScriptsConfigMap,
					},
				},
			},
		})

		volumeMounts = append(volumeMounts, corev1.VolumeMount{
			Name:      "init-scripts",
			MountPath: "/docker-entrypoint-initdb.d",
		})
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
					Name:  "postgres",
					Image: cr.Spec.Image,
					Ports: []corev1.ContainerPort{{
						ContainerPort: 5432,
					}},
					Env: []corev1.EnvVar{
						{
							Name:  "POSTGRES_DB",
							Value: cr.Spec.DbName,
						},
						{
							Name:  "POSTGRES_USER",
							Value: cr.Spec.DbUser,
						},
						{
							Name:  "POSTGRES_PASSWORD",
							Value: cr.Spec.DbPassword,
						},
						{
							Name:  "POSTGRES_PORT",
							Value: cr.Spec.DbPort,
						},
					},
					VolumeMounts: volumeMounts,
				},
			},
			Volumes: volumes,
		},
	}
}

func (r *PostgresReconciler) updateStatus(ctx context.Context, postgres *postgresv1.Postgres) error {
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
		For(&postgresv1.Postgres{}).
		Owns(&corev1.Pod{}).
		Owns(&corev1.PersistentVolumeClaim{}).
		Complete(r)
}
