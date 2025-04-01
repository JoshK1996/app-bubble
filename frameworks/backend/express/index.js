const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the Express API',
    endpoints: [
      { method: 'GET', path: '/', description: 'API information' },
      { method: 'GET', path: '/api/items', description: 'Get all items' },
      { method: 'POST', path: '/api/items', description: 'Create a new item' },
      { method: 'GET', path: '/api/items/:id', description: 'Get item by ID' },
      { method: 'PUT', path: '/api/items/:id', description: 'Update item by ID' },
      { method: 'DELETE', path: '/api/items/:id', description: 'Delete item by ID' }
    ]
  });
});

// Sample API routes
const items = [
  { id: 1, name: 'Item 1', description: 'This is item 1' },
  { id: 2, name: 'Item 2', description: 'This is item 2' }
];

app.get('/api/items', (req, res) => {
  res.json(items);
});

app.post('/api/items', (req, res) => {
  const newItem = {
    id: items.length + 1,
    name: req.body.name,
    description: req.body.description
  };
  
  items.push(newItem);
  res.status(201).json(newItem);
});

app.get('/api/items/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const item = items.find(item => item.id === id);
  
  if (!item) {
    return res.status(404).json({ message: 'Item not found' });
  }
  
  res.json(item);
});

app.put('/api/items/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const itemIndex = items.findIndex(item => item.id === id);
  
  if (itemIndex === -1) {
    return res.status(404).json({ message: 'Item not found' });
  }
  
  items[itemIndex] = {
    id,
    name: req.body.name || items[itemIndex].name,
    description: req.body.description || items[itemIndex].description
  };
  
  res.json(items[itemIndex]);
});

app.delete('/api/items/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const itemIndex = items.findIndex(item => item.id === id);
  
  if (itemIndex === -1) {
    return res.status(404).json({ message: 'Item not found' });
  }
  
  const deletedItem = items[itemIndex];
  items.splice(itemIndex, 1);
  
  res.json(deletedItem);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
