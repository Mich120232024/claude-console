// [src/setupProxy.js](src/setupProxy.js)
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    '/api/claude',
    createProxyMiddleware({
      target: 'http://localhost:3001', // Replace with your backend server's port if different
      changeOrigin: true,
    })
  );
};