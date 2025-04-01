#!/usr/bin/env python3

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import uvicorn

app = FastAPI(
    title="FastAPI Sample",
    description="A sample FastAPI application with CRUD operations",
    version="1.0.0"
)

# Data model
class Item(BaseModel):
    name: str
    description: str

class ItemResponse(Item):
    id: int

# Sample data
items = [
    {"id": 1, "name": "Item 1", "description": "This is item 1"},
    {"id": 2, "name": "Item 2", "description": "This is item 2"}
]

@app.get("/")
def read_root():
    return {
        "message": "Welcome to the FastAPI API",
        "endpoints": [
            {"method": "GET", "path": "/", "description": "API information"},
            {"method": "GET", "path": "/api/items", "description": "Get all items"},
            {"method": "POST", "path": "/api/items", "description": "Create a new item"},
            {"method": "GET", "path": "/api/items/{item_id}", "description": "Get item by ID"},
            {"method": "PUT", "path": "/api/items/{item_id}", "description": "Update item by ID"},
            {"method": "DELETE", "path": "/api/items/{item_id}", "description": "Delete item by ID"}
        ]
    }

@app.get("/api/items", response_model=List[ItemResponse])
def get_items():
    return items

@app.post("/api/items", response_model=ItemResponse, status_code=201)
def create_item(item: Item):
    new_item = {
        "id": len(items) + 1,
        **item.dict()
    }
    items.append(new_item)
    return new_item

@app.get("/api/items/{item_id}", response_model=ItemResponse)
def get_item(item_id: int):
    item = next((item for item in items if item["id"] == item_id), None)
    if item is None:
        raise HTTPException(status_code=404, detail="Item not found")
    return item

@app.put("/api/items/{item_id}", response_model=ItemResponse)
def update_item(item_id: int, item_update: Item):
    item = next((item for item in items if item["id"] == item_id), None)
    if item is None:
        raise HTTPException(status_code=404, detail="Item not found")
    
    item.update({
        "name": item_update.name,
        "description": item_update.description
    })
    
    return item

@app.delete("/api/items/{item_id}", response_model=ItemResponse)
def delete_item(item_id: int):
    global items
    item = next((item for item in items if item["id"] == item_id), None)
    if item is None:
        raise HTTPException(status_code=404, detail="Item not found")
    
    items = [i for i in items if i["id"] != item_id]
    return item

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
