package com.vaadin.demo.collaboard.model;

import java.time.LocalDateTime;
import java.util.LinkedList;
import java.util.List;

import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;

@Data
@RequiredArgsConstructor
@NoArgsConstructor
@Document
public class Board {
  private String id;
  @NonNull
  @Indexed(unique = true)
  private String name;
  private List<Card> cards = new LinkedList<>();
  private List<Status> statuses = Status.getDefaultStatuses();
  @LastModifiedDate
  private LocalDateTime lastModified;
}
