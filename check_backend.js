const http = require('http');

http.get('http://localhost:3002/health', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log('Health check response:', data);
  });
}).on('error', (err) => {
  console.log('Error reaching backend:', err.message);
});
