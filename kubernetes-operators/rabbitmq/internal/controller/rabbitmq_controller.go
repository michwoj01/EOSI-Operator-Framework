/*
Copyright 2024.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package controller

import (
	"context"
	"reflect"

	appsv1 "k8s.io/api/apps/v1"
	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/apimachinery/pkg/types"
	ctrl "sigs.k8s.io/controller-runtime"
	"sigs.k8s.io/controller-runtime/pkg/client"
	"sigs.k8s.io/controller-runtime/pkg/controller/controllerutil"

	"github.com/go-logr/logr"
	appsv1alpha1 "github.com/michwoj01/EOSI-Operator-Framework/kubernetes-operators/rabbitmq/api/v1"
)

// RabbitMQReconciler reconciles a RabbitMQ object
type RabbitMQReconciler struct {
	client.Client
	Log    logr.Logger
	Scheme *runtime.Scheme
}

//+kubebuilder:rbac:groups=apps.pl.edu.agh,resources=rabbitmqs,verbs=get;list;watch;create;update;patch;delete
//+kubebuilder:rbac:groups=apps.pl.edu.agh,resources=rabbitmqs/status,verbs=get;update;patch
//+kubebuilder:rbac:groups=apps.pl.edu.agh,resources=rabbitmqs/finalizers,verbs=update

// Reconcile is part of the main kubernetes reconciliation loop which aims to
// move the current state of the cluster closer to the desired state.
func (r *RabbitMQReconciler) Reconcile(ctx context.Context, req ctrl.Request) (ctrl.Result, error) {
	log := r.Log.WithValues("rabbitmq", req.NamespacedName)

	// Fetch the RabbitMQ instance
	log.Info("Fetching RabbitMQ instance")
	rabbitmq := &appsv1alpha1.RabbitMQ{}
	err := r.Get(ctx, req.NamespacedName, rabbitmq)
	if err != nil {
		if client.IgnoreNotFound(err) != nil {
			log.Error(err, "RabbitMQ resource not found. Ignoring since object must be deleted.")
			return ctrl.Result{}, nil
		}
		log.Error(err, "Failed to get RabbitMQ")
		return ctrl.Result{}, err
	}

	// Define the desired ConfigMap
	configMap := &corev1.ConfigMap{
		ObjectMeta: metav1.ObjectMeta{
			Name:      "rabbitmq-config",
			Namespace: req.Namespace,
		},
		Data: map[string]string{
			"rabbitmq.conf":   rabbitmq.Spec.Config,
			"enabled_plugins": rabbitmq.Spec.Plugins,
		},
	}

	// Check if the ConfigMap already exists
	log.Info("Checking if ConfigMap already exists")
	foundConfigMap := &corev1.ConfigMap{}
	err = r.Get(ctx, types.NamespacedName{Name: configMap.Name, Namespace: configMap.Namespace}, foundConfigMap)
	if err != nil && client.IgnoreNotFound(err) == nil {
		// Create the ConfigMap if it doesn't exist
		log.Info("Creating a new ConfigMap", "ConfigMap.Namespace", configMap.Namespace, "ConfigMap.Name", configMap.Name)
		err = r.Create(ctx, configMap)
		if err != nil {
			log.Error(err, "Failed to create new ConfigMap", "ConfigMap.Namespace", configMap.Namespace, "ConfigMap.Name", configMap.Name)
			return ctrl.Result{}, err
		}
	} else if err == nil {
		// Update the ConfigMap if it exists and is different
		if !reflect.DeepEqual(configMap.Data, foundConfigMap.Data) {
			foundConfigMap.Data = configMap.Data
			log.Info("Updating existing ConfigMap", "ConfigMap.Namespace", foundConfigMap.Namespace, "ConfigMap.Name", foundConfigMap.Name)
			err = r.Update(ctx, foundConfigMap)
			if err != nil {
				log.Error(err, "Failed to update ConfigMap", "ConfigMap.Namespace", foundConfigMap.Namespace, "ConfigMap.Name", foundConfigMap.Name)
				return ctrl.Result{}, err
			}
		}
	} else {
		log.Error(err, "Failed to get ConfigMap")
		return ctrl.Result{}, err
	}

	// Define the desired Deployment
	deployment := &appsv1.Deployment{
		ObjectMeta: metav1.ObjectMeta{
			Name:      "rabbitmq",
			Namespace: req.Namespace,
		},
		Spec: appsv1.DeploymentSpec{
			Replicas: int32Ptr(1),
			Selector: &metav1.LabelSelector{
				MatchLabels: map[string]string{
					"app": "rabbitmq",
				},
			},
			Template: corev1.PodTemplateSpec{
				ObjectMeta: metav1.ObjectMeta{
					Labels: map[string]string{
						"app": "rabbitmq",
					},
				},
				Spec: corev1.PodSpec{
					Containers: []corev1.Container{
						{
							Name:  "rabbitmq",
							Image: rabbitmq.Spec.Image,
							Ports: rabbitmq.Spec.Ports,
							VolumeMounts: []corev1.VolumeMount{
								{
									Name:      "config-volume",
									MountPath: "/etc/rabbitmq",
								},
							},
						},
					},
					Volumes: []corev1.Volume{
						{
							Name: "config-volume",
							VolumeSource: corev1.VolumeSource{
								ConfigMap: &corev1.ConfigMapVolumeSource{
									LocalObjectReference: corev1.LocalObjectReference{
										Name: "rabbitmq-config",
									},
								},
							},
						},
					},
				},
			},
		},
	}

	// Set RabbitMQ instance as the owner and controller
	if err := controllerutil.SetControllerReference(rabbitmq, deployment, r.Scheme); err != nil {
		log.Error(err, "Failed to set owner reference on deployment")
		return ctrl.Result{}, err
	}

	// Check if the Deployment already exists
	log.Info("Checking if Deployment already exists")
	foundDeployment := &appsv1.Deployment{}
	err = r.Get(ctx, types.NamespacedName{Name: deployment.Name, Namespace: deployment.Namespace}, foundDeployment)
	if err != nil && client.IgnoreNotFound(err) == nil {
		// Create the Deployment if it doesn't exist
		log.Info("Creating a new Deployment", "Deployment.Namespace", deployment.Namespace, "Deployment.Name", deployment.Name)
		err = r.Create(ctx, deployment)
		if err != nil {
			log.Error(err, "Failed to create new Deployment", "Deployment.Namespace", deployment.Namespace, "Deployment.Name", deployment.Name)
			return ctrl.Result{}, err
		}
	} else if err == nil {
		// Update the Deployment if it exists and is different
		if !reflect.DeepEqual(deployment.Spec, foundDeployment.Spec) {
			foundDeployment.Spec = deployment.Spec
			log.Info("Updating existing Deployment", "Deployment.Namespace", foundDeployment.Namespace, "Deployment.Name", foundDeployment.Name)
			err = r.Update(ctx, foundDeployment)
			if err != nil {
				log.Error(err, "Failed to update Deployment", "Deployment.Namespace", foundDeployment.Namespace, "Deployment.Name", foundDeployment.Name)
				return ctrl.Result{}, err
			}
		}
	} else {
		log.Error(err, "Failed to get Deployment")
		return ctrl.Result{}, err
	}

	return ctrl.Result{}, nil
}

func (r *RabbitMQReconciler) SetupWithManager(mgr ctrl.Manager) error {
	return ctrl.NewControllerManagedBy(mgr).
		For(&appsv1alpha1.RabbitMQ{}).
		Complete(r)
}

func int32Ptr(i int32) *int32 {
	return &i
}
