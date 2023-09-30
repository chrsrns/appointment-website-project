import { Fragment, useCallback, useEffect, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import { Calendar, Views, DateLocalizer } from 'react-big-calendar'
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop'
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import { AppointmentFormModal } from '../AppointmentFormModal'

import LoadingOverlay from 'react-loading-overlay-ts';
import { RRule, RRuleSet } from 'rrule';

const CalendarWithDragAndDrop = withDragAndDrop(Calendar)

export default function DragAndDropCalendar({ localizer }) {
  const [date, setDate] = useState(new Date())

  const [eventsFull, setEventsFull] = useState([])
  const [eventsMapped, setEventsMapped] = useState([])

  const [eventsForRender, setEventsForRender] = useState([])
  const [eventsForBG, setEventsForBG] = useState([])
  const [recurringEvents, setRecurringEvents] = useState([])

  const [showModal, setShowModal] = useState(false)
  const [modalTitle, setModalTitle] = useState('')
  const [modalId, setModalId] = useState('')

  const [isLoading, setIsLoading] = useState(false)

  const [eventRange, setEventRange] = useState({
    fromDate: Date.now(),
    toDate: Date.now(),
  })

  const fetchAll = () => {
    fetch(`${global.server_backend_url}/backend/appointments/schedules`)
      .then((response) => {
        if (response.ok) return response.json();
        else throw response;
      }).then((data) => {
        if (data != eventsFull && data.length !== 0) {
          setEventsFull(data);

          setEventsMapped([...data.map((eventFull) => {

            /// Check if date range spans multiple days
            const startDate = new Date(eventFull.fromDate)
            const endDate = new Date(eventFull.toDate)

            const startUTC = startDate.getDate();
            const endUTC = endDate.getDate();

            const isMultiDays = startUTC !== endUTC
            ///

            // console.log(`title: ${eventFull.title}`)
            // console.log(`start: ${startDate} | end: ${endDate}`)
            // console.log(`multiDays: ${isMultiDays}`)
            // console.log(`startString: ${startUTC} | endString: ${endUTC}`)
            // console.log(`multiDays: ${isMultiDays}`)
            // console.log("")

            return {
              id: eventFull.id,
              title: eventFull.title,
              start: new Date(eventFull.fromDate),
              end: new Date(eventFull.toDate),
              state: eventFull.state,
              allDay: isMultiDays,
              repeat: eventFull.repeat
            }
          })])

          // updateEvents()

          setIsLoading(false)

        }
      })
  }
  useEffect(() => updateEvents(), [eventsMapped])

  const updateEvents = () => {

    const eventsForBG = [...eventsMapped.filter((event) => event.state === "Available" && event.repeat === "None")]

    const eventsForFG = [...eventsMapped.filter((event) => event.state !== "Available" && event.state === "None")]

    const recurringEventsForBG = [].concat(...eventsMapped
      .filter((event) => event.state === "Available" && event.repeat !== "None")
      .map((event) => {
        return getRecurredEvents(event)
      }))

    const recurringEventsForFG = [].concat(...eventsMapped
      .filter((event) => event.state !== "Available" && event.repeat !== "None")
      .map((event) => {
        return getRecurredEvents(event)
      }))

    const compiledFGEvents = [...eventsForFG, ...recurringEventsForFG]
    const compiledBGEvents = [...eventsForBG, ...recurringEventsForBG]

    console.log(compiledBGEvents)

    setEventsForRender(compiledFGEvents)
    setEventsForBG(compiledBGEvents)

    // console.log(
    //   `eventsMapped: ${eventsMapped}`
    // )

    // console.log(recurringEventsForFG)
    // console.log(date)

  }

  const getRecurredEvents = (event) => {
    var repeatRule;
    switch (event.repeat) {
      case "Daily":
        repeatRule = RRule.DAILY
        break
      case "Weekly":
        repeatRule = RRule.WEEKLY
        break
      case "Monthly":
        repeatRule = RRule.MONTHLY
        break
    }
    console.log(`rule: ${event.repeat}`)

    const start_rruleset = new RRuleSet()
    start_rruleset.rrule(new RRule({
      freq: repeatRule,
      dtstart: new Date(event.start),
      until: new Date((new Date(date)).getFullYear(), (new Date(date)).getMonth() + 1)
    }))
    start_rruleset.exrule(new RRule({
      freq: repeatRule,
      dtstart: new Date(event.start),
      until: new Date((new Date(date)).getFullYear(), (new Date(date)).getMonth(), 0)
    }))

    const end_rruleset = new RRuleSet()
    end_rruleset.rrule(new RRule({
      freq: repeatRule,
      dtstart: new Date(event.end),
      until: new Date((new Date(date)).getFullYear(), (new Date(date)).getMonth() + 1)
    }))
    end_rruleset.exrule(new RRule({
      freq: repeatRule,
      dtstart: new Date(event.end),
      until: new Date((new Date(date)).getFullYear(), (new Date(date)).getMonth(), 0)
    }))

    const start_dates = start_rruleset.all()
    const end_dates = end_rruleset.all()

    // console.log(`starts: ${start_dates}`)
    // console.log(`ends: ${end_dates}`)

    return start_dates.map((date, index) => {
      return {
        id: event.id,
        title: event.title,
        start: new Date(date),
        end: new Date(end_dates[index]),
        state: event.state,
        allDay: event.allDay,
        repeat: event.repeat
      }
    })
  }
  useEffect(() => {
    updateEvents()
  }, [date])

  useEffect(() => {
    if (!isLoading) setIsLoading(true)
    fetchAll()
  }, [])

  const eventPropGetter = useCallback(
    (event, start, end, isSelected) => ({
      ...(event.state === "Available" && {
        style: {
          backgroundColor: '#dee2e6',
        },
        className: 'text-dark',
      }),
      ...(event.state === "Pending" && {
        style: {
          backgroundColor: '#fff3cd',
        },
        className: 'text-dark',
      }),
      ...(event.state === "Approved" && {
        style: {
          backgroundColor: '#afdbc7',
        },
        className: 'text-dark',
      }),
      ...(event.state === "Ongoing" && {
        style: {
          backgroundColor: '#fecba1',
        },
        className: 'text-dark',
      }),
      ...(event.state === "Completed" && {
        style: {
          backgroundColor: '#e6e6e6',
        },
        className: 'text-dark',
      }),
    }),
    []
  )

  const moveEvent = useCallback(
    ({ event, start, end, isAllDay: droppedOnAllDaySlot = false }) => {
      setIsLoading(true)

      const { allDay } = event
      if (!allDay && droppedOnAllDaySlot) {
        start.setHours(0, 0, 0, 0)
        end.setHours(23, 59, 59, 999)
        event.allDay = true
      }

      setEventsForRender((prev) => {
        const existing = prev.find((ev) => ev.id === event.id) ?? {}
        const filtered = prev.filter((ev) => ev.id !== event.id)
        return [...filtered, { ...existing, start, end, allDay }]
      })

      const data = {
        fromDate: start,
        toDate: end,
      }

      fetch(`${global.server_backend_url}/backend/appointments/schedule/${event.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then((response) => {
        console.log(response)
        if (response.ok) {
          fetchAll();
          return response.json();
        } else throw response;

      }).catch((err) => {
        console.log(err)
      })
    },
    [setEventsFull]
  )

  const resizeEvent = useCallback(
    ({ event, start, end }) => {

      setEventsForRender((prev) => {
        const existing = prev.find((ev) => ev.id === event.id) ?? {}
        const filtered = prev.filter((ev) => ev.id !== event.id)
        return [...filtered, { ...existing, start, end }]
      })

      setIsLoading(true)
      const data = {
        fromDate: start,
        toDate: end,
      }

      // console.log(`start: ${start} | end: ${end}`)

      fetch(`${global.server_backend_url}/backend/appointments/schedule/${event.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then((response) => {
        console.log(response)
        if (response.ok) {
          fetchAll();
          return response.json();
        } else throw response;

      }).catch((err) => {
        console.log(err)
      })
    },
    [setEventsFull]
  )

  const handleSelectSlot = useCallback(
    ({ start, end }) => {
      // const title = window.prompt(`New Event name ${start} ${end}`)
      setIsLoading(true)
      setModalTitle("Create New Event")
      setEventRange({ fromDate: start, toDate: end })
      setModalId("")
      setShowModal(true)
      // console.log(`new modal id: ${modalId}`)
      // if (title) {
      //   setEventsFull((prev) => [...prev, { start, end, title }])
      // }
    },
    [setModalTitle, setShowModal, setEventRange]
  )

  const handleSelectEvent = useCallback(
    (event) => {
      // window.alert(event.title)
      console.log(event)
      setIsLoading(true)
      setModalTitle("Modifying Existing Schedule")
      setEventRange({ fromDate: event.start, toDate: event.end })
      setModalId(event.id)
      setShowModal(true);
    },
    [setModalTitle, setShowModal, setEventRange]
  )

  const onNavigate = useCallback((newDate) => setDate(newDate), [setDate])

  return (
    <LoadingOverlay active={isLoading} spinner text='Waiting for update...'>
      <div>
        <AppointmentFormModal
          id={modalId}
          show={showModal}
          title={modalTitle}
          eventRange={eventRange}
          handleClose={() => {
            setShowModal(false)
            fetchAll()
          }}
        />

        <CalendarWithDragAndDrop
          dayLayoutAlgorithm="no-overlap"
          defaultView={Views.WEEK}
          backgroundEvents={eventsForBG}
          events={eventsForRender}
          eventPropGetter={eventPropGetter}
          localizer={localizer}

          date={date}
          onNavigate={onNavigate}

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
    </LoadingOverlay>
  )
}
DragAndDropCalendar.propTypes = {
  localizer: PropTypes.instanceOf(DateLocalizer),
}
