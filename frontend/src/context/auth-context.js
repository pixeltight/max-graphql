import React from 'react'

export default React.createContext({
  token: null,
  userId: null,
  email: null,
  tokenExpriration: null,
  login: (token, userId, email, tokenExpiration) => {},
  logout: () => {}
})
