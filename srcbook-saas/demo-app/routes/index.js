var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { 
    title: 'SrcBook SaaS Platform Demo',
    description: 'A comprehensive platform for managing code repositories, deployments, and team collaboration.',
    endpoints: [
      { method: 'GET', path: '/health', description: 'API health check' },
      { method: 'POST', path: '/api/auth/login', description: 'User login' },
      { method: 'GET', path: '/api/users/me', description: 'Current user profile' },
      { method: 'GET', path: '/api/users', description: 'List all users' },
      { method: 'GET', path: '/api/workspaces', description: 'List all workspaces' },
      { method: 'GET', path: '/api/workspaces/:id', description: 'Get workspace details' },
      { method: 'GET', path: '/api/projects', description: 'List all projects' },
      { method: 'GET', path: '/api/workspaces/:workspaceId/projects', description: 'List workspace projects' }
    ],
    credentials: {
      email: 'admin@example.com',
      password: 'admin123'
    }
  });
});

module.exports = router;