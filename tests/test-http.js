const http = require('http');

http.get('http://localhost:5173/', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('HTTP Status:', res.statusCode);
    console.log('Content-Length:', data.length);
    console.log('Has Plus Jakarta Sans:', data.includes('Plus+Jakarta+Sans'));
    console.log('Has dashboard battery container:', data.includes('id="dashboard-battery-container"'));
    console.log('Has segmented blocks:', data.includes('data-segment="10"'));
    console.log('All HTTP assertions passed successfully!');
  });
}).on('error', (err) => {
  console.error('HTTP Error:', err.message);
  process.exit(1);
});
