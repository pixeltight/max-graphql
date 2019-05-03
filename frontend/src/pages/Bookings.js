import React, { Component } from 'react'

import AuthContext from '../context/auth-context'
import BookingsControls from '../components/Bookings/BookingsControls/BookingsControls'
import BookingsList from '../components/Bookings/BookingsList/BookingsList'
import BookingsChart from '../components/Bookings/BookingsChart/BookingsChart'
import Spinner from '../components/Spinner/Spinner'

class BookingsPage extends Component {
  
  state = {
    isLoading: true,
    bookings: [],
    outputType: 'list'
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
              price
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
        mutation CancelBooking($id: ID!) {
          cancelBooking(bookingId: $id) {
            _id
            title
          }
        }
      `,
      variables: {
        id: bookingId
      }
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

  changeOutputTypeHandler = outputType => {
    if (outputType === 'list') {
      this.setState({ outputType: 'list' })
    } else {
      this.setState({ outputType: 'chart' })
    }
  }

  render () {
    let content = <Spinner />
    if (!this.state.isLoading) {
      content = (
        <React.Fragment>
          <BookingsControls
            activeOutputType={this.state.outputType}
            onChange={this.changeOutputTypeHandler} />
          <div>
            {this.state.outputType === 'list'
              ? <BookingsList bookings={this.state.bookings} onDelete={this.deleteBookingHandler} />
              : <BookingsChart bookings={this.state.bookings} onDelete={this.deleteBookingHandler} />
            }
          </div>
        </React.Fragment>
      )
    }
    return (
      <React.Fragment>
        {content}
      </React.Fragment>
    )
  }
}

export default BookingsPage
