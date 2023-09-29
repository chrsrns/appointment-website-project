import { Fragment, useCallback, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import events from './events'
import { Calendar, Views, DateLocalizer } from 'react-big-calendar'
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop'
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";

const DragAndDropCalendar = withDragAndDrop(Calendar)

export default function DragAndDrop({ localizer }) {
  const [myEvents, setMyEvents] = useState(events)

  const moveEvent = useCallback(
    ({ event, start, end, isAllDay: droppedOnAllDaySlot = false }) => {
      const { allDay } = event
      if (!allDay && droppedOnAllDaySlot) {
        event.allDay = true
      }

      setMyEvents((prev) => {
        const existing = prev.find((ev) => ev.id === event.id) ?? {}
        const filtered = prev.filter((ev) => ev.id !== event.id)
        return [...filtered, { ...existing, start, end, allDay }]
      })
    },
    [setMyEvents]
  )

  const resizeEvent = useCallback(
    ({ event, start, end }) => {
      setMyEvents((prev) => {
        const existing = prev.find((ev) => ev.id === event.id) ?? {}
        const filtered = prev.filter((ev) => ev.id !== event.id)
        return [...filtered, { ...existing, start, end }]
      })
    },
    [setMyEvents]
  )

  const handleSelectSlot = useCallback(
    ({ start, end }) => {
      const title = window.prompt('New Event name')
      if (title) {
        setMyEvents((prev) => [...prev, { start, end, title }])
      }
    },
    [setMyEvents]
  )

  const handleSelectEvent = useCallback(
    (event) => window.alert(event.title),
    []
  )

  const defaultDate = useMemo(() => Date.now(), [])

  return (
    <Fragment>
      <div>
        <DragAndDropCalendar
          defaultDate={defaultDate}
          defaultView={Views.WEEK}
          events={myEvents}
          localizer={localizer}

          onEventDrop={moveEvent}
          onEventResize={resizeEvent}

          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}

          popup
          resizable
          selectable
          style={{ height: '40rem' }}
        />

      </div>
    </Fragment>
  )
}
DragAndDrop.propTypes = {
  localizer: PropTypes.instanceOf(DateLocalizer),
}
