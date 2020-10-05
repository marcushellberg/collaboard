package com.vaadin.demo.collaboard.endpoints.dto;

import java.util.HashSet;
import java.util.Set;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;

@Data
@RequiredArgsConstructor
public class ParticipantInfo {
  @Data
  @AllArgsConstructor
  @NoArgsConstructor
  @EqualsAndHashCode(onlyExplicitlyIncluded = true)
  public static class CardLock {
    @EqualsAndHashCode.Include
    private String cardId;
    private String username;
  }

  @NonNull
  private String boardId;
  private Set<String> participants = new HashSet<>();
  private Set<CardLock> lockedCards = new HashSet<>();
}
