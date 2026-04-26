// const express = require('express');
// const app = express();
// const PORT = process.env.PORT || 3000;

// app.get('/', (req, res) => res.json({ message: 'Hello from My-CI/CD!' }));
// app.get('/health', (req, res) => res.json({ status: 'ok' }));

// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.json({
    status:  'success',
    message: 'Sample App is running!',
    version: process.env.IMAGE_TAG || '1.0.0',
    environment: 'AWS EKS',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});