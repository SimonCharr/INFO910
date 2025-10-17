#!/bin/bash

echo "Cleaning up Todo App from Kubernetes..."

kubectl delete -f k8s/frontend-deployment.yaml
kubectl delete -f k8s/backend-deployment.yaml
kubectl delete -f k8s/mongodb-deployment.yaml
kubectl delete -f k8s/mongodb-pv.yaml

echo "Cleanup complete!"
