const { createProxyMiddleware } = require('http-proxy-middleware');

// Proxy target is configured via REACT_APP_API_URL.
// For local dev you can set REACT_APP_API_URL=http://localhost:5001
// In Docker Compose we set REACT_APP_API_URL to http://flask:5001 so the react
// container can reach the flask service by name.

const target = process.env.REACT_APP_API_URL || 'http://localhost:5001';

module.exports = function (app) {
  const proxyOptions = { target, changeOrigin: true };
  app.use('/research_recipe', createProxyMiddleware(proxyOptions));
  app.use('/fr/research_recipe', createProxyMiddleware(proxyOptions));
  app.use('/en/research_recipe', createProxyMiddleware(proxyOptions));
  app.use('/detailed_recipe', createProxyMiddleware(proxyOptions));
  app.use('/image_ingredient', createProxyMiddleware(proxyOptions));
  app.use('/recipe_image', createProxyMiddleware(proxyOptions));
  app.use('/favorites', createProxyMiddleware(proxyOptions));
};
