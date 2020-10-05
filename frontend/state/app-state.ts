import User from '../generated/com/vaadin/demo/collaboard/model/User';
import { action, makeAutoObservable, runInAction } from 'mobx';
import {
  createBoard,
  deleteBoard,
  getBoards,
  subscribeToParticipantUpdates,
  subscribeToContentUpdates,
} from '../generated/BoardEndpoint';
import UserModel from '../generated/com/vaadin/demo/collaboard/model/UserModel';
import { createOrLogin, logout } from '../generated/UserEndpoint';
import BoardInfo from '../generated/com/vaadin/demo/collaboard/endpoints/dto/BoardInfo';
import { boardState } from './board-state';
import BoardModel from '../generated/com/vaadin/demo/collaboard/model/BoardModel';
import { Subscription } from '@vaadin/flow-frontend/Connect';
import ParticipantInfo from '../generated/com/vaadin/demo/collaboard/endpoints/dto/ParticipantInfo';
import Action from '../generated/com/vaadin/demo/collaboard/endpoints/dto/ContentUpdate/Action';
import ContentUpdate from '../generated/com/vaadin/demo/collaboard/endpoints/dto/ContentUpdate';

const USERNAME_KEY = 'username';
class AppState {
  public user: User = UserModel.createEmptyValue();
  public boards: BoardInfo[] = [];
  public loading = false;
  public error = '';
  public boardState = boardState;
  public participantInfo: ParticipantInfo[] = [];
  private subscriptions: Subscription[] = [];

  constructor() {
    makeAutoObservable(this);
    this.init();
  }

  async init() {
    this.loadBoards();
    const username = localStorage.getItem(USERNAME_KEY);
    if (username) await this.login(username);
    this.subscribeToContentUpdates();
    this.subscribeToParticipantUpdates();
  }

  private subscribeToContentUpdates() {
    this.subscriptions.push(
      subscribeToContentUpdates((update) => {
        console.log('Content update received', update);
        if (update.initiatorUsername === this.user.name) return;
        if (
          update.board.id === boardState.board.id &&
          [Action.CARDADDED, Action.CARDUPDATED, Action.CARDDELETED].includes(
            update.action
          )
        ) {
          boardState.handleCardUpdate(update);
        } else {
          this.handleBoardUpdate(update);
        }
      })
    );
  }

  handleBoardUpdate(update: ContentUpdate) {
    switch (update.action) {
      case Action.BOARDADDED: {
        this.boards.push(update.board);
        break;
      }
      case Action.BOARDDELETED: {
        this.boards = this.boards.filter(
          (board) => board.id !== update.board.id
        );
        if (this.boardState.board.id === update.board.id) {
          this.error = 'The board was deleted by another user';
          this.boardState.setBoard(BoardModel.createEmptyValue());
        }
        break;
      }
    }
  }

  private subscribeToParticipantUpdates() {
    this.subscriptions.push(
      subscribeToParticipantUpdates(({ participantInfo }) => {
        console.log('Participant info update received', participantInfo);
        runInAction(() => (this.participantInfo = participantInfo));
      })
    );
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

  async logout() {
    this.setUser(UserModel.createEmptyValue());
    localStorage.removeItem(USERNAME_KEY);
    await this.boardState.leaveBoard();
    await logout();
    this.subscriptions.forEach((sub) => sub.unsubscribe());
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
