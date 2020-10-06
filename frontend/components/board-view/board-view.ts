import { MobxLitElement } from '@adobe/lit-mobx';
import {
  AfterEnterObserver,
  AfterLeaveObserver,
  RouterLocation,
} from '@vaadin/router';
import { css, customElement, html } from 'lit-element';
import '@vaadin/vaadin-text-field';
import '@vaadin/vaadin-button';
import '@vaadin/vaadin-text-field/vaadin-text-area';
import './board-column';
import {
  CardCreatedEvent,
  CardDeletedEvent,
  CardUpdatedEvent,
} from './card-events';
import { appState } from '../../state/app-state';

@customElement('board-view')
export class BoardView
  extends MobxLitElement
  implements AfterEnterObserver, AfterLeaveObserver {
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
    const { board } = appState;

    return html`
      ${board.statuses.map(
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
    appState.createCard(content, status);
  }

  handleCardUpdate(e: CardUpdatedEvent) {
    appState.updateCard(e.detail);
  }

  handleCardDelete(e: CardDeletedEvent) {
    appState.deleteCard(e.detail);
  }

  onAfterEnter(location: RouterLocation) {
    const boardId = location.params.boardId;
    appState.findBoard(boardId.toString());
  }

  onAfterLeave() {
    appState.leaveBoard();
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
