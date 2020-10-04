package com.vaadin.demo.collaboard.model;

import java.util.Arrays;
import java.util.List;

import org.springframework.data.mongodb.core.mapping.Document;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;

@Data
@RequiredArgsConstructor
@NoArgsConstructor
@Document
public class Status {
  @NonNull
  private String name;

  public static List<Status> getDefaultStatuses() {
    return Arrays.asList(new Status("Not started"), new Status("In progress"), new Status("Done"));
  }
}
