## Local k8s cluster tutorial

Start minikube:
```sh
minikube start
```

Configure shell to use docker daemon from minikube clusterapplies only to current shell instance.
For Windows the command differs, check it [here](https://minikube.sigs.k8s.io/docs/handbook/pushing/#1-pushing-directly-to-the-in-cluster-docker-daemon-docker-env).

Keep in mind it is done by setting proper env vars, therefore it applies this setting only to the current shell.
```sh
eval $(minikube docker-env) 
```

Build all docker images using minikube docker daemon:

```sh
cd ecsb-backend && docker build -t game-init -f ecsb-game-init/Dockerfile . && docker build -t moving -f ecsb-moving/Dockerfile .  && docker build -t chat -f ecsb-chat/Dockerfile . && docker build -t game-engine -f ecsb-game-engine/Dockerfile . && docker build -t timer -f ecsb-timer/Dockerfile . 
```

```sh
cd ../ecsb-frontend && docker build -t webapp .
```

Check if images are available:

```sh
docker images
```

Setup kubernetes:
```sh
cd .. && kubectl apply -f chat-pod.yaml,chat-service.yaml,game-engine-pod.yaml,game-init-pod.yaml,game-init-service.yaml,moving-pod.yaml,moving-service.yaml,postgres-claim0-persistentvolumeclaim.yaml,postgres-claim1-persistentvolumeclaim.yaml,postgres-pod.yaml,postgres-service.yaml,rabbitmq-claim0-persistentvolumeclaim.yaml,rabbitmq-claim1-persistentvolumeclaim.yaml,rabbitmq-deployment.yaml,rabbitmq-service.yaml,redis-claim0-persistentvolumeclaim.yaml,redis-pod.yaml,redis-service.yaml,timer-pod.yaml,webapp-deployment.yaml,webapp-service.yaml
```

Check pods statuses:
```sh
kubectl get pods
```
