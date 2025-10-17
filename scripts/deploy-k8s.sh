#!/bin/bash

echo "Deploying Todo App to Kubernetes..."

# Create namespace (optional)
# kubectl apply -f k8s/namespace.yaml

# Apply persistent volume
echo "Creating persistent volume..."
kubectl apply -f k8s/mongodb-pv.yaml

# Deploy MongoDB
echo "Deploying MongoDB..."
kubectl apply -f k8s/mongodb-deployment.yaml

# Wait for MongoDB to be ready
echo "Waiting for MongoDB to be ready..."
kubectl wait --for=condition=ready pod -l app=mongodb --timeout=120s

# Deploy Backend
echo "Deploying Backend..."
kubectl apply -f k8s/backend-deployment.yaml

# Wait for Backend to be ready
echo "Waiting for Backend to be ready..."
kubectl wait --for=condition=ready pod -l app=backend --timeout=120s

# Deploy Frontend
echo "Deploying Frontend..."
kubectl apply -f k8s/frontend-deployment.yaml

# Wait for Frontend to be ready
echo "Waiting for Frontend to be ready..."
kubectl wait --for=condition=ready pod -l app=frontend --timeout=120s

echo ""
echo "Deployment complete!"
echo ""
echo "Check the status with:"
echo "  kubectl get all"
echo ""
echo "Access the application at:"
echo "  minikube service frontend --url"
echo "  or http://localhost:30080 (if using port forwarding)"
