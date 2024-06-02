package controllers

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
	"sigs.k8s.io/controller-runtime/pkg/log"

	databasev1 "github.com/michwoj01/EOSI-Operator-Framework/kubernetes-operators/api/v1"
)

// PostgresReconciler reconciles a Postgres object
type PostgresReconciler struct {
	client.Client
	Log    logr.Logger
	Scheme *runtime.Scheme
}

// +kubebuilder:rbac:groups=database.pl.edu.agh.operators,resources=postgres,verbs=get;list;watch;create;update;patch;delete
// +kubebuilder:rbac:groups=database.pl.edu.agh.operators,resources=postgres/status,verbs=get;update;patch
// +kubebuilder:rbac:groups=database.pl.edu.agh.operators,resources=postgres/finalizers,verbs=update

func (r *PostgresReconciler) Reconcile(ctx context.Context, req ctrl.Request) (ctrl.Result, error) {
	_ = log.FromContext(ctx)

	// Fetch the Postgres instance
	postgres := &databasev1.Postgres{}
	err := r.Get(ctx, req.NamespacedName, postgres)
	if err != nil {
		if errors.IsNotFound(err) {
			// Request object not found, could have been deleted after reconcile request.
			// Owned objects are automatically garbage collected. For additional cleanup logic use finalizers.
			// Return and don't requeue
			return ctrl.Result{}, nil
		}
		// Error reading the object - requeue the request.
		return ctrl.Result{}, err
	}

	// Ensure PVC exists
	_, err = r.ensurePVC(ctx, postgres)
	if err != nil {
		return ctrl.Result{}, err
	}

	// Define a new Pod object
	pod := r.newPodForCR(postgres)

	// Set Postgres instance as the owner and controller
	if err := controllerutil.SetControllerReference(postgres, pod, r.Scheme); err != nil {
		return ctrl.Result{}, err
	}

	// Check if the Pod already exists
	found := &corev1.Pod{}
	err = r.Get(ctx, types.NamespacedName{Name: pod.Name, Namespace: pod.Namespace}, found)
	if err != nil && errors.IsNotFound(err) {
		err = r.Create(ctx, pod)
		if err != nil {
			return ctrl.Result{}, err
		}
		// Pod created successfully - return and requeue
		return ctrl.Result{Requeue: true}, nil
	} else if err != nil {
		return ctrl.Result{}, err
	}

	// Update the Postgres status with the pod names
	podNames := []string{found.Name}
	if !reflect.DeepEqual(podNames, postgres.Status.Nodes) {
		postgres.Status.Nodes = podNames
		err := r.Status().Update(ctx, postgres)
		if err != nil {
			return ctrl.Result{}, err
		}
	}

	return ctrl.Result{}, nil
}

func (r *PostgresReconciler) newPodForCR(cr *databasev1.Postgres) *corev1.Pod {
	labels := map[string]string{
		"app": cr.Name,
	}
	return &corev1.Pod{
		ObjectMeta: metav1.ObjectMeta{
			Name:      cr.Name + "-pod",
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
				VolumeMounts: []corev1.VolumeMount{{
					Name:      "dbscripts",
					MountPath: "/docker-entrypoint-initdb.d",
				}, {
					Name:      "postgres-data",
					MountPath: "/var/lib/postgresql/data",
				}},
			}},
			Volumes: []corev1.Volume{{
				Name: "dbscripts",
				VolumeSource: corev1.VolumeSource{
					HostPath: &corev1.HostPathVolumeSource{
						Path: cr.Spec.DbScriptsPath,
					},
				},
			}, {
				Name: "postgres-data",
				VolumeSource: corev1.VolumeSource{
					PersistentVolumeClaim: &corev1.PersistentVolumeClaimVolumeSource{
						ClaimName: cr.Name + "-data",
					},
				},
			}},
		},
	}
}

func (r *PostgresReconciler) ensurePVC(ctx context.Context, postgres *databasev1.Postgres) (*corev1.PersistentVolumeClaim, error) {
	pvc := &corev1.PersistentVolumeClaim{}
	err := r.Get(ctx, types.NamespacedName{Name: postgres.Name + "-data", Namespace: postgres.Namespace}, pvc)
	if err != nil && errors.IsNotFound(err) {
		// Define a new PVC
		pvc = &corev1.PersistentVolumeClaim{
			ObjectMeta: metav1.ObjectMeta{
				Name:      postgres.Name + "-data",
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
			return nil, err
		}
		err = r.Create(ctx, pvc)
		if err != nil {
			return nil, err
		}
	} else if err != nil {
		return nil, err
	}
	return pvc, nil
}

func (r *PostgresReconciler) SetupWithManager(mgr ctrl.Manager) error {
	return ctrl.NewControllerManagedBy(mgr).
		For(&databasev1.Postgres{}).
		Complete(r)
}
