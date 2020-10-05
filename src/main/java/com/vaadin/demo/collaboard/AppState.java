package com.vaadin.demo.collaboard;

import com.vaadin.demo.collaboard.model.User;

import org.springframework.stereotype.Component;
import org.springframework.web.context.annotation.SessionScope;

import lombok.Data;

@SessionScope
@Component
@Data
public class AppState {
  private User currentUser;
}
