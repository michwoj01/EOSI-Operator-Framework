## Local k8s cluster tutorial

Start minikube and deploy all resources:
```sh
minikube start
```

Setup kubernetes:
```sh
./deploy.sh
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

Check cluster dashboard:
```sh
minikube dashboard
```