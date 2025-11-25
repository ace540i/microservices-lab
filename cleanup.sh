#!/bin/bash

echo "Deleting Kubernetes resources..."
kubectl delete -f k8s/istio-destinationrules.yaml
kubectl delete -f k8s/istio-gateway.yaml
kubectl delete -f k8s/random-words.yaml
kubectl delete -f k8s/frontend.yaml
kubectl delete -f k8s/backend.yaml
kubectl delete -f k8s/database.yaml
kubectl delete -f k8s/namespace.yaml

echo ""
echo "Cleanup complete!"
