import {
  css,
  customElement,
  html,
  internalProperty,
  LitElement,
  property,
} from 'lit-element';
import Card from '../../generated/com/vaadin/demo/collaboard/model/Card';
import Status from '../../generated/com/vaadin/demo/collaboard/model/Status';
import './board-card';
import '@vaadin/vaadin-button';
import '@vaadin/vaadin-text-field/vaadin-text-area';
import { CardCreatedEvent, CardUpdatedEvent } from './card-events';
import { appState } from '../../state/app-state';
import { MobxLitElement } from '@adobe/lit-mobx';

@customElement('board-column')
export class BoardCard extends MobxLitElement {
  @property({ type: Object })
  status!: Status;
  @property({ type: Array })
  cards: Card[] = [];

  @internalProperty()
  private newCardContent = '';

  constructor() {
    super();
    this.addEventListener('dragenter', this.handleDragEnter);
    this.addEventListener('dragleave', this.handleDragLeave);
    this.addEventListener('dragover', this.handleDragOver);
    this.addEventListener('drop', this.handleDrop);
  }

  render() {
    return html`
      <div class="status">${this.status.name}</div>
      <div class="cards">
        ${this.cards.map(
          (card) => html`
            <board-card
              .card=${card}
              ?readonly=${card.id === 'pending'}
              .lockedBy=${appState.cardLocks.find(
                (lock) => lock.cardId === card.id
              )?.username || ''}
            ></board-card>
          `
        )}
      </div>
      <div class="form">
        <vaadin-text-area
          placeholder="New card"
          .value=${this.newCardContent}
          @input=${this.handleNewCardInput}
          @keydown=${this.shortcutListener}
        ></vaadin-text-area>
        <vaadin-button @click=${this.addNewCard}>Add</vaadin-button>
      </div>
    `;
  }

  shortcutListener(e: KeyboardEvent) {
    if (
      e.key === 'Enter' &&
      (e.getModifierState('Shift') || e.getModifierState('Meta'))
    ) {
      this.addNewCard();
    }
  }

  handleNewCardInput(e: { target: HTMLInputElement }) {
    this.newCardContent = e.target.value;
  }

  addNewCard() {
    this.dispatchEvent(
      new CardCreatedEvent({
        status: this.status,
        content: this.newCardContent,
      })
    );
    this.newCardContent = '';
  }

  handleDrop(e: DragEvent) {
    e.stopPropagation();
    this.classList.remove('dragover');
    const json = e.dataTransfer?.getData('text/json');
    if (json) {
      const card = JSON.parse(json);
      card.status = this.status;
      this.dispatchEvent(new CardUpdatedEvent(card));
    }
  }
  handleDragEnter(e: DragEvent) {
    this.classList.add('dragover');
  }
  handleDragLeave(e: DragEvent) {
    this.classList.remove('dragover');
  }

  handleDragOver(e: DragEvent) {
    e.preventDefault();
  }

  static styles = css`
    :host {
      display: block;
      background: var(--lumo-base-color);
      border-radius: var(--lumo-border-radius);
      box-shadow: var(--lumo-box-shadow-s);
      padding: var(--lumo-space-m);
      height: 97%;
      overflow-y: scroll;
    }

    :host(.dragover) {
      background: var(--lumo-shade-5pct);
    }

    :host(.new) {
      height: 135px;
    }

    .status {
      font-weight: 600;
      padding-bottom: var(--lumo-space-s);
      border-bottom: 1px solid var(--lumo-shade-20pct);
    }

    .cards {
      display: grid;
      grid-auto-flow: row;
      grid-auto-rows: minmax(120px, min-content);
      gap: var(--lumo-space-m);
      margin: var(--lumo-space-m) 0;
    }

    .form {
      margin-top: 2em;
      display: flex;
      transition: opacity 0.25s ease-in-out;
      transition-delay: 0.25s;
      opacity: 0;
      flex-direction: column;
      align-items: flex-end;
    }

    .form vaadin-text-area {
      width: 100%;
    }

    :host(:hover) .form {
      opacity: 1;
    }
  `;
}
