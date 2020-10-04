import { css, customElement, html, LitElement } from "lit-element";

@customElement("empty-view")
export class EmptyView extends LitElement {
  render() {
    return html`<p>No board selected, select or create a board.</p>`;
  }

  static styles = css`
    :host {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100%;
    }

    p {
      font-size: 1.2em;
    }
  `;
}
