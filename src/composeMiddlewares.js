function composeMiddlewares(f, g) {
  return (params, state, next) =>
    f(params, state, (nextState) =>
      g(params, nextState, next)
    )
  ;
}

export default composeMiddlewares;
