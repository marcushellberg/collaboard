package com.vaadin.demo.collaboard.db;

import com.vaadin.demo.collaboard.model.Board;

import org.springframework.data.mongodb.repository.MongoRepository;

public interface BoardRepo extends MongoRepository<Board, String> {
}
