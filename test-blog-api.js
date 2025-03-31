/**
 * Simple script to test the blog API endpoints
 */
const fetch = require('node-fetch');

// API base URL
const BASE_URL = 'http://localhost:4000/api';
let authToken = '';

// Helper function to make API requests
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
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const data = await response.json();
    
    console.log(`Response status: ${response.status}`);
    console.log('Response data:', JSON.stringify(data, null, 2));
    
    return { status: response.status, data };
  } catch (error) {
    console.error(`Error making request to ${endpoint}:`, error.message);
    throw error;
  }
}

// Test functions
async function testPublicEndpoints() {
  console.log('\n--- Testing Public Endpoints ---\n');
  
  console.log('\n1. Get all published posts:');
  await makeRequest('/blog/posts');
  
  console.log('\n2. Get all categories:');
  await makeRequest('/blog/categories');
  
  console.log('\n3. Get all tags:');
  await makeRequest('/blog/tags');
}

async function testAuthenticatedEndpoints() {
  console.log('\n--- Testing Authenticated Endpoints ---\n');
  
  // Login to get auth token
  console.log('\n1. Login:');
  const loginResponse = await makeRequest('/auth/login', 'POST', {
    email: 'admin@example.com',
    password: 'password123'
  });
  
  if (loginResponse.status === 200 && loginResponse.data.token) {
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
  }
}

// Run the tests
async function runTests() {
  try {
    await testPublicEndpoints();
    await testAuthenticatedEndpoints();
    console.log('\n--- All tests completed ---');
  } catch (error) {
    console.error('Error running tests:', error);
  }
}

runTests(); 