# Microservices Lab - Kubernetes with Istio Service Mesh

This project demonstrates a microservices architecture deployed on Kubernetes with Istio service mesh, featuring automatic sidecar injection, traffic management, circuit breaking, and observability.

## Architecture

The application consists of 4 services running in a Kubernetes cluster with Istio:

```
┌─────────────────────────────────────────────────────────────┐
│                    Kubernetes Cluster                        │
│                                                              │
│  ┌──────────────┐      ┌──────────────┐                    │
│  │ Frontend Pod │      │ Backend Pod  │                    │
│  │ ┌──────────┐ │      │ ┌──────────┐ │                    │
│  │ │   App    │ │      │ │   App    │ │                    │
│  │ └──────────┘ │      │ └──────────┘ │                    │
│  │ │ Sidecar  │ │      │ │ Sidecar  │ │                    │
│  │ │ (Envoy)  │ │      │ │ (Envoy)  │ │                    │
│  │ └──────────┘ │      │ └──────────┘ │                    │
│  └──────────────┘      └──────────────┘                    │
│                                                              │
│  ┌──────────────┐      ┌──────────────┐                    │
│  │Random-Words  │      │ Database Pod │                    │
│  │     Pod      │      │ ┌──────────┐ │                    │
│  │ ┌──────────┐ │      │ │Postgres  │ │                    │
│  │ │   App    │ │      │ └──────────┘ │                    │
│  │ └──────────┘ │      │ │ Sidecar  │ │                    │
│  │ │ Sidecar  │ │      │ │ (Envoy)  │ │                    │
│  │ │ (Envoy)  │ │      │ └──────────┘ │                    │
│  │ └──────────┘ │      └──────────────┘                    │
│  └──────────────┘                                           │
│                                                              │
│  <--- All traffic flows through sidecars (Envoy) --->       │
│                                                              │
│  Istio Control Plane: Pilot, Mixer, Citadel                │
│  - Traffic routing, retries, circuit breaking               │
│  - mTLS between services                                    │
│  - Metrics, tracing, logging                                │
└─────────────────────────────────────────────────────────────┘
```

## Services

- **Frontend** (port 3000): Web UI serving static files and proxying API requests
- **Backend** (port 5000): REST API connecting to PostgreSQL
- **Random-Words** (port 4000): Microservice generating random words
- **Database** (port 5432): PostgreSQL database with sample data

## Istio Features Configured

### Traffic Management
- **Gateway**: Ingress gateway for external traffic
- **VirtualServices**: Route rules for all services with retries and timeouts
- **DestinationRules**: Load balancing (LEAST_REQUEST, ROUND_ROBIN)

### Resilience
- **Circuit Breaking**: Connection pool limits and outlier detection
- **Retries**: Automatic retry with exponential backoff
- **Timeouts**: Request timeout configuration per service

### Observability
- **Metrics**: Prometheus metrics via Envoy sidecars
- **Tracing**: Distributed tracing with Jaeger
- **Logging**: Access logs from all sidecars

## Prerequisites

1. **Kubernetes Cluster** (Minikube, Kind, or cloud provider)
   ```bash
   # Using Minikube
   minikube start --memory=8192 --cpus=4
   ```

2. **Istio** (version 1.20+)
   ```bash
   # Download Istio
   curl -L https://istio.io/downloadIstio | sh -
   cd istio-*
   export PATH=$PWD/bin:$PATH
   
   # Install Istio with demo profile
   istioctl install --set profile=demo -y
   
   # Enable automatic sidecar injection
   kubectl label namespace microservices-lab istio-injection=enabled
   ```

3. **kubectl** configured to connect to your cluster

## Deployment Steps

### 1. Build Docker Images

Build all container images with proper tags:

```bash
cd microservices-lab-kube

# Build frontend
docker build -t microservices-lab-frontend:latest ./frontend

# Build backend
docker build -t microservices-lab-backend:latest ./backend

# Build random-words
docker build -t microservices-lab-random-words:latest ./random-words
```

**For Minikube**: Load images into Minikube's Docker daemon:
```bash
minikube image load microservices-lab-frontend:latest
minikube image load microservices-lab-backend:latest
minikube image load microservices-lab-random-words:latest
```

### 2. Deploy to Kubernetes

Apply all Kubernetes manifests:

```bash
# Create namespace with Istio injection enabled
kubectl apply -f k8s/namespace.yaml

# Deploy services
kubectl apply -f k8s/database.yaml
kubectl apply -f k8s/backend.yaml
kubectl apply -f k8s/frontend.yaml
kubectl apply -f k8s/random-words.yaml

# Apply Istio configurations
kubectl apply -f k8s/istio-gateway.yaml
kubectl apply -f k8s/istio-destinationrules.yaml
```

### 3. Verify Deployment

Check that all pods are running with sidecars injected:

```bash
# Check pods (should show 2/2 containers per pod)
kubectl get pods -n microservices-lab

# Check services
kubectl get svc -n microservices-lab

# Check Istio resources
kubectl get gateway,virtualservice,destinationrule -n microservices-lab
```

### 4. Access the Application

Get the Istio ingress gateway URL:

```bash
# For Minikube
minikube tunnel  # Run in separate terminal
export INGRESS_HOST=$(kubectl -n istio-system get service istio-ingressgateway -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
export INGRESS_PORT=$(kubectl -n istio-system get service istio-ingressgateway -o jsonpath='{.spec.ports[?(@.name=="http2")].port}')

# Access application
echo "http://$INGRESS_HOST:$INGRESS_PORT"
```

Or port-forward for local access:
```bash
kubectl port-forward -n istio-system svc/istio-ingressgateway 8080:80
# Access at http://localhost:8080
```

## Istio Observability

### Kiali Dashboard (Service Mesh Visualization)

```bash
# Install Kiali
kubectl apply -f https://raw.githubusercontent.com/istio/istio/release-1.20/samples/addons/kiali.yaml

# Access dashboard
istioctl dashboard kiali
```

### Prometheus (Metrics)

```bash
# Install Prometheus
kubectl apply -f https://raw.githubusercontent.com/istio/istio/release-1.20/samples/addons/prometheus.yaml

# Access dashboard
istioctl dashboard prometheus
```

### Jaeger (Distributed Tracing)

```bash
# Install Jaeger
kubectl apply -f https://raw.githubusercontent.com/istio/istio/release-1.20/samples/addons/jaeger.yaml

# Access dashboard
istioctl dashboard jaeger
```

### Grafana (Metrics Visualization)

```bash
# Install Grafana
kubectl apply -f https://raw.githubusercontent.com/istio/istio/release-1.20/samples/addons/grafana.yaml

# Access dashboard
istioctl dashboard grafana
```

## Testing Istio Features

### Test Circuit Breaking

Generate load to trigger circuit breaker:

```bash
# Install fortio load testing tool
kubectl apply -f https://raw.githubusercontent.com/istio/istio/release-1.20/samples/httpbin/sample-client/fortio-deploy.yaml

# Run load test
kubectl exec -n microservices-lab $(kubectl get pod -n microservices-lab -l app=fortio -o jsonpath='{.items[0].metadata.name}') -c fortio -- /usr/bin/fortio load -c 3 -qps 0 -n 30 -loglevel Warning http://backend:5000/api
```

### Test Fault Injection

Add fault injection to test resilience:

```bash
kubectl apply -f - <<EOF
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: backend-fault
  namespace: microservices-lab
spec:
  hosts:
  - backend
  http:
  - fault:
      delay:
        percentage:
          value: 10
        fixedDelay: 5s
    route:
    - destination:
        host: backend
        subset: v1
EOF
```

### View Service Metrics

```bash
# Check metrics from backend service
kubectl exec -n microservices-lab $(kubectl get pod -n microservices-lab -l app=backend -o jsonpath='{.items[0].metadata.name}') -c istio-proxy -- pilot-agent request GET stats | grep backend
```

## Cleanup

Remove all resources:

```bash
# Delete application
kubectl delete -f k8s/

# Uninstall Istio
istioctl uninstall --purge -y
kubectl delete namespace istio-system

# Delete namespace
kubectl delete namespace microservices-lab
```

## Architecture Benefits

1. **Traffic Management**: Fine-grained control over traffic routing, retries, timeouts
2. **Security**: Automatic mTLS encryption between services
3. **Observability**: Built-in metrics, logs, and distributed tracing
4. **Resilience**: Circuit breaking, outlier detection, fault injection
5. **Zero Code Changes**: All features enabled via configuration, no app code changes

## Comparing to Docker Compose

| Feature | Docker Compose | Kubernetes + Istio |
|---------|---------------|-------------------|
| Orchestration | Single host | Multi-node cluster |
| Scaling | Manual | Automatic (HPA) |
| Service Discovery | DNS | DNS + Service mesh |
| Load Balancing | Round-robin | Smart (Least Request, etc.) |
| Circuit Breaking | None | Built-in |
| mTLS | Manual | Automatic |
| Observability | Basic logs | Metrics, traces, logs |
| Traffic Control | Basic proxy | Advanced routing |

## Next Steps

- Configure autoscaling with HPA
- Add canary deployments
- Implement A/B testing with traffic splitting
- Set up monitoring alerts
- Configure mutual TLS policies
- Add authorization policies
