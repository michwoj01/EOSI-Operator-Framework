package v1

import (
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// PostgresSpec defines the desired state of Postgres
type PostgresSpec struct {
	Size                 int32  `json:"size"`
	Image                string `json:"image"`
	DbName               string `json:"dbName"`
	DbUser               string `json:"dbUser"`
	DbPassword           string `json:"dbPassword"`
	DbPort               string `json:"dbPort"`
	DataPvcName          string `json:"dataPvcName"`
	InitScriptsConfigMap string `json:"initScriptsConfigMap,omitempty"`
}

// PostgresStatus defines the observed state of Postgres
type PostgresStatus struct {
	Conditions []metav1.Condition `json:"conditions,omitempty"`
	Nodes      []string           `json:"nodes,omitempty"`
}

//+kubebuilder:object:root=true
//+kubebuilder:subresource:status

// Postgres is the Schema for the postgres API
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
