import User from '../generated/com/vaadin/demo/collaboard/model/User';
import { makeAutoObservable, runInAction } from 'mobx';
import {
  createBoard,
  deleteBoard,
  getBoards,
} from '../generated/BoardEndpoint';
import UserModel from '../generated/com/vaadin/demo/collaboard/model/UserModel';
import { createOrLogin } from '../generated/UserEndpoint';
import BoardInfo from '../generated/com/vaadin/demo/collaboard/endpoints/BoardInfo';
import { boardState } from './board-state';
import BoardModel from '../generated/com/vaadin/demo/collaboard/model/BoardModel';

const USERNAME_KEY = 'username';
class AppState {
  public user: User = UserModel.createEmptyValue();
  public boards: BoardInfo[] = [];
  public loading = false;
  public error = '';
  public boardState = boardState;

  constructor() {
    makeAutoObservable(this);
    this.init();
  }

  async init() {
    this.loadBoards();
    const username = localStorage.getItem(USERNAME_KEY);
    if (username) this.login(username);
  }

  private async loadBoards() {
    this.setLoading(true);
    try {
      this.setBoards(await getBoards());
    } catch (e) {
      this.setError('Failed to load boards');
    } finally {
      this.setLoading(false);
    }
  }

  async login(name: string) {
    this.setLoading(true);
    try {
      this.setUser(await createOrLogin(name));
      localStorage.setItem(USERNAME_KEY, name);
    } catch (e) {
      this.setError('Failed to load user');
    } finally {
      this.setLoading(false);
    }
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
    this.setLoading(true);
    try {
      const created = await createBoard(boardName);
      this.setBoards([...this.boards, created]);
      this.boardState.findBoard(created.id);
    } catch (e) {
      this.setError('Failed to create board');
    } finally {
      this.setLoading(false);
    }
  }

  async deleteBoard(boardId: string) {
    const deleted = this.boards.find((board) => board.id === boardId);
    if (deleted) {
      this.setLoading(true);
      this.boards = this.boards.filter((board) => board.id !== boardId);
      try {
        await deleteBoard(boardId);
        this.boardState.setBoard(BoardModel.createEmptyValue());
      } catch (e) {
        this.setError('Failed to delete board');
        runInAction(() => this.boards.push(deleted));
      } finally {
        this.setLoading(false);
      }
    }
  }

  setLoading(loading: boolean) {
    this.loading = loading;
  }

  setError(msg: string) {
    this.error = msg;
  }
}

export const appState = new AppState();
