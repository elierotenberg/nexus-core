class Nexus {
  constructor() {
    this._middlewares = [];
    this._transactions = new Set();
    this._nextTransactionId = 0;
    this._processQueryWithinTransaction = this._processQueryWithinTransaction.bind(this);
  }

  use(middleware) {
    if(typeof middleware !== 'function') {
      throw new Error('Only a function may be used as a middleware.');
    }
    if(!this._transactions.size === 0) {
      throw new Error('No middleware can be added while a transaction is running.');
    }
    this._middlewares.push(middleware.bind(null));
    return this;
  }

  async _transaction(fn, ...args) {
    const transactionId = this._nextTransactionId;
    this._nextTransactionId = this._nextTransactionId + 1;
    this._transactions.add(transactionId);
    try {
      return await fn(...args);
    }
    finally {
      this._transactions.delete(transactionId);
    }
  }

  _processMiddleware(params, state, middlewareIndex) {
    if(middlewareIndex === this._middlewares.length) {
      return Promise.resolve(void 0);
    }
    const next = (nextState) => this._processMiddleware(params, nextState, middlewareIndex + 1);
    return this._middlewares[middlewareIndex](params, state, next);
  }

  _processQueryWithinTransaction(params, initialState) {
    return this._processMiddleware(params, initialState, 0);
  }

  query(params, initialState = {}) {
    return this._transaction(this._processQueryWithinTransaction, params, initialState);
  }
}

export default Nexus;
