import React, { Component } from 'react'

import AuthContext from '../context/auth-context'
import Backdrop from '../components/Backdrop/Backdrop'
import Modal from '../components/Modal/Modal'
import EventList from '../components/Events/EventList/EventList'
import Spinner from '../components/Spinner/Spinner'
import './Events.css'

class EventsPage extends Component {
  constructor(props) {
    super(props)
    
    this.state = {
      creating: false,
      events: [],
      isLoading: false,
      selectedEvent: null
    }

    this.titleElRef = React.createRef()
    this.priceElRef = React.createRef()
    this.dateElRef = React.createRef()
    this.descriptionElRef = React.createRef()
  }
  
  static contextType = AuthContext

  isActive = true

  componentDidMount() {
    this.fetchEvents()
  }

  fetchEvents = () => {
    this.setState({ isLoading: true })
    const requestBody = {
      query: `
        query {
          events {
            _id
            title
            description
            date
            price
            creator {
              _id
              email
            }
          }
        }
      `
    }

    fetch('http://localhost:8000/graphql', {
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
        const events = resData.data.events
        if (this.isActive) {
          this.setState({ events: events, isLoading: false })
        }
      })
      .catch(err => {
        console.log('events query err: ', err)
        this.setState({ isLoading: false })
      })
  }

  startCreateEventHandler = () => {
    this.setState({ creating: true })
  }

  modalConfirmHandler = () => {
    this.setState({ creating: false })
    const title = this.titleElRef.current.value
    const price = +this.priceElRef.current.value
    const date = this.dateElRef.current.value
    const description = this.descriptionElRef.current.value

    if(
      title.trim().length === 0 ||
      price <= 0 ||
      date.trim().length === 0 ||
      description.trim().length === 0
    ) {
      return
    }

    const event = {
      title,
      price,
      date,
      description
    }
    console.log(event)
    const requestBody = {
      query: `
        mutation CreateEvent($title: String!, $desc: String!, $price: Float!, $date: String!) {
          createEvent(eventInput: { title: $title, description: $desc, price: $price, date: $date }) {
            _id
            title
            description
            date
            price
          }
        }
      `,
      variables: {
        title: title,
        desc: description,
        price: price,
        date: date
      }
    }

    const token = this.context.token

    fetch('http://localhost:8000/graphql', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      }
    })
      .then(res => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error('Create user POST failed')
        }
        return res.json()
      })
      .then(resData => {
        this.setState(prevState => {
          const updatedEvents = [...this.state.events]
          updatedEvents.push({
            _id: resData.data.createEvent,
            title: resData.data.createEvent.title,
            description: resData.data.createEvent.description,
            price: resData.data.createEvent.price,
            date: resData.data.createEvent.date,
            creator: {
              _id: this.context.userId
            }
          })
          return { events: updatedEvents }
        })
      })
      .catch(err => {
        console.log('createEvent post: ', err)
      })
  }

  modalCancelHandler = () => {
    this.setState({ creating: false, selectedEvent: null })
  }

  showDetailHandler = eventId => {
    this.setState(prevState => {
      const selectedEvent = prevState.events.find(evt => evt._id === eventId)
      return { selectedEvent: selectedEvent }
    })
  }

  bookEventHandler = () => {
    if (!this.context.token) {
      this.setState({ selectedEvent: null })
      return
    }
    const requestBody = {
      query: `
        mutation BookEvent($id: ID!) {
          bookEvent(eventId: $id) {
            _id
            createdAt  
            updatedAt
          }
        }
      `,
      variables: {
        id: this.state.selectedEvent._id
      }
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
          throw new Error('Create Booking failed')
        }
        return res.json()
      })
      .then(resData => {
        console.log(resData)
        this.setState({ selectedEvent: null })
      })
      .catch(err => {
        console.log('booking post err: ', err)
      })
  }

  componentWillUnmount () {
    this.active = false
  }

  render () {
    return (
      <React.Fragment>
        {(this.state.creating || this.state.selectedEvent) && <Backdrop />}
        {this.state.creating &&
          <Modal title='Add Event'
            onCancel = {this.modalCancelHandler}
            onConfirm = {this.modalConfirmHandler}
            canCancel 
            canConfirm
            confirmText='Confirm'>
          <form>
            <div className='form-control'>
              <label htmlFor='title'>Title</label>
              <input type='text' id='title' ref={this.titleElRef} />
            </div>
            <div className='form-control'>
              <label htmlFor='price'>Price</label>
              <input type='number' id='price' ref={this.priceElRef} />
            </div>
            <div className='form-control'>
              <label htmlFor='date'>Date</label>
              <input type='datetime-local' id='date' ref={this.dateElRef} />
            </div>
            <div className='form-control'>
              <label htmlFor="description">Description</label>
              <textarea id='description' rows='4' ref={this.descriptionElRef} />
            </div>
          </form>
        </Modal>}
        {this.state.selectedEvent && (
          <Modal title={this.state.selectedEvent.title}
            onCancel = {this.modalCancelHandler}
            onConfirm = {this.bookEventHandler}
            confirmText = {this.context.token ? 'Book Event' : 'Confirm'}
            canCancel 
            canConfirm>
            <h1>{this.state.selectedEvent.title}</h1>
            <h2>{this.state.selectedEvent.price} - {new Date(this.state.selectedEvent.date).toLocaleDateString('en-US')}</h2>
            <p>{this.state.selectedEvent.description}</p>
          </Modal>)}
        {this.context.token && (
          <div className='events-control'>
            <p>Share your own events!</p>
            <button className='btn' onClick={this.startCreateEventHandler}>Create Event</button>
          </div>)}
        {this.state.isLoading
          ? <Spinner />
          : ( <EventList
            events={this.state.events}
            authUserId={this.context.userId}
            onViewDetail={this.showDetailHandler} />)}
      </React.Fragment>
    )
  }
}

export default EventsPage
