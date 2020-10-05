package com.vaadin.demo.collaboard.endpoints;

import java.time.LocalDateTime;
import java.util.List;

import com.vaadin.demo.collaboard.AppState;
import com.vaadin.demo.collaboard.db.UserRepo;
import com.vaadin.demo.collaboard.model.Board;
import com.vaadin.demo.collaboard.model.User;
import com.vaadin.flow.server.connect.Endpoint;
import com.vaadin.flow.server.connect.auth.AnonymousAllowed;

import lombok.RequiredArgsConstructor;

@Endpoint
@AnonymousAllowed
@RequiredArgsConstructor
public class UserEndpoint {
  private final UserRepo repo;
  private final AppState appState;

  public User createOrLogin(String name) {
    var user = repo.findByName(name);
    if (user == null) {
      user = repo.save(new User(name));
    }
    appState.setCurrentUser(user);
    return user;
  }

  public void logout() {
    appState.setCurrentUser(null);
  }

  public List<User> findAllUsers() {
    return repo.findAll();
  }

  public void markVisited(User user, Board board) {
    var dbUser = repo.findById(user.getId()).orElseThrow();
    dbUser.getLastVisited().put(board.getId(), LocalDateTime.now());
    repo.save(dbUser);
  }
}
