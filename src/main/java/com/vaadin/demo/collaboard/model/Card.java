package com.vaadin.demo.collaboard.model;

import java.time.LocalDateTime;

import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;

@Data
@Document
@RequiredArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Card {

  @EqualsAndHashCode.Include
  private String id;

  @NonNull
  private String content;
  @NonNull
  private Status status;
  @NonNull
  private String creator;
  @LastModifiedDate
  private LocalDateTime lastModified;
}
