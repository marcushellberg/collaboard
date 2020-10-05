package com.vaadin.demo.collaboard.endpoints;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import com.vaadin.demo.collaboard.AppState;
import com.vaadin.demo.collaboard.db.BoardRepo;
import com.vaadin.demo.collaboard.db.CardRepo;
import com.vaadin.demo.collaboard.endpoints.dto.BoardInfo;
import com.vaadin.demo.collaboard.endpoints.dto.ContentUpdate;
import com.vaadin.demo.collaboard.endpoints.dto.ContentUpdate.Action;
import com.vaadin.demo.collaboard.endpoints.dto.ParticipantInfo;
import com.vaadin.demo.collaboard.endpoints.dto.ParticipantInfo.CardLock;
import com.vaadin.demo.collaboard.endpoints.dto.ParticipantInfoWrapper;
import com.vaadin.demo.collaboard.model.Board;
import com.vaadin.demo.collaboard.model.Card;
import com.vaadin.demo.collaboard.model.Status;
import com.vaadin.flow.server.connect.Endpoint;
import com.vaadin.flow.server.connect.auth.AnonymousAllowed;

import lombok.RequiredArgsConstructor;
import reactor.core.publisher.DirectProcessor;
import reactor.core.publisher.EmitterProcessor;
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

  final FluxProcessor<ContentUpdate, ContentUpdate> contentUpdates = DirectProcessor.<ContentUpdate>create()
      .serialize();
  final FluxSink<ContentUpdate> contentUpdateSink = contentUpdates.sink();

  final Map<String, ParticipantInfo> participantInfoMap = new HashMap<>();

  final FluxProcessor<ParticipantInfoWrapper, ParticipantInfoWrapper> participantUpdates = EmitterProcessor
      .<ParticipantInfoWrapper>create().serialize();
  final FluxSink<ParticipantInfoWrapper> participantUpdateSink = participantUpdates.sink();

  public List<BoardInfo> getBoards() {
    return boardRepo.findAll().stream().map(BoardInfo::new).collect(Collectors.toList());
  }

  public BoardInfo createBoard(String name) {
    var board = boardRepo.save(new Board(name));
    var username = appState.getCurrentUser().getName();
    contentUpdateSink.next(new ContentUpdate(username, null, board, Action.BOARD_ADDED));
    return new BoardInfo(board);
  }

  public void deleteBoard(String boardId) {
    var board = boardRepo.findById(boardId).orElseThrow();
    var username = appState.getCurrentUser().getName();
    cardRepo.deleteAll(board.getCards());
    boardRepo.delete(board);
    contentUpdateSink.next(new ContentUpdate(username, null, board, Action.BOARD_DELETED));
  }

  public Board findBoard(String id) {
    return boardRepo.findById(id).orElseThrow();
  }

  public Card createCard(Board board, String content, Status status) {
    var username = appState.getCurrentUser().getName();
    var dBboard = boardRepo.findById(board.getId()).orElseThrow();
    var card = cardRepo.save(new Card(content, status, username));
    dBboard.getCards().add(card);
    boardRepo.save(dBboard);
    contentUpdateSink.next(new ContentUpdate(username, card, dBboard, Action.CARD_ADDED));
    return card;
  }

  public Card updateCard(Board board, Card updatedCard) {
    var username = appState.getCurrentUser().getName();
    var saved = cardRepo.save(updatedCard);
    contentUpdateSink.next(new ContentUpdate(username, saved, board, Action.CARD_UPDATED));
    return saved;
  }

  public void deleteCard(Board board, Card deletedCard) {
    var username = appState.getCurrentUser().getName();
    var dBboard = boardRepo.findById(board.getId()).orElseThrow();
    dBboard.getCards().remove(deletedCard);
    boardRepo.save(dBboard);
    cardRepo.delete(deletedCard);
    contentUpdateSink.next(new ContentUpdate(username, deletedCard, board, Action.CARD_DELETED));
  }

  public Flux<ContentUpdate> subscribeToContentUpdates() {
    return contentUpdates;
  }

  public Flux<ParticipantInfoWrapper> subscribeToParticipantUpdates() {
    // Send the latest update to any new subscribers to catch them up
    return participantUpdates.replay(1).autoConnect();
  }

  public void joinBoard(String boardId) {
    var participantInfo = participantInfoMap.getOrDefault(boardId, new ParticipantInfo(boardId));
    participantInfo.getParticipants().add(appState.getCurrentUser().getName());
    participantInfoMap.put(boardId, participantInfo);
    sendparticipantInfo(participantInfoMap);
  }

  public void leaveBoard(String boardId) {
    var participantInfo = participantInfoMap.getOrDefault(boardId, new ParticipantInfo(boardId));
    participantInfo.getParticipants().removeIf(u -> u.equals(appState.getCurrentUser().getName()));
    participantInfoMap.put(boardId, participantInfo);
    sendparticipantInfo(participantInfoMap);
  }

  public void lockCard(String boardId, String cardId) {
    var participantInfo = participantInfoMap.getOrDefault(boardId, new ParticipantInfo(boardId));
    participantInfo.getLockedCards().add(new CardLock(cardId, appState.getCurrentUser().getName()));
    participantInfoMap.put(boardId, participantInfo);
    sendparticipantInfo(participantInfoMap);
  }

  public void releaseCard(String boardId, String cardId) {
    var participantInfo = participantInfoMap.getOrDefault(boardId, new ParticipantInfo(boardId));
    participantInfo.getLockedCards().removeIf(lock -> lock.getCardId().equals(cardId));
    participantInfoMap.put(boardId, participantInfo);
    sendparticipantInfo(participantInfoMap);
  }

  private void sendparticipantInfo(Map<String, ParticipantInfo> participantInfoMap) {
    participantUpdateSink.next(new ParticipantInfoWrapper(participantInfoMap.values()));
  }
}
