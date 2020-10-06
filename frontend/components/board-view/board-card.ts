import { css, customElement, html, LitElement, property } from 'lit-element';
import Card from '../../generated/com/vaadin/demo/collaboard/model/Card';
import { appState } from '../../state/app-state';
import { CardDeletedEvent, CardUpdatedEvent } from './card-events';

@customElement('board-card')
export class BoardCard extends LitElement {
  @property({ type: Object })
  card!: Card;
  @property()
  lockedBy = '';

  constructor() {
    super();
    this.addEventListener('dragstart', this.handleDragStart);
    this.addEventListener('dragend', this.handleDragEnd);
  }

  render() {
    return html`
      <header @mouseover=${this.addDraggable} @mouseout=${this.removeDraggable}>
        <span>By: ${this.card.creator}</span
        ><button @click=${this.deleteCard}>Delete</button>
      </header>
      ${this.getContentComponent()}
    `;
  }

  getContentComponent() {
    if (!this.lockedBy || this.lockedBy === appState.user.name) {
      return html` <textarea
        class="content"
        .value=${this.card.content}
        @change=${this.updateCard}
        @focus=${this.lockCard}
        @blur=${this.releaseCard}
      ></textarea>`;
    } else {
      return html`
        <div class="content">${this.card.content}</div>
        <a-avataaar class="avatar" identifier=${this.lockedBy}></a-avataaar>
      `;
    }
  }

  addDraggable() {
    this.setAttribute('draggable', 'true');
  }

  removeDraggable() {
    this.removeAttribute('draggable');
  }

  lockCard() {
    appState.lockCard(this.card);
  }

  releaseCard() {
    appState.relaseCard(this.card);
  }

  updateCard(e: { target: HTMLInputElement }) {
    this.card.content = e.target.value;
    this.dispatchEvent(new CardUpdatedEvent(this.card));
  }

  deleteCard() {
    this.dispatchEvent(new CardDeletedEvent(this.card));
  }

  handleDragStart(e: DragEvent) {
    this.classList.add('dragging');
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'move';
      e.dataTransfer.setData('text/json', JSON.stringify(this.card));
    }
  }

  handleDragEnd() {
    this.classList.remove('dragging');
  }

  static styles = css`
    :host {
      position: relative;
      display: flex;
      flex-direction: column;
      position: relative;
      box-shadow: var(--lumo-box-shadow-xs);
      background: var(--lumo-base-color);
      border: 1px solid var(--lumo-shade-10pct);
    }

    :host(.dragging),
    :host([readonly]) {
      opacity: 0.5;
    }

    header {
      display: flex;
      padding: var(--lumo-space-xs);
      border-bottom: 2px solid var(--lumo-shade-10pct);
      cursor: move;
      height: 1.4em;
      font-size: 0.8em;
    }

    header button {
      display: none;
      cursor: pointer;
      margin-left: auto;
      background: transparent;
      border: none;
      color: var(--lumo-secondary-text-color);
    }

    header:hover button {
      display: block;
    }

    .content {
      flex: 1;
      box-sizing: border-box;
      height: 100%;
      width: 100%;
      border: 0;
      padding: var(--lumo-space-s);
      border: none;
      resize: none;
      background: var(--lumo-shade-5pct);
      font-family: var(--lumo-font-family);
      font-size: 1em;
      color: var(--lumo-body-text-color);
    }

    textarea:focus {
      background: var(--lumo-base-color);
    }

    .avatar {
      position: absolute;
      width: 24px;
      bottom: 0;
      right: var(--lumo-space-s);
    }
  `;
}
