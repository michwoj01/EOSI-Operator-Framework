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
	"sigs.k8s.io/controller-runtime/pkg/controller/controllerutil"

	databasev1 "github.com/michwoj01/EOSI-Operator-Framework/kubernetes-operators/postgres/api/v1"
)

// PostgresReconciler reconciles a Postgres object
type PostgresReconciler struct {
	client.Client
	Log    logr.Logger
	Scheme *runtime.Scheme
}

// +kubebuilder:rbac:groups=database.pl.edu.agh,resources=postgres,verbs=get;list;watch;create;update;patch;delete
// +kubebuilder:rbac:groups=database.pl.edu.agh,resources=postgres/status,verbs=get;update;patch
// +kubebuilder:rbac:groups=database.pl.edu.agh,resources=postgres/finalizers,verbs=update

func (r *PostgresReconciler) Reconcile(ctx context.Context, req ctrl.Request) (ctrl.Result, error) {
	// Create a logger with context specific to this reconcile loop
	logger := r.Log.WithValues("namespace", req.Namespace, "postgres", req.Name)
	logger.Info("Reconciling Postgres instance")

	// Fetch the Postgres instance
	logger.Info("Fetching Postgres instance")
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

	// Ensure PVCs exist
	logger.Info("Ensuring PVCs exist")
	if err := r.ensurePVC(ctx, postgres.Spec.DataPvcName, postgres); err != nil {
		logger.Error(err, "Failed to ensure data PVC")
		return ctrl.Result{}, err
	}
	if err := r.ensurePVC(ctx, postgres.Spec.ScriptsPvcName, postgres); err != nil {
		logger.Error(err, "Failed to ensure scripts PVC")
		return ctrl.Result{}, err
	}

	// Check if the Pod already exists
	logger.Info("Checking if the Pod already exists")
	found := &corev1.Pod{}
	err = r.Get(ctx, types.NamespacedName{Name: postgres.Name, Namespace: postgres.Namespace}, found)
	if err != nil && errors.IsNotFound(err) {
		logger.Info("Pod does not exist, will create a new one")
		// Define a new Pod object
		logger.Info("Defining a new Pod object")
		pod := r.newPodForCR(postgres)

		// Set Postgres instance as the owner and controller
		if err := controllerutil.SetControllerReference(postgres, pod, r.Scheme); err != nil {
			logger.Error(err, "Failed to set controller reference")
			return ctrl.Result{}, err
		}

		logger.Info("Creating a new Pod", "Pod.Namespace", pod.Namespace, "Pod.Name", pod.Name)
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
		if !metav1.IsControlledBy(found, postgres) {
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

	// Update the Postgres status with the pod names
	logger.Info("Updating Postgres status with the pod names")
	podNames := []string{found.Name}
	if !reflect.DeepEqual(podNames, postgres.Status.Nodes) {
		postgres.Status.Nodes = podNames
		err := r.Status().Update(ctx, postgres)
		if err != nil {
			logger.Error(err, "Failed to update Postgres status")
			return ctrl.Result{}, err
		}
		logger.Info("Postgres status updated", "Status.Nodes", postgres.Status.Nodes)
	}

	return ctrl.Result{}, nil
}

func (r *PostgresReconciler) newPodForCR(cr *databasev1.Postgres) *corev1.Pod {
	logger := r.Log.WithValues("namespace", cr.Namespace, "postgres", cr.Name)
	logger.Info("Creating a new Pod for Postgres")

	labels := map[string]string{
		"app": cr.Name,
	}

	// Check if required environment variables are set
	if cr.Spec.DbName == "" || cr.Spec.DbUser == "" || cr.Spec.DbPassword == "" || cr.Spec.DbPort == "" {
		errMsg := fmt.Sprintf("Missing required environment variables for Postgres: DbName=%s, DbUser=%s, DbPassword=%s, DbPort=%s",
			cr.Spec.DbName, cr.Spec.DbUser, cr.Spec.DbPassword, cr.Spec.DbPort)
		logger.Error(fmt.Errorf(errMsg), "Environment variables not set")
		return nil
	}

	// Check if required PVCs are set
	if cr.Spec.DataPvcName == "" || cr.Spec.ScriptsPvcName == "" {
		errMsg := fmt.Sprintf("Missing required PVCs for Postgres: DataPvcName=%s, ScriptsPvcName=%s",
			cr.Spec.DataPvcName, cr.Spec.ScriptsPvcName)
		logger.Error(fmt.Errorf(errMsg), "PVCs not set")
		return nil
	}

	return &corev1.Pod{
		ObjectMeta: metav1.ObjectMeta{
			Name:      cr.Name,
			Namespace: cr.Namespace,
			Labels:    labels,
		},
		Spec: corev1.PodSpec{
			Containers: []corev1.Container{{
				Name:  "postgres",
				Image: cr.Spec.Image,
				Ports: []corev1.ContainerPort{{
					ContainerPort: 5432,
					Name:          "postgres",
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
				VolumeMounts: []corev1.VolumeMount{{
					Name:      "postgres-scripts",
					MountPath: "/docker-entrypoint-initdb.d",
				}, {
					Name:      "postgres-data",
					MountPath: "/var/lib/postgresql/data",
				}},
			}},
			Volumes: []corev1.Volume{{
				Name: "postgres-scripts",
				VolumeSource: corev1.VolumeSource{
					PersistentVolumeClaim: &corev1.PersistentVolumeClaimVolumeSource{
						ClaimName: cr.Spec.ScriptsPvcName,
					},
				},
			}, {
				Name: "postgres-data",
				VolumeSource: corev1.VolumeSource{
					PersistentVolumeClaim: &corev1.PersistentVolumeClaimVolumeSource{
						ClaimName: cr.Spec.DataPvcName,
					},
				},
			}},
		},
	}
}

func (r *PostgresReconciler) ensurePVC(ctx context.Context, pvcName string, postgres *databasev1.Postgres) error {
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
		// Set Postgres instance as the owner and controller
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

func (r *PostgresReconciler) SetupWithManager(mgr ctrl.Manager) error {
	logger := r.Log.WithValues("controller", "PostgresReconciler")
	logger.Info("Setting up the controller manager")
	return ctrl.NewControllerManagedBy(mgr).
		For(&databasev1.Postgres{}).
		Owns(&corev1.Pod{}).
		Owns(&corev1.PersistentVolumeClaim{}).
		Complete(r)
}
