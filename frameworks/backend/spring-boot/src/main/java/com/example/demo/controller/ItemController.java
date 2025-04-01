package com.example.demo.controller;

import com.example.demo.model.Item;
import com.example.demo.service.ItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ItemController {
    
    private final ItemService itemService;
    
    @Autowired
    public ItemController(ItemService itemService) {
        this.itemService = itemService;
    }
    
    @GetMapping("/")
    public ResponseEntity<Map<String, Object>> getApiInfo() {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Welcome to the Spring Boot API");
        response.put("endpoints", List.of(
            Map.of("method", "GET", "path", "/api/", "description", "API information"),
            Map.of("method", "GET", "path", "/api/items", "description", "Get all items"),
            Map.of("method", "POST", "path", "/api/items", "description", "Create a new item"),
            Map.of("method", "GET", "path", "/api/items/{id}", "description", "Get item by ID"),
            Map.of("method", "PUT", "path", "/api/items/{id}", "description", "Update item by ID"),
            Map.of("method", "DELETE", "path", "/api/items/{id}", "description", "Delete item by ID")
        ));
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/items")
    public ResponseEntity<List<Item>> getAllItems() {
        return ResponseEntity.ok(itemService.getAllItems());
    }
    
    @PostMapping("/items")
    public ResponseEntity<Item> createItem(@RequestBody Item item) {
        return new ResponseEntity<>(itemService.createItem(item), HttpStatus.CREATED);
    }
    
    @GetMapping("/items/{id}")
    public ResponseEntity<Item> getItemById(@PathVariable Long id) {
        return itemService.getItemById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PutMapping("/items/{id}")
    public ResponseEntity<Item> updateItem(@PathVariable Long id, @RequestBody Item item) {
        return itemService.updateItem(id, item)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/items/{id}")
    public ResponseEntity<Void> deleteItem(@PathVariable Long id) {
        return itemService.deleteItem(id)
                ? ResponseEntity.noContent().build()
                : ResponseEntity.notFound().build();
    }
}
