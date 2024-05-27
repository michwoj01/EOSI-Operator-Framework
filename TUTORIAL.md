## Local k8s cluster tutorial

Start minikube:
```sh
minikube start
```

Setup kubernetes:
```sh
kubectl apply -f kubernetes -R
```

If you happen to see
```
error looking up service account default/default: serviceaccount "default" not found
```
just rerun the command.

Check pods statuses:
```sh
kubectl get pods
```
