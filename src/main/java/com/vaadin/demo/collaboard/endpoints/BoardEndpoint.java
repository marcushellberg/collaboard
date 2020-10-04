package com.vaadin.demo.collaboard.endpoints;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import com.vaadin.demo.collaboard.db.BoardRepo;
import com.vaadin.demo.collaboard.model.Board;
import com.vaadin.demo.collaboard.model.Card;
import com.vaadin.demo.collaboard.model.Status;
import com.vaadin.flow.server.connect.Endpoint;
import com.vaadin.flow.server.connect.auth.AnonymousAllowed;

import org.springframework.data.mongodb.core.MongoTemplate;

import lombok.RequiredArgsConstructor;

@Endpoint
@AnonymousAllowed
@RequiredArgsConstructor
public class BoardEndpoint {
  final BoardRepo repo;
  final MongoTemplate template;

  public List<BoardInfo> getBoards() {
    return repo.findAll().stream().map(BoardInfo::new).collect(Collectors.toList());
  }

  public BoardInfo createBoard(String name) {
    return new BoardInfo(repo.save(new Board(name)));
  }

  public Board findBoard(String id) {
    return repo.findById(id).orElseThrow();
  }

  public Board createCard(String boardId, String content, Status status, String username) {
    var board = repo.findById(boardId).orElseThrow();
    var card = new Card(content, status, username);
    card.setLastModified(LocalDateTime.now());
    board.getCards().add(card);
    return repo.save(board);
  }

  public void updateCard(String boardId, Card updatedCard) {
    var board = repo.findById(boardId).orElseThrow();
    // replace the updated card
    board.setCards(board.getCards().stream().map(card -> {
      if (card.getId().equals(updatedCard.getId())) {
        updatedCard.setLastModified(LocalDateTime.now());
        return updatedCard;
      } else {
        return card;
      }
    }).collect(Collectors.toList()));
    repo.save(board);
  }

  public void deleteCard(String boardId, Card deletedCard) {
    var board = repo.findById(boardId).orElseThrow();
    board.setCards(board.getCards().stream().filter(card -> !card.getId().equals(deletedCard.getId()))
        .collect(Collectors.toList()));
    repo.save(board);
  }
}
