let id = 1;

class Message {
  constructor(body) {
    this.message = body;
    this.id = id;
    id++;
    Message.all.push(this);
  }

  serialize() {
    return {
      id: this.id,
      message: this.message
    };
  }

  static find(id) {
    return Message.all.find(m => m.id === id);
  }

  static serializeAll() {
    return Message.all.map(m => m.serialize());
  }
}

Message.all = [];

module.exports = Message;
