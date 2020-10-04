import { makeAutoObservable } from 'mobx';
import Board from '../generated/com/vaadin/demo/collaboard/model/Board';
import {
  createCard,
  deleteCard,
  findBoard,
  updateCard,
} from '../generated/BoardEndpoint';
import BoardModel from '../generated/com/vaadin/demo/collaboard/model/BoardModel';
import Status from '../generated/com/vaadin/demo/collaboard/model/Status';
import Card from '../generated/com/vaadin/demo/collaboard/model/Card';
import { appState } from './app-state';

class BoardState {
  public board: Board = BoardModel.createEmptyValue();
  public activeUserNames: string[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  setBoard(board: Board) {
    this.board = board;
  }

  addCard(card: Card) {
    this.board.cards.push(card);
  }

  async findBoard(id: string) {
    try {
      this.setBoard(await findBoard(id));
    } catch (e) {
      this.setBoard(BoardModel.createEmptyValue());
    }
  }

  async createCard(newCardContent: string, status: Status) {
    // TODO: how can I get only the updated embedded document from the backend
    this.addCard(
      await createCard(
        this.board.id,
        newCardContent,
        status,
        appState.user.name
      )
    );
  }

  async updateCard(newCard: Card) {
    const oldCard = this.board.cards.find((c) => c.id === newCard.id);
    if (oldCard) {
      this.board.cards = this.board.cards.map((card) =>
        card.id === newCard.id ? newCard : card
      );
      try {
        await updateCard(newCard);
      } catch (e) {
        // undo update on failure
        this.board.cards = this.board.cards.map((card) =>
          card.id === oldCard.id ? oldCard : card
        );
      }
    }
  }

  async deleteCard(card: Card) {
    this.board.cards = this.board.cards.filter((c) => c.id !== card.id);
    try {
      await deleteCard(this.board.id, card);
    } catch (e) {
      //undo delete on failure
      this.board.cards.push(card);
    }
  }
}

export const boardState = new BoardState();
