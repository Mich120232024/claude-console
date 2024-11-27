// src/setupProxy.js
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api/claude',
    createProxyMiddleware({
      target: 'https://api.anthropic.com/v1/messages',
      changeOrigin: true,
      pathRewrite: {
        '^/api/claude': ''
      },
      onProxyReq: (proxyReq, req, res) => {
        if (req.body) {
          const { apiKey, ...bodyWithoutApiKey } = req.body;
          proxyReq.setHeader('anthropic-api-key', apiKey);
          proxyReq.setHeader('anthropic-version', '2023-06-01');
          const bodyData = JSON.stringify(bodyWithoutApiKey);
          proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
          proxyReq.write(bodyData);
        }
      },
    })
  );
};