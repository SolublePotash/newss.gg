const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// Middleware to add headers to allow embedding in any iframe
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'ALLOWALL');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  next();
});

// Proxy setup
app.use(
  '/',
  createProxyMiddleware({
    target: 'https://mathsspot.com',
    changeOrigin: true,
    ws: true,
    secure: false,
    onProxyRes: (proxyRes) => {
      proxyRes.headers['X-Frame-Options'] = 'ALLOWALL';
    }
  })
);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Proxy server is running on port ${PORT}`);
});
