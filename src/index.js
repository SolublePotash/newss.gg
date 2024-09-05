const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const url = require('url');

const app = express();

// Middleware to add headers to allow embedding in any iframe
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'ALLOWALL');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  next();
});

// Dynamic proxy middleware
app.use('/proxy', (req, res, next) => {
  const targetUrl = req.query.url;

  if (!targetUrl) {
    res.status(400).send('No target URL provided');
    return;
  }

  const parsedUrl = url.parse(targetUrl);

  createProxyMiddleware({
    target: `${parsedUrl.protocol}//${parsedUrl.host}`,
    changeOrigin: true,
    pathRewrite: {
      '^/proxy': '', // Remove /proxy from the path
    },
    onProxyReq: (proxyReq, req, res) => {
      proxyReq.setHeader('Host', parsedUrl.host); // Set host header for proxied request
    },
    onProxyRes: (proxyRes) => {
      proxyRes.headers['X-Frame-Options'] = 'ALLOWALL';
    },
    logLevel: 'debug', // For logging
  })(req, res, next);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Dynamic proxy server is running on port ${PORT}`);
});
