package com.vaadin.demo.collaboard.endpoints;

import com.vaadin.demo.collaboard.model.Card;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CardUpdate {
  public static enum Actions {
    ADDED, UPDATED, DELETED
  };

  private Card card;
  private Actions action;
  private String username;
  private String boardId;
}
