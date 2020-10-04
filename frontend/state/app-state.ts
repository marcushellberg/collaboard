import User from '../generated/com/vaadin/demo/collaboard/model/User';
import { makeAutoObservable } from 'mobx';
import { createBoard, getBoards } from '../generated/BoardEndpoint';
import UserModel from '../generated/com/vaadin/demo/collaboard/model/UserModel';
import { createOrLogin } from '../generated/UserEndpoint';
import BoardInfo from '../generated/com/vaadin/demo/collaboard/endpoints/BoardInfo';
import { boardState } from './board-state';

const USERNAME_KEY = 'username';
class AppState {
  public user: User = UserModel.createEmptyValue();
  public boards: BoardInfo[] = [];
  public boardState = boardState;

  constructor() {
    makeAutoObservable(this);
    this.init();
  }

  async init() {
    this.setBoards(await getBoards());
    const username = localStorage.getItem(USERNAME_KEY);
    if (username) this.login(username);
  }

  async login(name: string) {
    this.setUser(await createOrLogin(name));
    localStorage.setItem(USERNAME_KEY, name);
  }

  logout() {
    this.setUser(UserModel.createEmptyValue());
    localStorage.removeItem(USERNAME_KEY);
  }

  get isUserKnown() {
    return !!(this.user.name || localStorage.getItem(USERNAME_KEY));
  }

  setUser(user: User) {
    this.user = user;
  }

  setBoards(boards: BoardInfo[]) {
    this.boards = boards;
  }

  async createBoard(boardName: string) {
    const created = await createBoard(boardName);
    this.setBoards([...this.boards, created]);
    this.boardState.findBoard(created.id);
  }
}

export const appState = new AppState();
