package com.vaadin.demo.collaboard.endpoints.dto;

import java.util.Optional;

import com.vaadin.demo.collaboard.model.Board;
import com.vaadin.demo.collaboard.model.Card;

import lombok.Data;

@Data
public class ContentUpdate {
  public static enum Action {
    CARD_ADDED, CARD_UPDATED, CARD_DELETED, BOARD_ADDED, BOARD_DELETED
  };

  private String initiatorUsername;
  private Card card;
  private BoardInfo board;
  private Action action;

  public ContentUpdate(String initiatorUsername, Card card, Board board, Action action) {
    this.initiatorUsername = initiatorUsername;
    this.card = card;
    this.board = new BoardInfo(board);
    this.action = action;
  }

  public Optional<Card> getCard() {
    return Optional.ofNullable(this.card);
  }
}
