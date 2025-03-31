/**
 * Simple script to test the blog API endpoints
 */
const fetch = require('node-fetch');

// API base URL
const API_BASE = 'http://localhost:4000/api';

// Helper function to make API requests
async function makeRequest(url, method = 'GET', body = null, token = null) {
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

  try {
    const response = await fetch(`${API_BASE}${url}`, options);
    const data = await response.json();
    return {
      status: response.status,
      data,
    };
  } catch (error) {
    console.error(`Error making request to ${url}:`, error);
    return {
      status: 500,
      error: error.message,
    };
  }
}

// Test functions
async function testPublicEndpoints() {
  console.log('Testing public blog endpoints...');
  
  // Get all published posts
  console.log('\nGetting all published posts:');
  const postsResponse = await makeRequest('/blog/posts');
  console.log(`Status: ${postsResponse.status}`);
  console.log('Response:', JSON.stringify(postsResponse.data, null, 2));
  
  // Get all categories
  console.log('\nGetting all categories:');
  const categoriesResponse = await makeRequest('/blog/categories');
  console.log(`Status: ${categoriesResponse.status}`);
  console.log('Response:', JSON.stringify(categoriesResponse.data, null, 2));
  
  // Get all tags
  console.log('\nGetting all tags:');
  const tagsResponse = await makeRequest('/blog/tags');
  console.log(`Status: ${tagsResponse.status}`);
  console.log('Response:', JSON.stringify(tagsResponse.data, null, 2));
}

async function testAuthenticatedEndpoints() {
  console.log('\nTesting authenticated blog endpoints...');
  
  // First login to get a token
  console.log('\nLogging in to get auth token:');
  const loginResponse = await makeRequest('/auth/login', 'POST', {
    email: 'admin@example.com',
    password: 'password123'
  });
  
  if (loginResponse.status !== 200 || !loginResponse.data?.token) {
    console.log('Login failed, cannot test authenticated endpoints');
    console.log('Response:', JSON.stringify(loginResponse.data, null, 2));
    return;
  }
  
  const token = loginResponse.data.token;
  console.log('Login successful, got token');
  
  // Test creating a category
  console.log('\nCreating a new category:');
  const createCategoryResponse = await makeRequest('/blog/admin/categories', 'POST', {
    name: 'Test Category',
    description: 'This is a test category'
  }, token);
  console.log(`Status: ${createCategoryResponse.status}`);
  console.log('Response:', JSON.stringify(createCategoryResponse.data, null, 2));
  
  // Test creating a tag
  console.log('\nCreating a new tag:');
  const createTagResponse = await makeRequest('/blog/admin/tags', 'POST', {
    name: 'Test Tag'
  }, token);
  console.log(`Status: ${createTagResponse.status}`);
  console.log('Response:', JSON.stringify(createTagResponse.data, null, 2));
  
  // Test creating a post
  console.log('\nCreating a new post:');
  const createPostResponse = await makeRequest('/blog/admin/posts', 'POST', {
    title: 'Test Post',
    content: 'This is the content of the test post.',
    excerpt: 'This is a test post excerpt.',
    status: 'PUBLISHED',
    categoryIds: createCategoryResponse.data?.id ? [createCategoryResponse.data.id] : [],
    tagIds: createTagResponse.data?.id ? [createTagResponse.data.id] : []
  }, token);
  console.log(`Status: ${createPostResponse.status}`);
  console.log('Response:', JSON.stringify(createPostResponse.data, null, 2));
}

// Run the tests
async function runTests() {
  try {
    await testPublicEndpoints();
    await testAuthenticatedEndpoints();
    console.log('\nAll tests completed!');
  } catch (error) {
    console.error('Error running tests:', error);
  }
}

runTests(); 