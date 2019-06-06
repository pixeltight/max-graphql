import React, { Component } from 'react'
import AuthContext from '../context/auth-context'
import Spinner from '../components/Spinner/Spinner'

import './Auth.css'

class AuthPage extends Component {
  constructor (props) {
    super(props)

    this.state = {
      isLogin: true,
      isLoading: false,
      signupComplete: false,
      signupError: false,
      signupData: '',
      loginComplete: false,
      loginData: ''
    }

    this.emailEl = React.createRef()
    this.passwordEl = React.createRef()
  }

  static contextType = AuthContext

  createUserHandler = (event) => {
    event.preventDefault()

    const email = this.emailEl.current.value
    const password = this.passwordEl.current.value

    if (email.trim().length === 0 || password.trim() === 0) {
      return
    }
    
    this.setState({ isLoading: true })
    let requestBody = {
      query: `
        mutation {
          createUser(userInput: { email: "${email}", password: "${password}" }) {
            _id
            email
          }
        }
      `
    }

    fetch(process.env.REACT_APP_API_URL, {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(res => {
        return res.json()
      })
      .then(resData => {
        if (resData.errors) {
          console.log(resData.errors[0].message)
          this.setState({
            isLoading: false,
            isLogin: false,
            signupError: true,
            signupData: resData.errors[0].message
          })
        } else {
          this.setState({
            isLoading: false,
            isLogin: true,
            signupComplete: true,
            signupData: resData.data.createUser.email
          })
        }

      })
      .catch(err => {
        console.log('createUser error: ', err)
      })
  }

  loginHandler = (event) => {
    event.preventDefault()

    const email = this.emailEl.current.value
    const password = this.passwordEl.current.value

    if (email.trim().length === 0 || password.trim() === 0) {
      return
    }
    
    this.setState({ isLoading: true })
    let requestBody = {
      query: `
        query {
          login(email: "${email}", password: "${password}") {
            userId
            token
            email
            tokenExpiration
          }
        }
      `
    }

    fetch(process.env.REACT_APP_API_URL, {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(res => {
      return res.json()
    })
    .then(resData => {
      if (resData.errors) {
        console.log(resData.errors[0].message)
        this.setState({
          isLoading: false,
          loginError: true,
          loginData: resData.errors[0].message
        })
      } else {
        this.setState({
          isLoading: false,
        })
        this.context.login(
          resData.data.login.token, 
          resData.data.login.userId,
          resData.data.login.email,
          resData.data.login.tokenExpiration
        )
      }
    })
    .catch(err => {
      console.log('login error: ', err)
    })
  }

  switchModeHandler = () => {
    this.setState(prevState => {
      return { 
        isLogin: !prevState.isLogin,
        signupComplete: false,
        signupError: false,
        loginError: false
      }
    })
  }

  render () {
    const content = (
      this.state.isLoading ?
      <Spinner /> :
      <form className='auth-form' onSubmit={this.state.isLogin ? this.loginHandler : this.createUserHandler}>
        <h3 className='auth-form__header'>{this.state.isLogin ? 'Sign in' : 'Create Account'}</h3>
        <div className='auth-form__alert'>{!this.state.isLogin && this.state.signupError ? this.state.signupData : ''}</div>
        <div className='auth-form__alert'>{this.state.isLogin && this.state.loginError ? this.state.loginData : ''}</div>
        {this.state.isLogin && this.state.signupComplete ?
          <div className='auth-form__success'>
            Thank you for registering {this.state.signupData}. Please sign in to continue.
          </div> :
          ''}
        <div className='form-control auth-form__spacer'>
          <label htmlFor='email'>email</label>
          <input type='email' id='email' ref={this.emailEl} />
        </div>
        <div className='form-control'>
          <label htmlFor='password'>password</label>
          <input type='password' id='password' ref={this.passwordEl} />
        </div>
        <div className='form-actions'>
          <p className='form-actions__text-container'>
            <button type='submit'>Submit</button>
            {this.state.isLogin ?
              'Not a member?' :
              'Already have an account?'
            }
            {' '}
            <span onClick={this.switchModeHandler} className={'form-actions__link'}>
            {this.state.isLogin ? 'Sign up.' : 'Sign in.'}
          </span>
          </p>
        </div>
      </form>
    )
    return (
      <React.Fragment>
        {content}
      </React.Fragment>
    )
  }
}

export default AuthPage
