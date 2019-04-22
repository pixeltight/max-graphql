import React, { Component } from 'react'

import AuthContext from '../context/auth-context'
import BookingsList from '../components/Bookings/BookingsList/BookingsList'
import Spinner from '../components/Spinner/Spinner'

class BookingsPage extends Component {
  
  state = {
    isLoading: true,
    bookings: []
  }

  static contextType = AuthContext

  componentDidMount () {
    this.fetchBookings()
  }

  fetchBookings = () => {
    this.setState({ isLoading: true })
    const requestBody = {
      query: `
        query {
          bookings {
            _id
            event {
              _id
              title
              date
            }
            createdAt
          }
        }
      `
    }

    fetch('http://localhost:8000/graphql', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this.context.token
      }
    })
      .then(res => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error('Fetch booking failed')
        }
        return res.json()
      })
      .then(resData => {
        const bookings = resData.data.bookings
        this.setState({ bookings: bookings, isLoading: false })
      })
      .catch(err => {
        console.log('bookings query err: ', err)
        this.setState({ isLoading: false })
      })
  }

  deleteBookingHandler = bookingId => {
    this.setState({ isLoading: true })
    const requestBody = {
      query: `
        mutation {
          cancelBooking(bookingId: "${bookingId}") {
            _id
            title
          }
        }
      `
    }
    console.log(requestBody)
    fetch('http://localhost:8000/graphql', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this.context.token
      }
    })
      .then(res => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error('Delete booking failed')
        }
        return res.json()
      })
      .then(resData => {
        this.setState(prevState => {
          const updatedBookings = prevState.bookings.filter(booking => {
            return booking._id !== bookingId
          })
          return { bookings: updatedBookings, isLoading: false }
        })
      })
      .catch(err => {
        console.log('bookings delete err: ', err)
        this.setState({ isLoading: false })
      })
  }

  render () {
    return (
      <React.Fragment>
      {this.state.isLoading
        ? <Spinner />
        : <BookingsList bookings={this.state.bookings} onDelete={this.deleteBookingHandler} />
      }
      </React.Fragment>
    )
  }
}

export default BookingsPage
