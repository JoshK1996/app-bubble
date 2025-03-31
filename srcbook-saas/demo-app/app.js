var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

// Set up main routes
app.use('/', indexRouter);
app.use('/users', usersRouter);

// Mock data for demo
const mockUsers = [
  { id: 1, name: 'Admin User', email: 'admin@example.com', role: 'admin', avatar: 'https://i.pravatar.cc/150?img=1' },
  { id: 2, name: 'John Developer', email: 'john@example.com', role: 'developer', avatar: 'https://i.pravatar.cc/150?img=2' },
  { id: 3, name: 'Jane Manager', email: 'jane@example.com', role: 'manager', avatar: 'https://i.pravatar.cc/150?img=3' }
];

const mockWorkspaces = [
  { 
    id: "w1", 
    name: 'Main Workspace', 
    description: 'Main development workspace',
    projects: [
      { id: "p1", name: 'Frontend App', description: 'React frontend application', status: 'active' },
      { id: "p2", name: 'Backend API', description: 'Node.js API server', status: 'active' }
    ],
    members: [1, 2, 3],
    owner: "u1",
    memberCount: 3,
    projectCount: 2
  },
  { 
    id: "w2", 
    name: 'Client Project', 
    description: 'Company marketing website',
    projects: [
      { id: "p3", name: 'Landing Page', description: 'Company landing page', status: 'active' }
    ],
    members: [1, 3],
    owner: "u3",
    memberCount: 2,
    projectCount: 1
  }
];

const mockProjects = [
  {
    id: "p1",
    name: "Frontend App",
    description: "React application for customer portal",
    repository: "https://github.com/srcbook/frontend-app",
    createdAt: "2023-01-15T10:30:00Z",
    updatedAt: "2023-03-20T14:45:00Z",
    workspaceId: "w1",
    workspaceName: "Main Workspace"
  },
  {
    id: "p2",
    name: "API Server",
    description: "Backend API for customer portal",
    repository: "https://github.com/srcbook/api-server",
    createdAt: "2023-01-20T11:15:00Z",
    updatedAt: "2023-03-18T09:30:00Z",
    workspaceId: "w1",
    workspaceName: "Main Workspace"
  },
  {
    id: "p3",
    name: "Client Dashboard",
    description: "Analytics dashboard for client",
    repository: "https://github.com/srcbook/client-dashboard",
    createdAt: "2023-02-10T13:45:00Z",
    updatedAt: "2023-03-15T16:20:00Z",
    workspaceId: "w2",
    workspaceName: "Client Project"
  }
];

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Auth routes
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Simple mock authentication
  const user = mockUsers.find(u => u.email === email);
  
  if (user && password === 'admin123') {
    res.json({
      success: true,
      message: 'Authentication successful',
      token: 'mock-jwt-token-' + user.id,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }
});

// User routes
app.get('/api/users/me', (req, res) => {
  // Normally would verify token and get the actual user
  // For demo, just return the first user
  res.json(mockUsers[0]);
});

app.get('/api/users', (req, res) => {
  res.json(mockUsers);
});

// Workspace routes
app.get('/api/workspaces', (req, res) => {
  res.json(mockWorkspaces);
});

app.get('/api/workspaces/:id', (req, res) => {
  const workspace = mockWorkspaces.find(w => w.id === req.params.id);
  
  if (workspace) {
    // Add member details
    const workspaceWithMembers = {
      ...workspace,
      members: workspace.members.map(memberId => {
        const user = mockUsers.find(u => u.id === memberId);
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar
        };
      })
    };
    
    res.json(workspaceWithMembers);
  } else {
    res.status(404).json({ message: 'Workspace not found' });
  }
});

// Project routes
app.get('/api/projects', (req, res) => {
  res.json(mockProjects);
});

app.get('/api/workspaces/:workspaceId/projects', (req, res) => {
  const workspace = mockWorkspaces.find(w => w.id === req.params.workspaceId);
  
  if (workspace) {
    res.json(workspace.projects);
  } else {
    res.status(404).json({ message: 'Workspace not found' });
  }
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;