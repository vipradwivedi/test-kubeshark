# test-kubeshark

This is a simple setup to test kubeshark.

## Goal

1. You should be able to run some test workload, kuberhealthy, influxdb and kubeshark in local kubernetes cluster.
2. Kubeshark is sending metrics and data to influxDB and metrics browsable over UI dashboard.

## Setup Summary

This setup will launch below apps in local kubernetes cluster

1. influxdb
2. kuberhealthy
3. some test workloads
    1. 2 upstream services are created in 2 namespaces, these run kuberhealthy http check at backend
    2. 5 services are created in 5 namespaces, these runs vanilla nginx pod at backend
    3. upstream1 calls service1, service2, service5
    4. upstream2 calls service3, service4, service5

## Usage

### Install kuberhealthy

```bash
kubectl create namespace kuberhealthy
kubectl apply -f https://raw.githubusercontent.com/kuberhealthy/kuberhealthy/master/deploy/kuberhealthy.yaml
```

### Install influxdb2

```bash
helm repo add influxdata https://helm.influxdata.com/
kubectl create namespace influxdb
helm install -n influxdb influxdb influxdata/influxdb2
```

Port forward to access influxdb UI

```bash
kubectl -n influxdb port-forward service/influxdb-influxdb2 8086:80
```

Use below command to get admin password

```bash
echo $(kubectl -n influxdb get secret influxdb-influxdb2-auth -o "jsonpath={.data['admin-password']}" --namespace influxdb | base64 --decode)
```
Login to influx UI http://0.0.0.0:8086

1. Username: admin
2. Password: Use above command to get UI login password

Login into influx pod to get admin API Token

```bash
kubectl -n influxdb exec -it influxdb-influxdb2-0 -- bash
```

```bash
influx auth list
```

Get API token and save it in kubeshark config.yaml

```yaml
scripting:
  env:
    INFLUXDB_URL: "http://influxdb-influxdb2.influxdb:80"
    INFLUXDB_TOKEN: "get-it-from---influx-auth-list"
  source: "/home/influxdb/"
  watchscripts: true
```

### Setup test workload

```bash
kubectl apply -f workload/.
```

### Install kubeshark

```bash
brew tap kubeshark/kubeshark
brew install kubeshark
```

Copy kubeshark config to default home directory on macbook

```bash
mkdir ~/.kubeshark
cp kubeshark/config.yaml ~/.kubeshark/config.yaml
```

Run kubeshark

```bash
kubeshark tap
```

Open kubeshark UI at http://0.0.0.0:8899

Using Kubeshark UI

1. Set `http` as traffic filter and hit `Apply`
2. Open `Scripting` dialog box
3. Copy `kubeshark/influx-script.js` content and save
4. Head to `Service Map` to see live data

Using Influx UI http://0.0.0.0:8086

1. Goto dashboards and import dashboard, use `influxdb/dashboard.json`.

2. Use below query to plot `API Call Latency Query and a Graph`

    ```bash
    from(bucket: "default")
        |> range(start: v.timeRangeStart, stop: v.timeRangeStop)
        |> filter(fn: (r) => r["_measurement"] == "PerformanceKPIs")
        |> filter(fn: (r) => r["_field"] == "latency")
        |> aggregateWindow(every: v.windowPeriod, fn: mean, createEmpty: false)
        |> yield(name: "mean")
    ```

3. Use below query to plot `API Call Status Code Query and a Graph`

    ```bash
    from(bucket: "default")
        |> range(start: v.timeRangeStart, stop: v.timeRangeStop)
        |> filter(fn: (r) => r["_measurement"] == "PerformanceKPIs")
        |> filter(fn: (r) => r["_field"] == "status")
    ```

## TODO

1. Create namespace dependency queries and save to dashboard (tune influx script if needed)

### Cleanup

```bash
k delete -f workload/
k delete ns influxdb
k delete ns kuberhealthy
kubeshark clean
```
