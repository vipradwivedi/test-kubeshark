function onItemCaptured(data) {
    if (data.protocol.name !== "http") return;  // ignore non-HTTP traffic
    
    vendor.influxdb(
      env.INFLUXDB_URL,
      env.INFLUXDB_TOKEN,
      "influxdata",                            // Organization
      "default",                         // Bucket
      "PerformanceKPIs" ,        
      {
        latency:    data.elapsedTime
        status:     data.response.status
      },                                        // Key-Value Metrics
      {
        service:    data.dst.name,
        path:       data.request.path,
        namespace:  data.namespace
      }                                         // Key-Value Tags
    );
  }
  