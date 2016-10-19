function when(predicate, middleware) {
  return async (params, state, next) => {
    let p = predicate(params, state);
    if(typeof p.then === 'function') {
      p = await p;
    }
    if(p) {
      return await middleware(params, state, next);
    }
    return await next(state);
  };
}

export default when;
