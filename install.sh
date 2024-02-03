podman pod create --name scheduler-demo-pod --publish=3306:3306,3000:3000 && 
podman build . -f ./Containerfile.server -t scheduler-demo-server && 
podman build . -f ./Containerfile.database -t scheduler-demo-db &&

podman run -dit --pod=scheduler-demo-pod --name=scheduler-demo-db-1 scheduler-demo-db:latest && 
podman run -dit --pod=scheduler-demo-pod --name=scheduler-demo-server-1 scheduler-demo-server:latest

