# building images
docker build -t ynno/fibonacci-client:latest -t ynno/fibonacci-client:$GIT_SHA -f ./client/Dockerfile ./client
docker build -t ynno/fibonacci-server:latest -t ynno/fibonacci-server:$GIT_SHA -f ./server/Dockerfile ./server
docker build -t ynno/fibonacci-worker:latest -t ynno/fibonacci-worker:$GIT_SHA -f ./worker/Dockerfile ./worker

# pushing images to docker hub
docker push ynno/fibonacci-client:latest
docker push ynno/fibonacci-server:latest
docker push ynno/fibonacci-worker:latest

docker push ynno/fibonacci-client:$GIT_SHA
docker push ynno/fibonacci-server:$GIT_SHA
docker push ynno/fibonacci-worker:$GIT_SHA

# kubernetes spec
kubectl apply -f ./k8s-specifications
# we want to deploy the latest image built based on the last git sha
kubectl set image deployment/client-deploy client=ynno/fibonacci-client:$GIT_SHA
kubectl set image deployment/server-deploy server=ynno/fibonacci-server:$GIT_SHA
kubectl set image deployment/worker-deploy worker=ynno/fibonacci-worker:$GIT_SHA