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
        userId={props.authUserId}
        creatorId={evt.creator._id} />
    )
  })

  return <ul className='events__list'>{events}</ul>
}

export default eventList
