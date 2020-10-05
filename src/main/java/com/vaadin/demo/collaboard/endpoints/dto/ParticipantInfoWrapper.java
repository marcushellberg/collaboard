package com.vaadin.demo.collaboard.endpoints.dto;

import java.util.Collection;

import lombok.AllArgsConstructor;
import lombok.Data;

@AllArgsConstructor
@Data
public class ParticipantInfoWrapper {
  private Collection<ParticipantInfo> participantInfo;
}
