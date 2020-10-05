import { makeAutoObservable, runInAction } from 'mobx';
import Board from '../generated/com/vaadin/demo/collaboard/model/Board';
import {
  createCard,
  deleteCard,
  findBoard,
  subscribeToUpdates,
  updateCard,
} from '../generated/BoardEndpoint';
import BoardModel from '../generated/com/vaadin/demo/collaboard/model/BoardModel';
import Status from '../generated/com/vaadin/demo/collaboard/model/Status';
import Card from '../generated/com/vaadin/demo/collaboard/model/Card';
import { appState } from './app-state';
import CardModel from '../generated/com/vaadin/demo/collaboard/model/CardModel';
import Actions from '../generated/com/vaadin/demo/collaboard/endpoints/CardUpdate/Actions';

class BoardState {
  public board: Board = BoardModel.createEmptyValue();
  constructor() {
    makeAutoObservable(this);
  }

  setBoard(board: Board) {
    this.board = board;

    if (this.board.id) {
      subscribeToUpdates(this.board.id, (update) => {
        switch (update.action) {
          case Actions.ADDED: {
            runInAction(() => {
              this.board.cards.push(update.card);
            });
            break;
          }
          case Actions.UPDATED: {
            runInAction(() => {
              this.board.cards = this.board.cards.map((card) =>
                card.id === update.card.id ? update.card : card
              );
            });
            break;
          }
          case Actions.DELETED: {
            runInAction(() => {
              this.board.cards = this.board.cards.filter(
                (card) => card.id !== update.card.id
              );
            });
            break;
          }
        }
      });
    }
  }

  addCard(card: Card) {
    this.board.cards.push(card);
  }

  async findBoard(id: string) {
    appState.setLoading(true);
    try {
      this.setBoard(await findBoard(id));
    } catch (e) {
      this.setBoard(BoardModel.createEmptyValue());
      appState.setError('Could not find board');
    } finally {
      appState.setLoading(false);
    }
  }

  async createCard(newCardContent: string, status: Status) {
    appState.setLoading(true);
    const tempCard = CardModel.createEmptyValue();
    tempCard.content = newCardContent;
    tempCard.status = status;
    tempCard.id = 'pending';
    this.addCard(tempCard);

    try {
      const createdCard = await createCard(
        this.board.id,
        newCardContent,
        status
      );
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
      appState.setError('Card creation failed.');
    } finally {
      appState.setLoading(false);
    }
  }

  async updateCard(newCard: Card) {
    const oldCard = this.board.cards.find((c) => c.id === newCard.id);
    if (oldCard) {
      appState.setLoading(true);
      this.board.cards = this.board.cards.map((card) =>
        card.id === newCard.id ? newCard : card
      );
      try {
        await updateCard(newCard, this.board.id);
      } catch (e) {
        // undo update on failure
        this.board.cards = this.board.cards.map((card) =>
          card.id === oldCard.id ? oldCard : card
        );
        appState.setError('Card update failed.');
      } finally {
        appState.setLoading(false);
      }
    }
  }

  async deleteCard(card: Card) {
    appState.setLoading(true);
    this.board.cards = this.board.cards.filter((c) => c.id !== card.id);
    try {
      await deleteCard(this.board.id, card);
    } catch (e) {
      //undo delete on failure
      this.board.cards.push(card);
      appState.setError('Failed to delete card');
    } finally {
      appState.setLoading(false);
    }
  }
}

export const boardState = new BoardState();
