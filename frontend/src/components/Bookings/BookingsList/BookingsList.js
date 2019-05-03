import React from 'react'

import './BookingsList.css'

const bookingsList = props => {
  return (
    <ul className='bookings-list'>
      {props.bookings.map(booking => {
        return (
          <li className={'bookings-list__item'} key={booking._id}>
            <div>
              {booking.event.title} - {' '}
              {new Date(booking.createdAt).toLocaleDateString()}
            </div>
            <div>
              <button className='btn' onClick={() => props.onDelete(booking._id)}>Cancel Booking</button>
            </div>
          </li>
        )
      })}
    </ul>
  )
}

export default bookingsList
