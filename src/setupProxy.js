// src/setupProxy.js

const { createProxyMiddleware } = require('http-proxy-middleware');
require('dotenv').config(); // Ensure environment variables are loaded

module.exports = function (app) {
  app.use(
    '/api/claude',
    createProxyMiddleware({
      target: 'http://localhost:3001', // Proxy to your backend server
      changeOrigin: true,
      pathRewrite: {
        '^/api/claude': '/api/claude', // Keep the path consistent
      },
      onProxyReq: function (proxyReq, req, res) {
        // Optional: Add any additional headers if needed
        proxyReq.setHeader('Content-Type', 'application/json');
      },
      onError: function (err, req, res) {
        console.error('Proxy Error:', err);
        res.status(500).json({ error: 'Proxy encountered an error.' });
      },
    })
  );
};