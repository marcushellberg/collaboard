package com.vaadin.demo.collaboard.model;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;

@Document
@Data
@RequiredArgsConstructor
@NoArgsConstructor
public class User {
  private String id;
  @NonNull
  @Indexed(unique = true)
  private String name;
  private Map<String, LocalDateTime> lastVisited = new HashMap<>();
}
