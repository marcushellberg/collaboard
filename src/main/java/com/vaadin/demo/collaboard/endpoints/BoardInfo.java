package com.vaadin.demo.collaboard.endpoints;

import java.util.List;

import com.vaadin.demo.collaboard.model.Board;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class BoardInfo {
  private String id;
  private String name;
  private List<String> activeUsernames = List.of();

  BoardInfo(Board board) {
    this.id = board.getId();
    this.name = board.getName();
  }
}
