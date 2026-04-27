const express = require('express');
const client  = require('prom-client');
const app = express();
const PORT = process.env.PORT || 3000;

// ── Prometheus metrics setup ──────────────────────
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({ timeout: 5000 });

const httpRequestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status']
});

const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_ms',
  help: 'HTTP request duration in milliseconds',
  labelNames: ['method', 'route'],
  buckets: [50, 100, 200, 500, 1000]
});

// ── Middleware to track all requests ─────────────
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    httpRequestCounter.inc({
      method: req.method,
      route:  req.path,
      status: res.statusCode
    });
    httpRequestDuration.observe(
      { method: req.method, route: req.path },
      duration
    );
  });
  next();
});

// ── Routes ────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    status:  'success',
    message: 'Hello ImmverseAI Team, Sample App is running!',
    version: process.env.IMAGE_TAG || '1.0.0',
    environment: 'AWS EKS',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Prometheus scrape endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
