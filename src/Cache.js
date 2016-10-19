class Cache {
  constructor(signFn = (obj) => JSON.stringify(obj)) {
    this._cache = Object.create(null);
    this._signFn = signFn.bind(null);
  }

  size() {
    return Object.keys(this._cache).length;
  }

  clear() {
    this._cache = Object.create(null);
  }

  purge(obj) {
    delete this._cache[this._signFn(obj)];
  }

  cache() {
    return async (params, state, next) => {
      const sign = this._signFn(params);
      if(!Object.prototype.hasOwnProperty.call(this._cache, sign)) {
        this._cache[sign] = next(state);
      }
      return await this._cache[sign];
    };
  }
}

export default Cache;
