import React from 'react'

import EventItem from './EventItem/EventItem'
import './EventList.css'

const eventList = props => {
  const events = props.events.map(evt => {
    return (
      <EventItem
        key={evt._id}
        eventId={evt._id}
        title={evt.title}
        price={evt.price}
        date={evt.date}
        userId={props.authUserId}
        creatorId={evt.creator._id}
        onDetail={props.onViewDetail} />
    )
  })

  return <ul className='events__list'>{events}</ul>
}

export default eventList
