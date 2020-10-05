package com.vaadin.demo.collaboard.endpoints;

import java.util.List;
import java.util.stream.Collectors;

import com.vaadin.demo.collaboard.AppState;
import com.vaadin.demo.collaboard.db.BoardRepo;
import com.vaadin.demo.collaboard.db.CardRepo;
import com.vaadin.demo.collaboard.endpoints.dto.BoardInfo;
import com.vaadin.demo.collaboard.endpoints.dto.CardUpdate;
import com.vaadin.demo.collaboard.endpoints.dto.CardUpdate.Actions;
import com.vaadin.demo.collaboard.model.Board;
import com.vaadin.demo.collaboard.model.Card;
import com.vaadin.demo.collaboard.model.Status;
import com.vaadin.flow.server.connect.Endpoint;
import com.vaadin.flow.server.connect.auth.AnonymousAllowed;

import lombok.RequiredArgsConstructor;
import reactor.core.publisher.DirectProcessor;
import reactor.core.publisher.Flux;
import reactor.core.publisher.FluxProcessor;
import reactor.core.publisher.FluxSink;

@Endpoint
@AnonymousAllowed
@RequiredArgsConstructor
public class BoardEndpoint {
  final BoardRepo boardRepo;
  final CardRepo cardRepo;
  final AppState appState;
  final FluxProcessor<CardUpdate, CardUpdate> updateProcessor = DirectProcessor.<CardUpdate>create().serialize();
  final FluxSink<CardUpdate> updateSink = updateProcessor.sink();

  public List<BoardInfo> getBoards() {
    return boardRepo.findAll().stream().map(BoardInfo::new).collect(Collectors.toList());
  }

  public BoardInfo createBoard(String name) {
    return new BoardInfo(boardRepo.save(new Board(name)));
  }

  public void deleteBoard(String boardId) {
    var board = boardRepo.findById(boardId).orElseThrow();
    cardRepo.deleteAll(board.getCards());
    boardRepo.delete(board);
  }

  public Board findBoard(String id) {
    return boardRepo.findById(id).orElseThrow();
  }

  public Card createCard(String boardId, String content, Status status) {
    var user = appState.getCurrentUser();
    var board = boardRepo.findById(boardId).orElseThrow();
    var card = cardRepo.save(new Card(content, status, user.getName()));
    board.getCards().add(card);
    boardRepo.save(board);
    updateSink.next(new CardUpdate(card, Actions.ADDED, user.getName(), boardId));
    return card;
  }

  public Card updateCard(Card updatedCard, String boardId) {
    var user = appState.getCurrentUser();
    var saved = cardRepo.save(updatedCard);
    updateSink.next(new CardUpdate(saved, Actions.UPDATED, user.getName(), boardId));
    return saved;
  }

  public void deleteCard(String boardId, Card deletedCard) {
    var user = appState.getCurrentUser();
    var board = boardRepo.findById(boardId).orElseThrow();
    board.getCards().remove(deletedCard);
    boardRepo.save(board);
    cardRepo.delete(deletedCard);
    updateSink.next(new CardUpdate(deletedCard, Actions.DELETED, user.getName(), boardId));
  }

  public Flux<CardUpdate> subscribeToUpdates(String boardId) {
    var userName = appState.getCurrentUser().getName();
    return updateProcessor.filter(update -> {
      // Only show updates for the right board and exclude any own events
      return !update.getUsername().equals(userName) && update.getBoardId().equals(boardId);
    });
  }

  public void joinBoard(String boardId) {
  }

  public void leaveBoard(String boardId) {
  }

  public void lockCard(String cardId) {
  }

  public void releaseCard(String cardId) {
  }
}
