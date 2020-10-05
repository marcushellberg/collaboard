package com.vaadin.demo.collaboard.db;

import com.vaadin.demo.collaboard.model.User;

import org.springframework.data.mongodb.repository.MongoRepository;

public interface UserRepo extends MongoRepository<User, String> {
  User findByName(String name);
}
