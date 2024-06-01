## Local k8s cluster tutorial

Start minikube and mount db scripts:
```sh
minikube start
minikube mount ./dbscripts:/dbscripts #temorary, we want to copy scripts to node
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

Check cluster dashboard:
```sh
minikube dashboard
```