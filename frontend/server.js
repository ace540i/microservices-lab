const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = 3000;

// Serve static frontend
app.use(express.static('public'));

// Proxy backend API
app.use('/api', createProxyMiddleware({
  target: 'http://backend:5000',
  changeOrigin: true,
  pathRewrite: {'^/api': ''}
}));

// Proxy random-words service
app.use('/words', createProxyMiddleware({
  target: 'http://random-words:4000',
  changeOrigin: true
}));

app.listen(PORT, () => {
  console.log(`Frontend running on port ${PORT}`);
});
