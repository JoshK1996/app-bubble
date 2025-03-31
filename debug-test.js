console.log('Debug test started');

const fs = require('fs');
fs.writeFileSync('debug-output.txt', 'Debug test running\n');

try {
  const fetch = require('node-fetch');
  fs.appendFileSync('debug-output.txt', 'node-fetch loaded\n');
  
  console.log('Will try to fetch');
  fs.appendFileSync('debug-output.txt', 'About to make fetch request\n');
  
  fetch('https://jsonplaceholder.typicode.com/todos/1')
    .then(response => {
      fs.appendFileSync('debug-output.txt', `Response status: ${response.status}\n`);
      return response.json();
    })
    .then(data => {
      fs.appendFileSync('debug-output.txt', `Data received: ${JSON.stringify(data)}\n`);
      console.log('Data:', data);
    })
    .catch(error => {
      fs.appendFileSync('debug-output.txt', `Fetch error: ${error}\n`);
      console.error('Error:', error);
    })
    .finally(() => {
      fs.appendFileSync('debug-output.txt', 'Fetch operation completed\n');
      console.log('Fetch operation completed');
    });
} catch (error) {
  fs.appendFileSync('debug-output.txt', `Error loading dependencies: ${error}\n`);
  console.error('Error loading dependencies:', error);
}

console.log('Debug test script execution completed');
fs.appendFileSync('debug-output.txt', 'Debug test script execution completed\n'); 