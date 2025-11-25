#!/bin/bash

# Build and load images for Minikube
echo "Building Docker images..."
docker build -t microservices-lab-frontend:latest ./frontend
docker build -t microservices-lab-backend:latest ./backend
docker build -t microservices-lab-random-words:latest ./random-words

echo "Loading images into Minikube..."
minikube image load microservices-lab-frontend:latest
minikube image load microservices-lab-backend:latest
minikube image load microservices-lab-random-words:latest

echo "Applying Kubernetes manifests..."
kubectl apply -f k8s/namespace.yaml
sleep 2

kubectl apply -f k8s/database.yaml
kubectl apply -f k8s/backend.yaml
kubectl apply -f k8s/frontend.yaml
kubectl apply -f k8s/random-words.yaml

echo "Applying Istio configurations..."
kubectl apply -f k8s/istio-gateway.yaml
kubectl apply -f k8s/istio-destinationrules.yaml

echo ""
echo "Waiting for pods to be ready..."
kubectl wait --for=condition=ready pod -l app=frontend -n microservices-lab --timeout=120s
kubectl wait --for=condition=ready pod -l app=backend -n microservices-lab --timeout=120s
kubectl wait --for=condition=ready pod -l app=random-words -n microservices-lab --timeout=120s
kubectl wait --for=condition=ready pod -l app=postgres -n microservices-lab --timeout=120s

echo ""
echo "Deployment complete!"
echo ""
echo "Check pod status:"
echo "  kubectl get pods -n microservices-lab"
echo ""
echo "Access the application:"
echo "  kubectl port-forward -n istio-system svc/istio-ingressgateway 8080:80"
echo "  Then open http://localhost:8080"
echo ""
echo "Open Kiali dashboard:"
echo "  istioctl dashboard kiali"
