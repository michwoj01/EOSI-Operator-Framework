package v1

import (
	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// PostgresSpec defines the desired state of Postgres
type PostgresSpec struct {
	Containers    []corev1.Container   `json:"containers,omitempty"`
	RestartPolicy corev1.RestartPolicy `json:"restartPolicy,omitempty"`
	Volumes       []corev1.Volume      `json:"volumes,omitempty"`
}

// PostgresStatus defines the observed state of Postgres
type PostgresStatus struct {
	Conditions []metav1.Condition `json:"conditions,omitempty"`
	Nodes      []string           `json:"nodes,omitempty"`
}

//+kubebuilder:object:root=true
//+kubebuilder:subresource:status

// Postgres is the Schema for the postgress API
type Postgres struct {
	metav1.TypeMeta   `json:",inline"`
	metav1.ObjectMeta `json:"metadata,omitempty"`

	Spec   PostgresSpec   `json:"spec,omitempty"`
	Status PostgresStatus `json:"status,omitempty"`
}

//+kubebuilder:object:root=true

// PostgresList contains a list of Postgres
type PostgresList struct {
	metav1.TypeMeta `json:",inline"`
	metav1.ListMeta `json:"metadata,omitempty"`
	Items           []Postgres `json:"items"`
}

func init() {
	SchemeBuilder.Register(&Postgres{}, &PostgresList{})
}
