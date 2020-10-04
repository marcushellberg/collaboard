import {
  css,
  customElement,
  html,
  internalProperty,
  LitElement,
} from 'lit-element';
import '@vaadin/vaadin-app-layout/theme/lumo/vaadin-app-layout';
// @ts-ignore
import { AppLayoutElement } from '@vaadin/vaadin-app-layout/src/vaadin-app-layout';
import '@vaadin/vaadin-app-layout/vaadin-drawer-toggle';
import '@vaadin/vaadin-tabs/theme/lumo/vaadin-tab';
import '@vaadin/vaadin-tabs/theme/lumo/vaadin-tabs';
import '@vaadin/vaadin-button';
import '@vaadin/vaadin-text-field';
import 'a-avataaar';
import { classMap } from 'lit-html/directives/class-map.js';
import { CSSModule } from '@vaadin/flow-frontend/css-utils';
import { appState } from '../state/app-state';
import { MobxLitElement } from '@adobe/lit-mobx';
import { boardState } from '../state/board-state';

@customElement('main-view')
export class MainView extends MobxLitElement {
  @internalProperty()
  private newBoardName = '';

  render() {
    const { boards, user } = appState;
    const { board } = boardState;

    return html`
      <vaadin-app-layout primary-section="drawer">
        <header slot="navbar" theme="dark">
          <vaadin-drawer-toggle></vaadin-drawer-toggle>
          <h1>${board.name ? board.name : 'Create or select a board'}</h1>
          <div class="spinner ${classMap({
            active: appState.loading,
          })}" >Loading.</div>
          <a href="/logout">Log out</a>
          <a-avataaar identifier=${user.name}></a-avataaar>
        </header>

        <div slot="drawer">
          <div id="logo">
            <img src="images/logo.png" alt="CollaBoard" />
            <span>CollaBoard</span>
          </div>

          <h3>Boards</h3>
          ${
            boards.length > 0
              ? html` <vaadin-tabs
                  orientation="vertical"
                  theme="minimal"
                  id="tabs"
                  .selected="${this.getIndexOfSelectedBoard()}"
                >
                  ${boards.map(
                    (board) => html`
                      <vaadin-tab>
                        <a href="/${board.id}" tabindex="-1">${board.name}</a>
                      </vaadin-tab>
                    `
                  )}</vaadin-tabs
                >`
              : html` <div class="no-boards">No boards available</div> `
          }
          </vaadin-tabs>

          <div class="new-board-form" @keyup=${this.handleEnterSumbit}>
            <h3>Add a new board</h3>
            <vaadin-text-field
              placeholder="Board name"
              .value=${this.newBoardName}
              @input=${this.updateBoardName}
            ></vaadin-text-field>
            <vaadin-button
              @click=${this.addBoard}
              ?disabled=${!this.newBoardName}
              >Create</vaadin-button
            >
          </div>
        </div>
        <slot></slot>
      </vaadin-app-layout>
      <div class="error-notification" @click=${
        this.dismissError
      } ?hidden=${!appState.error}>${appState.error}</div>
    `;
  }

  private updateBoardName(e: { target: HTMLInputElement }) {
    this.newBoardName = e.target.value;
  }

  private handleEnterSumbit(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      this.addBoard();
    }
  }

  private addBoard() {
    if (this.newBoardName) {
      appState.createBoard(this.newBoardName);
      this.newBoardName = '';
    }
  }

  private getIndexOfSelectedBoard(): number {
    if (boardState.board) {
      return appState.boards.findIndex(
        (board) => location.pathname === '/' + boardState.board.id
      );
    }
    return 0;
  }

  dismissError() {
    appState.setError('');
  }

  static get styles() {
    return [
      CSSModule('lumo-typography'),
      CSSModule('lumo-color'),
      CSSModule('app-layout'),
      css`
        :host {
          display: block;
          height: 100%;
          position: relative;
        }

        header {
          align-items: center;
          box-shadow: var(--lumo-box-shadow-s);
          display: flex;
          height: var(--lumo-size-xl);
          width: 100%;
        }

        header h1 {
          font-size: var(--lumo-font-size-l);
          margin: 0;
        }

        header a {
          margin-left: auto;
          margin-right: var(--lumo-space-m);
          color: var(--lumo-text-contrast);
        }

        header a-avataaar {
          width: var(--lumo-size-m);
          margin-right: var(--lumo-space-m);
        }

        #logo {
          align-items: center;
          box-sizing: border-box;
          display: flex;
          padding: var(--lumo-space-s) var(--lumo-space-m);
        }

        #logo img {
          height: calc(var(--lumo-size-l) * 1.2);
        }

        #logo span {
          font-size: var(--lumo-font-size-xl);
          font-weight: 600;
          margin: 0 var(--lumo-space-s);
        }

        vaadin-tab {
          font-size: var(--lumo-font-size-s);
          height: var(--lumo-size-l);
          font-weight: 600;
          color: var(--lumo-body-text-color);
        }

        vaadin-tab:hover {
          background-color: var(--lumo-contrast-5pct);
          text-decoration: none;
        }

        vaadin-tab[selected] {
          background-color: var(--lumo-primary-color-10pct);
          color: var(--lumo-primary-text-color);
        }

        .no-boards {
          margin: 2em auto;
          color: var(--lumo-secondary-text-color);
          text-align: center;
        }

        .new-board-form {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-top: var(--lumo-space-l);
        }

        .new-board-form > * {
          width: 90%;
        }

        h3 {
          width: 90%;
          margin: 1em auto 0.5em;
          font-size: 1em;
          padding-bottom: var(--lumo-space-xs);
          border-bottom: 1px solid var(--lumo-contrast-20pct);
        }

        @keyframes spinner {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .spinner {
          opacity: 0;
          margin-left: var(--lumo-space-xl);
        }

        .spinner.active {
          animation: spinner 1s 1s;
        }

        .error-notification {
          position: absolute;
          z-index: 10;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          padding: var(--lumo-space-s) var(--lumo-space-m);
          background-color: var(--lumo-base-color);
          color: var(--lumo-error-text-color);
          font-weight: 500;
          border-bottom-left-radius: var(--lumo-border-radius);
          border-bottom-right-radius: var(--lumo-border-radius);
          cursor: pointer;
        }
      `,
    ];
  }

  // Stuff that should be in app-layout

  private _routerLocationChanged() {
    // @ts-ignore
    AppLayoutElement.dispatchCloseOverlayDrawerEvent();
  }

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener(
      'vaadin-router-location-changed',
      this._routerLocationChanged
    );
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener(
      'vaadin-router-location-changed',
      this._routerLocationChanged
    );
  }
}
