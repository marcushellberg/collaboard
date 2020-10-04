package com.vaadin.demo.collaboard.model;

import java.time.LocalDateTime;

import org.bson.types.ObjectId;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;

@Data
@Document
@RequiredArgsConstructor
@NoArgsConstructor
public class Card {
  private String id = ObjectId.get().toString();

  @NonNull
  private String content;
  @NonNull
  private Status status;
  @NonNull
  private String creator;
  @LastModifiedDate
  private LocalDateTime lastModified;
}
