import composeMiddlewares from './composeMiddlewares';

class Nexus {
  constructor(initialMiddleware = (params, state, next) => next(state)) {
    this._pendingTransactionsCount = 0;
    if(typeof initialMiddleware !== 'function') {
      throw new Error('Only a function may be used as a middleware.');
    }
    this._middleware = initialMiddleware;
    this._chain = (params, state, next) => this._transaction(() => this._middleware(params, state, next));
  }

  use(middleware) {
    if(typeof middleware !== 'function') {
      throw new Error('Only a function may be used as a middleware.');
    }
    if(this._pendingTransactionsCount > 0) {
      throw new Error('No middleware can be added while a transaction is running.');
    }
    this._middleware = composeMiddlewares(this._middleware, middleware.bind(null));
    return this;
  }

  async _transaction(fn) {
    this._pendingTransactionsCount = this._pendingTransactionsCount + 1;
    try {
      return await fn();
    }
    finally {
      this._pendingTransactionsCount = this._pendingTransactionsCount - 1;
    }
  }

  when(predicate, otherNexus) {
    if(typeof predicate !== 'function') {
      throw new Error('predicate should be a function.');
    }
    if(!(otherNexus instanceof Nexus)) {
      throw new Error('otherNexus should be an instance of Nexus');
    }
    return this.use(async (params, state, next) => {
      let p = predicate(params, state);
      if(p && typeof p === 'object' && typeof p.then === 'function') {
        p = await p;
      }
      return p ? await otherNexus.query(params, state) : await next(state);
    });
  }

  query(params, state = {}) {
    return this._chain(params, state, () => Promise.resolve(void 0));
  }
}

export default Nexus;
