package com.example.demo.service;

import com.example.demo.model.Item;
import com.example.demo.repository.ItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ItemService {
    
    private final ItemRepository itemRepository;
    
    @Autowired
    public ItemService(ItemRepository itemRepository) {
        this.itemRepository = itemRepository;
    }
    
    public List<Item> getAllItems() {
        return itemRepository.findAll();
    }
    
    public Optional<Item> getItemById(Long id) {
        return itemRepository.findById(id);
    }
    
    public Item createItem(Item item) {
        return itemRepository.save(item);
    }
    
    public Optional<Item> updateItem(Long id, Item itemDetails) {
        return itemRepository.findById(id)
                .map(existingItem -> {
                    existingItem.setName(itemDetails.getName());
                    existingItem.setDescription(itemDetails.getDescription());
                    return itemRepository.save(existingItem);
                });
    }
    
    public boolean deleteItem(Long id) {
        return itemRepository.findById(id)
                .map(item -> {
                    itemRepository.delete(item);
                    return true;
                })
                .orElse(false);
    }
}
