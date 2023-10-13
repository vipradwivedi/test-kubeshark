dependency tester
---

This is a simple tool to test the dependency graph of a region builder.

### Summary

This setup will launch 
1. 2 upstream services are created in 2 namespaces, these run kuberhealthy http check at backend
2. 5 services are created in 5 namespaces, these runs vanilla nginx pod at backend
3. upstream1 calls service1, service2, service5
4. upstream2 calls service3, service4, service5

## Usage

Install kuberhealthy

```bash
kubectl create namespace kuberhealthy
kubectl apply -f https://raw.githubusercontent.com/kuberhealthy/kuberhealthy/master/deploy/kuberhealthy.yaml
```
Setup pods for testing

```bash
kubectl apply -f .
```

Install kubeshark

```bash
brew tap kubeshark/kubeshark
brew install kubeshark
```

Run kubeshark

```bash
kubeshark tap -A
```

`-A`: Is used for all namespaces, refer kubeshark help for more options.
