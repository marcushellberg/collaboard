import Card from '../../generated/com/vaadin/demo/collaboard/model/Card';
import Status from '../../generated/com/vaadin/demo/collaboard/model/Status';

class CardEvent extends CustomEvent<Card> {
  constructor(eventName: string, card: Card) {
    super(eventName, { detail: card, bubbles: true, composed: true });
  }
}

export interface NewCardInfo {
  content: string;
  status: Status;
}

export class CardCreatedEvent extends CustomEvent<NewCardInfo> {
  constructor(card: NewCardInfo) {
    super('card-created', { detail: card, bubbles: true, composed: true });
  }
}

export class CardUpdatedEvent extends CardEvent {
  constructor(card: Card) {
    super('card-updated', card);
  }
}

export class CardDeletedEvent extends CardEvent {
  constructor(card: Card) {
    super('card-deleted', card);
  }
}
