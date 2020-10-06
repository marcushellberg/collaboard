import User from '../generated/com/vaadin/demo/collaboard/model/User';
import { autorun, makeAutoObservable, runInAction } from 'mobx';
import {
  createBoard,
  deleteBoard,
  getBoards,
  subscribeToParticipantUpdates,
  subscribeToContentUpdates,
  createCard,
  deleteCard,
  findBoard,
  joinBoard,
  leaveBoard,
  lockCard,
  releaseCard,
  updateCard,
} from '../generated/BoardEndpoint';
import UserModel from '../generated/com/vaadin/demo/collaboard/model/UserModel';
import { createOrLogin, logout } from '../generated/UserEndpoint';
import BoardInfo from '../generated/com/vaadin/demo/collaboard/endpoints/dto/BoardInfo';
import BoardModel from '../generated/com/vaadin/demo/collaboard/model/BoardModel';
import { Subscription } from '@vaadin/flow-frontend/Connect';
import ParticipantInfo from '../generated/com/vaadin/demo/collaboard/endpoints/dto/ParticipantInfo';
import Action from '../generated/com/vaadin/demo/collaboard/endpoints/dto/ContentUpdate/Action';
import ContentUpdate from '../generated/com/vaadin/demo/collaboard/endpoints/dto/ContentUpdate';
import Board from '../generated/com/vaadin/demo/collaboard/model/Board';
import Card from '../generated/com/vaadin/demo/collaboard/model/Card';
import CardModel from '../generated/com/vaadin/demo/collaboard/model/CardModel';
import Status from '../generated/com/vaadin/demo/collaboard/model/Status';
import CardLock from '../generated/com/vaadin/demo/collaboard/endpoints/dto/ParticipantInfo/CardLock';

const USERNAME_KEY = 'username';
export class AppState {
  id: number = Math.random();
  user: User = UserModel.createEmptyValue();
  board: Board = BoardModel.createEmptyValue(); // current board
  boards: BoardInfo[] = [];
  loading = false;
  error = '';
  participantInfo: ParticipantInfo[] = [];
  subscriptions: Subscription[] = [];

  constructor() {
    makeAutoObservable(this, { subscriptions: false });
    this.init();
  }

  async init() {
    this.loadBoards();
    const username = localStorage.getItem(USERNAME_KEY);
    if (username) await this.login(username);
    this.subscribeToContentUpdates();
    this.subscribeToParticipantUpdates();
  }

  // UI state

  setLoading(loading: boolean) {
    this.loading = loading;
  }

  setError(msg: string) {
    this.error = msg;
  }

  // User actions

  setUser(user: User) {
    this.user = user;
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
    await this.leaveBoard();
    await logout();
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  get isUserKnown() {
    return !!(this.user.name || localStorage.getItem(USERNAME_KEY));
  }

  // Board actions

  setBoards(boards: BoardInfo[]) {
    this.boards = boards;
  }

  async setBoard(board: Board) {
    if (this.board) {
      await leaveBoard(this.board.id);
    }
    runInAction(() => (this.board = board));

    if (this.board.id) {
      await joinBoard(this.board.id);
    }
  }

  async leaveBoard() {
    await leaveBoard(this.board.id);
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

  async findBoard(id: string) {
    this.setLoading(true);
    try {
      this.setBoard(await findBoard(id));
    } catch (e) {
      this.setBoard(BoardModel.createEmptyValue());
      this.setError('Could not find board');
    } finally {
      this.setLoading(false);
    }
  }

  async createBoard(boardName: string) {
    this.setLoading(true);
    try {
      const created = await createBoard(boardName);
      this.setBoards([...this.boards, created]);
      this.findBoard(created.id);
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
        this.setBoard(BoardModel.createEmptyValue());
      } catch (e) {
        this.setError('Failed to delete board');
        runInAction(() => this.boards.push(deleted));
      } finally {
        this.setLoading(false);
      }
    }
  }

  // Card actions

  addCard(card: Card) {
    this.board.cards.push(card);
  }

  async createCard(newCardContent: string, status: Status) {
    this.setLoading(true);
    const tempCard = CardModel.createEmptyValue();
    tempCard.content = newCardContent;
    tempCard.status = status;
    tempCard.id = 'pending';
    this.addCard(tempCard);

    try {
      const createdCard = await createCard(this.board, newCardContent, status);
      //Swap the temp card for the real deal
      runInAction(() => {
        this.board.cards = this.board.cards.map((card) =>
          card.id === 'pending' ? createdCard : card
        );
      });
    } catch (e) {
      // Remove temp card
      this.board.cards = this.board.cards.filter(
        (card) => card.id !== 'pending'
      );
      this.setError('Card creation failed.');
    } finally {
      this.setLoading(false);
    }
  }

  async updateCard(newCard: Card) {
    const oldCard = this.board.cards.find((c) => c.id === newCard.id);
    if (oldCard) {
      this.setLoading(true);
      this.board.cards = this.board.cards.map((card) =>
        card.id === newCard.id ? newCard : card
      );
      try {
        await updateCard(this.board, newCard);
      } catch (e) {
        // undo update on failure
        this.board.cards = this.board.cards.map((card) =>
          card.id === oldCard.id ? oldCard : card
        );
        this.setError('Card update failed.');
      } finally {
        this.setLoading(false);
      }
    }
  }

  async deleteCard(card: Card) {
    this.setLoading(true);
    this.board.cards = this.board.cards.filter((c) => c.id !== card.id);
    try {
      await deleteCard(this.board, card);
    } catch (e) {
      //undo delete on failure
      this.board.cards.push(card);
      this.setError('Failed to delete card');
    } finally {
      this.setLoading(false);
    }
  }

  lockCard(card: Card) {
    lockCard(this.board.id, card.id);
  }

  relaseCard(card: Card) {
    releaseCard(this.board.id, card.id);
  }

  get cardLocks() {
    const cardLocks =
      this.participantInfo.find((p) => p.boardId === this.board.id)
        ?.lockedCards || [];
    return cardLocks;
  }

  // Subscribe to updates from the server

  private subscribeToParticipantUpdates() {
    this.subscriptions.push(
      subscribeToParticipantUpdates(({ participantInfo }) => {
        runInAction(() => {
          console.log('Participant info update received', participantInfo);
          this.participantInfo = participantInfo;
        });
      })
    );
  }

  private subscribeToContentUpdates() {
    this.subscriptions.push(
      subscribeToContentUpdates((update) => {
        console.log('Content update received', update);
        if (update.initiatorUsername === this.user.name) return;
        if (
          update.board.id === this.board.id &&
          [Action.CARDADDED, Action.CARDUPDATED, Action.CARDDELETED].includes(
            update.action
          )
        ) {
          this.handleCardUpdate(update);
        } else {
          this.handleBoardUpdate(update);
        }
      })
    );
  }

  handleCardUpdate(update: ContentUpdate) {
    switch (update.action) {
      case Action.CARDADDED: {
        runInAction(() => {
          this.board.cards.push(update.card);
        });
        break;
      }
      case Action.CARDUPDATED: {
        runInAction(() => {
          this.board.cards = this.board.cards.map((card) =>
            card.id === update.card.id ? update.card : card
          );
        });
        break;
      }
      case Action.CARDDELETED: {
        runInAction(() => {
          this.board.cards = this.board.cards.filter(
            (card) => card.id !== update.card.id
          );
        });
        break;
      }
    }
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
        if (this.board.id === update.board.id) {
          this.error = 'The board was deleted by another user';
          this.setBoard(BoardModel.createEmptyValue());
        }
        break;
      }
    }
  }
}

// TODO: Bad practice to rely on module loader cache
export const appState = new AppState();
