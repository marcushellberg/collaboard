package com.vaadin.demo.collaboard.db;

import com.vaadin.demo.collaboard.model.Card;

import org.springframework.data.mongodb.repository.MongoRepository;

public interface CardRepo extends MongoRepository<Card, String> {

}
