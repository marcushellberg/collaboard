package com.vaadin.demo.collaboard.model;

import java.util.Arrays;
import java.util.List;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;

@Data
@RequiredArgsConstructor
@NoArgsConstructor
public class Status {
  @NonNull
  private String name;

  public static List<Status> getDefaultStatuses() {
    return Arrays.asList(new Status("Not started"), new Status("In progress"), new Status("Done"));
  }
}
