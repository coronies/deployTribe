// Add process polyfill
window.process = {
  env: {
    NODE_ENV: process.env.NODE_ENV
  }
}; 