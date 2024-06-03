#!/bin/sh

# Create the configmap for the postgres init scripts or update it if it already exists
kubectl create configmap postgres-init-scripts --from-file=../dbscripts --dry-run=client -o yaml | kubectl apply -f -

# Apply all the kubernetes resources
kubectl apply -k .
