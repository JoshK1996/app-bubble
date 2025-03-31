// Test script for blog API endpoints
const fetch = require('node-fetch');

console.log('Script started...');

const BASE_URL = 'http://localhost:4000/api';
let authToken = '';

console.log(`Using BASE_URL: ${BASE_URL}`);

async function makeRequest(endpoint, method = 'GET', body = null, token = null) {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const options = {
    method,
    headers,
  };
  
  if (body && (method === 'POST' || method === 'PUT')) {
    options.body = JSON.stringify(body);
  }
  
  console.log(`Making ${method} request to ${endpoint}`);
  
  try {
    console.log(`Sending request to: ${BASE_URL}${endpoint}`);
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const data = await response.json();
    
    console.log(`Response status: ${response.status}`);
    console.log('Response data:', JSON.stringify(data, null, 2));
    
    return { status: response.status, data };
  } catch (error) {
    console.error(`Error making request to ${endpoint}:`, error);
    return { status: 500, error: error.message || 'Unknown error' };
  }
}

async function testPublicEndpoints() {
  console.log('\n--- Testing Public Endpoints ---\n');
  
  try {
    console.log('\n1. Get all published posts:');
    await makeRequest('/blog/posts');
    
    console.log('\n2. Get all categories:');
    await makeRequest('/blog/categories');
    
    console.log('\n3. Get all tags:');
    await makeRequest('/blog/tags');
  } catch (error) {
    console.error('Error in testPublicEndpoints:', error);
  }
}

async function testAuthenticatedEndpoints() {
  console.log('\n--- Testing Authenticated Endpoints ---\n');
  
  try {
    // Login to get auth token
    console.log('\n1. Login:');
    const loginResponse = await makeRequest('/auth/login', 'POST', {
      email: 'admin@example.com',
      password: 'password123'
    });
    
    if (loginResponse.status === 200 && loginResponse.data && loginResponse.data.token) {
      authToken = loginResponse.data.token;
      console.log('Authentication successful!');
      
      // Create a new category
      console.log('\n2. Create a new category:');
      await makeRequest('/blog/categories', 'POST', {
        name: 'Test Category',
        description: 'This is a test category'
      }, authToken);
      
      // Create a new tag
      console.log('\n3. Create a new tag:');
      await makeRequest('/blog/tags', 'POST', {
        name: 'Test Tag',
        description: 'This is a test tag'
      }, authToken);
      
      // Create a new post
      console.log('\n4. Create a new post:');
      await makeRequest('/blog/posts', 'POST', {
        title: 'Test Post',
        content: 'This is a test post content',
        status: 'PUBLISHED',
        categoryIds: [1],
        tagIds: [1]
      }, authToken);
      
      // Get all posts (including drafts) - admin only
      console.log('\n5. Get all posts (including drafts):');
      await makeRequest('/blog/posts/all', 'GET', null, authToken);
    } else {
      console.log('Authentication failed. Cannot test authenticated endpoints.');
      console.log('Login response:', loginResponse);
    }
  } catch (error) {
    console.error('Error in testAuthenticatedEndpoints:', error);
  }
}

async function runTests() {
  try {
    console.log(`Testing API at: ${BASE_URL}`);
    await testPublicEndpoints();
    await testAuthenticatedEndpoints();
    console.log('\n--- All tests completed ---');
  } catch (error) {
    console.error('Error running tests:', error);
  }
}

// Run the tests
console.log('Starting tests...');
runTests().then(() => {
  console.log('Tests execution completed');
}).catch(error => {
  console.error('Unhandled error in tests:', error);
}).finally(() => {
  console.log('Script finished execution');
}); 