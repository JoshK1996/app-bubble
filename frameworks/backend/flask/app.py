#!/usr/bin/env python3

from flask import Flask, jsonify, request

app = Flask(__name__)

# Sample data
items = [
    {"id": 1, "name": "Item 1", "description": "This is item 1"},
    {"id": 2, "name": "Item 2", "description": "This is item 2"}
]

@app.route('/')
def home():
    return jsonify({
        "message": "Welcome to the Flask API",
        "endpoints": [
            {"method": "GET", "path": "/", "description": "API information"},
            {"method": "GET", "path": "/api/items", "description": "Get all items"},
            {"method": "POST", "path": "/api/items", "description": "Create a new item"},
            {"method": "GET", "path": "/api/items/<id>", "description": "Get item by ID"},
            {"method": "PUT", "path": "/api/items/<id>", "description": "Update item by ID"},
            {"method": "DELETE", "path": "/api/items/<id>", "description": "Delete item by ID"}
        ]
    })

@app.route('/api/items', methods=['GET'])
def get_items():
    return jsonify(items)

@app.route('/api/items', methods=['POST'])
def create_item():
    data = request.get_json()
    new_item = {
        "id": len(items) + 1,
        "name": data.get("name"),
        "description": data.get("description")
    }
    items.append(new_item)
    return jsonify(new_item), 201

@app.route('/api/items/<int:item_id>', methods=['GET'])
def get_item(item_id):
    item = next((item for item in items if item["id"] == item_id), None)
    if item is None:
        return jsonify({"message": "Item not found"}), 404
    return jsonify(item)

@app.route('/api/items/<int:item_id>', methods=['PUT'])
def update_item(item_id):
    item = next((item for item in items if item["id"] == item_id), None)
    if item is None:
        return jsonify({"message": "Item not found"}), 404
    
    data = request.get_json()
    item["name"] = data.get("name", item["name"])
    item["description"] = data.get("description", item["description"])
    
    return jsonify(item)

@app.route('/api/items/<int:item_id>', methods=['DELETE'])
def delete_item(item_id):
    global items
    item = next((item for item in items if item["id"] == item_id), None)
    if item is None:
        return jsonify({"message": "Item not found"}), 404
    
    items = [item for item in items if item["id"] != item_id]
    return jsonify(item)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
