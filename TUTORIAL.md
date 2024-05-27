## Local k8s cluster tutorial

Start minikube:
```sh
minikube start
```

Setup kubernetes:
```sh
kubectl apply -f chat-pod.yaml,chat-service.yaml,game-engine-pod.yaml,game-init-pod.yaml,game-init-service.yaml,moving-pod.yaml,moving-service.yaml,postgres-claim0-persistentvolumeclaim.yaml,postgres-claim1-persistentvolumeclaim.yaml,postgres-pod.yaml,postgres-service.yaml,rabbitmq-config-map.yaml,rabbitmq-deployment.yaml,rabbitmq-service.yaml,redis-claim0-persistentvolumeclaim.yaml,redis-pod.yaml,redis-service.yaml,timer-pod.yaml,webapp-deployment.yaml,webapp-service.yaml
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
