package com.vaadin.demo.collaboard.endpoints;

import java.util.List;
import java.util.stream.Collectors;

import com.vaadin.demo.collaboard.db.BoardRepo;
import com.vaadin.demo.collaboard.db.CardRepo;
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
  final BoardRepo boardRepo;
  final CardRepo cardRepo;
  final MongoTemplate template;

  public List<BoardInfo> getBoards() {
    return boardRepo.findAll().stream().map(BoardInfo::new).collect(Collectors.toList());
  }

  public BoardInfo createBoard(String name) {
    return new BoardInfo(boardRepo.save(new Board(name)));
  }

  public Board findBoard(String id) {
    return boardRepo.findById(id).orElseThrow();
  }

  public Card createCard(String boardId, String content, Status status, String username) {
    var board = boardRepo.findById(boardId).orElseThrow();
    var card = cardRepo.save(new Card(content, status, username));
    board.getCards().add(card);
    boardRepo.save(board);
    return card;
  }

  public Card updateCard(Card updatedCard) {
    return cardRepo.save(updatedCard);
  }

  public void deleteCard(String boardId, Card deletedCard) {
    var board = boardRepo.findById(boardId).orElseThrow();
    board.getCards().remove(deletedCard);
    boardRepo.save(board);
    cardRepo.delete(deletedCard);
  }
}
