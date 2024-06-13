package controller

import (
	"context"
	"fmt"

	"github.com/go-logr/logr"
	"k8s.io/apimachinery/pkg/api/errors"
	"k8s.io/apimachinery/pkg/api/resource"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/apimachinery/pkg/types"
	ctrl "sigs.k8s.io/controller-runtime"
	"sigs.k8s.io/controller-runtime/pkg/client"
	"sigs.k8s.io/controller-runtime/pkg/log"

	postgresv1 "github.com/michwoj01/EOSI-Operator-Framework/kubernetes-operators/postgres/api/v1"
	appsv1 "k8s.io/api/apps/v1"
	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// PostgresReconciler reconciles a Postgres object
type PostgresReconciler struct {
	client.Client
	Log    logr.Logger
	Scheme *runtime.Scheme
}

//+kubebuilder:rbac:groups=database.mydomain,resources=postgreses,verbs=get;list;watch;create;update;patch;delete
//+kubebuilder:rbac:groups=database.mydomain,resources=postgreses/status,verbs=get;update;patch
//+kubebuilder:rbac:groups=database.mydomain,resources=postgreses/finalizers,verbs=update

func (r *PostgresReconciler) Reconcile(ctx context.Context, req ctrl.Request) (ctrl.Result, error) {
	_ = log.FromContext(ctx)
	logger := r.Log.WithValues("postgres", req.NamespacedName)

	// Fetch the Postgres instance
	postgres := &postgresv1.Postgres{}
	err := r.Get(ctx, req.NamespacedName, postgres)
	if err != nil {
		if errors.IsNotFound(err) {
			logger.Info("Postgres resource not found. Ignoring since object must be deleted.")
			return ctrl.Result{}, nil
		}
		logger.Error(err, "Failed to get Postgres")
		return ctrl.Result{}, err
	}

	// Ensure the PVC exists
	pvc := &corev1.PersistentVolumeClaim{}
	err = r.Get(ctx, types.NamespacedName{Name: postgres.Spec.DataPvcName, Namespace: postgres.Namespace}, pvc)
	if err != nil && errors.IsNotFound(err) {
		// Define a new PVC
		pvc = r.pvcForPostgres(postgres)
		logger.Info("Creating a new PVC", "PVC.Namespace", pvc.Namespace, "PVC.Name", pvc.Name)
		err = r.Create(ctx, pvc)
		if err != nil {
			logger.Error(err, "Failed to create new PVC", "PVC.Namespace", pvc.Namespace, "PVC.Name", pvc.Name)
			return ctrl.Result{}, err
		}
		// PVC created successfully - return and requeue
		return ctrl.Result{Requeue: true}, nil
	} else if err != nil {
		logger.Error(err, "Failed to get PVC")
		return ctrl.Result{}, err
	}

	// Validate required environment variables
	if postgres.Spec.DbName == "" || postgres.Spec.DbUser == "" || postgres.Spec.DbPassword == "" || postgres.Spec.DbPort == 0 {
		logger.Error(nil, "One or more required environment variables are missing", "DbName", postgres.Spec.DbName, "DbUser", postgres.Spec.DbUser, "DbPassword", postgres.Spec.DbPassword, "DbPort", postgres.Spec.DbPort)
		return ctrl.Result{}, errors.NewBadRequest("Missing required environment variables")
	}

	// Check if the Deployment already exists, if not create a new one
	found := &appsv1.Deployment{}
	err = r.Get(ctx, types.NamespacedName{Name: postgres.Name, Namespace: postgres.Namespace}, found)
	if err != nil && errors.IsNotFound(err) {
		// Define a new Deployment
		dep := r.deploymentForPostgres(postgres, logger)
		logger.Info("Creating a new Deployment", "Deployment.Namespace", dep.Namespace, "Deployment.Name", dep.Name)
		err = r.Create(ctx, dep)
		if err != nil {
			logger.Error(err, "Failed to create new Deployment", "Deployment.Namespace", dep.Namespace, "Deployment.Name", dep.Name)
			return ctrl.Result{}, err
		}
		// Deployment created successfully - return and requeue
		logger.Info("Deployment created successfully", "Deployment.Namespace", dep.Namespace, "Deployment.Name", dep.Name)
		return ctrl.Result{Requeue: true}, nil
	} else if err != nil {
		logger.Error(err, "Failed to get Deployment")
		return ctrl.Result{}, err
	}

	// Ensure the deployment size is the same as the spec
	replicas := int32(1) // Default to 1 if not specified
	if postgres.Spec.Replicas != nil {
		replicas = *postgres.Spec.Replicas
		logger.Info("Using specified replicas", "Replicas", replicas)
	} else {
		logger.Info("Replicas not specified, using default value of 1")
	}
	if *found.Spec.Replicas != replicas {
		found.Spec.Replicas = &replicas
		err = r.Update(ctx, found)
		if err != nil {
			logger.Error(err, "Failed to update Deployment", "Deployment.Namespace", found.Namespace, "Deployment.Name", found.Name)
			return ctrl.Result{}, err
		}
		logger.Info("Deployment updated successfully", "Deployment.Namespace", found.Namespace, "Deployment.Name", found.Name, "Replicas", replicas)
	}

	return ctrl.Result{}, nil
}

// pvcForPostgres returns a Postgres PVC object
func (r *PostgresReconciler) pvcForPostgres(m *postgresv1.Postgres) *corev1.PersistentVolumeClaim {
	labels := labelsForPostgres(m.Name)
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

// deploymentForPostgres returns a Postgres Deployment object
func (r *PostgresReconciler) deploymentForPostgres(m *postgresv1.Postgres, logger logr.Logger) *appsv1.Deployment {
	ls := labelsForPostgres(m.Name)
	replicas := int32(1) // Default to 1 if not specified
	if m.Spec.Replicas != nil {
		replicas = *m.Spec.Replicas
		logger.Info("Using specified replicas", "Replicas", replicas)
	} else {
		logger.Info("Replicas not specified, using default value of 1")
	}

	volumes := []corev1.Volume{
		{
			Name: "postgres-storage",
			VolumeSource: corev1.VolumeSource{
				PersistentVolumeClaim: &corev1.PersistentVolumeClaimVolumeSource{
					ClaimName: m.Spec.DataPvcName,
				},
			},
		},
	}

	volumeMounts := []corev1.VolumeMount{
		{
			Name:      "postgres-storage",
			MountPath: "/var/lib/postgresql/data",
		},
	}

	// Add init scripts volume and mount if specified
	if m.Spec.InitScriptsConfigMap != "" {
		logger.Info("Adding init scripts volume to the Pod")

		volumes = append(volumes, corev1.Volume{
			Name: "init-scripts",
			VolumeSource: corev1.VolumeSource{
				ConfigMap: &corev1.ConfigMapVolumeSource{
					LocalObjectReference: corev1.LocalObjectReference{
						Name: m.Spec.InitScriptsConfigMap,
					},
				},
			},
		})

		volumeMounts = append(volumeMounts, corev1.VolumeMount{
			Name:      "init-scripts",
			MountPath: "/docker-entrypoint-initdb.d",
		})
	}

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
						Name:  "postgres",
						Ports: []corev1.ContainerPort{{
							ContainerPort: int32(m.Spec.DbPort),
							Name:          "postgres",
						}},
						Env: []corev1.EnvVar{
							{
								Name:  "POSTGRES_DB",
								Value: m.Spec.DbName,
							},
							{
								Name:  "POSTGRES_USER",
								Value: m.Spec.DbUser,
							},
							{
								Name:  "POSTGRES_PASSWORD",
								Value: m.Spec.DbPassword,
							},
							{
								Name:  "POSTGRES_PORT",
								Value: fmt.Sprintf("%d", m.Spec.DbPort),
							},
						},
						VolumeMounts: volumeMounts,
					}},
					Volumes: volumes,
				},
			},
		},
	}
	// Set Postgres instance as the owner and controller
	ctrl.SetControllerReference(m, dep, r.Scheme)
	return dep
}

// labelsForPostgres returns the labels for selecting the resources
// belonging to the given Postgres CR name.
func labelsForPostgres(name string) map[string]string {
	return map[string]string{"app": "postgres", "postgres_cr": name}
}

func (r *PostgresReconciler) SetupWithManager(mgr ctrl.Manager) error {
	return ctrl.NewControllerManagedBy(mgr).
		For(&postgresv1.Postgres{}).
		Owns(&appsv1.Deployment{}).
		Complete(r)
}
