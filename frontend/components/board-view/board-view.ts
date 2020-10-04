import { MobxLitElement } from '@adobe/lit-mobx';
import { AfterEnterObserver, RouterLocation } from '@vaadin/router';
import { css, customElement, html, internalProperty } from 'lit-element';
import { boardState } from '../../state/board-state';

import '@vaadin/vaadin-text-field';
import '@vaadin/vaadin-button';
import '@vaadin/vaadin-text-field/vaadin-text-area';
import './board-column';
import {
  CardCreatedEvent,
  CardDeletedEvent,
  CardUpdatedEvent,
} from './card-events';

@customElement('board-view')
export class BoardView extends MobxLitElement implements AfterEnterObserver {
  @internalProperty()
  private newStatusName = '';

  constructor() {
    super();

    this.addEventListener(
      'card-created',
      this.handleCardCreated as EventListener
    );
    this.addEventListener(
      'card-updated',
      this.handleCardUpdate as EventListener
    );
    this.addEventListener(
      'card-deleted',
      this.handleCardDelete as EventListener
    );
  }

  render() {
    const { board } = boardState;

    return html`
      ${board?.statuses.map(
        (status) => html`
          <board-column
            .status=${status}
            .cards=${board.cards.filter(
              (card) => card.status.name === status.name
            )}
          ></board-column>
        `
      )}
    `;
  }

  handleCardCreated(e: CardCreatedEvent) {
    const { content, status } = e.detail;
    boardState.createCard(content, status);
  }

  handleCardUpdate(e: CardUpdatedEvent) {
    boardState.updateCard(e.detail);
  }

  handleCardDelete(e: CardDeletedEvent) {
    boardState.deleteCard(e.detail);
  }

  onAfterEnter(location: RouterLocation) {
    const boardId = location.params.boardId;
    boardState.findBoard(boardId.toString());
  }

  static styles = css`
    :host {
      display: grid;
      grid-auto-flow: column;
      grid-auto-columns: 400px;
      padding: var(--lumo-space-xl);
      gap: var(--lumo-space-xl);
      height: 100%;
      background: var(--lumo-contrast-5pct);
      overflow-x: scroll;
    }
  `;
}
