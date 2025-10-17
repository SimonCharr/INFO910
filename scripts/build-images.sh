#!/bin/bash

echo "Building Docker images for Todo App..."

# Build backend image
echo "Building backend image..."
docker build -t todo-backend:latest ./backend

# Build frontend image
echo "Building frontend image..."
docker build -t todo-frontend:latest ./frontend

echo "Docker images built successfully!"
echo ""
echo "Images created:"
docker images | grep todo
