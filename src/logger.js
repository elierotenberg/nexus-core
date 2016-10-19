const __LOGGER_DEPTH__ = '__NEXUS_LOGGER_DEPTH__';

function logger(logFn = (...args) => console.log(...args)) {
  return async (params, state = {}, next) => {
    const { [__LOGGER_DEPTH__]: currentDepth = 0 } = state;
    logFn('>'.repeat(currentDepth + 1), { params, state });
    const res = await next(Object.assign({}, state, { [__LOGGER_DEPTH__]: currentDepth + 1 }));
    logFn('<'.repeat(currentDepth + 1), { res });
    return res;
  };
}

export default logger;
