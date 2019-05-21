import React, { Component } from 'react'
import AuthContext from '../context/auth-context'

import './Auth.css'

class AuthPage extends Component {
  constructor (props) {
    super(props)

    this.state = {
      isLogin: true
    }

    this.emailEl = React.createRef()
    this.passwordEl = React.createRef()
  }

  static contextType = AuthContext

  submitHandler = (event) => {
    event.preventDefault()

    const email = this.emailEl.current.value
    const password = this.passwordEl.current.value

    if (email.trim().length === 0 || password.trim() === 0) {
      return
    }

    let requestBody = {
      query: `
        query Login($email: String!, $password: String!) {
          login(email: $email, password: $password) {
            userId
            token
            tokenExpiration
          }
        }
      `,
      variables: {
        email: email,
        password: password
      }
    }

    if (!this.state.isLogin) {
      requestBody = {
        query: `
          mutation CreateUser($email: String!, $password: String!) {
            createUser(userInput: { email: $email, password: $password }) {
              _id
              email
            }
          }
        `,
        variables: {
          email: email,
          password: password
        }
      }
    }

    console.log(JSON.stringify(requestBody))

    fetch(process.env.REACT_APP_API_URL, {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(res => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error('Create user POST failed')
        }
        return res.json()
      })
      .then(resData => {
        if (resData.data.login.token) {
          this.context.login(
            resData.data.login.token, 
            resData.data.login.userId,
            resData.data.login.tokenExpiration
          )
        }
      })
      .catch(err => {
        console.log('createUser post: ', err)
      })
  }

  switchModeHandler = () => {
    this.setState(prevState => {
      return { isLogin: !prevState.isLogin }
    })
  }

  render () {
    return (
      <form className='auth-form' onSubmit={this.submitHandler}>
        <h4>{this.state.isLogin ? 'Log in' : 'Sign up'}</h4>
        <div className='form-control'>
          <label htmlFor='email'>email</label>
          <input type='email' id='email' ref={this.emailEl} />
        </div>
        <div className='form-control'>
          <label htmlFor='password'>password</label>
          <input type='password' id='password' ref={this.passwordEl} />
        </div>
        <div className='form-actions'>
          <button type='submit'>Submit</button>
          <button type='button' onClick={this.switchModeHandler}>
            Switch to {this.state.isLogin ? 'Sign up' : 'Login'}
          </button>
        </div>
      </form>
    )
  }
}

export default AuthPage
