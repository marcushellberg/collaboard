import { MobxLitElement } from '@adobe/lit-mobx';
import { css, customElement, html, internalProperty } from 'lit-element';
import '@vaadin/vaadin-text-field';
import '@vaadin/vaadin-button';
import User from '../generated/com/vaadin/demo/collaboard/model/User';
import { findAllUsers } from '../generated/UserEndpoint';
import { appState } from '../state/app-state';

@customElement('login-view')
export class EmptyView extends MobxLitElement {
  @internalProperty()
  private name = '';

  @internalProperty()
  private users: User[] = [];

  render() {
    return html`
      <img src="images/logo.png" alt="CollaBoard" class="logo" />
      <h1>CollaBoard</h1>
      <p>Hey there! Enter your name to start.</p>

      <div class="login-form" @keyup=${this.keyListener}>
        <vaadin-text-field
          .value=${this.name}
          @input=${this.updateName}
        ></vaadin-text-field>
        <vaadin-button theme="primary" @click=${this.login}
          >Log in</vaadin-button
        >
      </div>
    `;
  }

  updateName(e: { target: HTMLInputElement }) {
    this.name = e.target.value;
  }

  keyListener(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      this.login();
    }
  }

  login() {
    appState.login(this.name);
  }

  async connectedCallback() {
    super.connectedCallback();
    this.users = await findAllUsers();
  }

  static styles = css`
    :host {
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      height: 100%;
    }

    p {
      font-size: 1.2em;
    }

    .logo {
      width: 128px;
    }
  `;
}
