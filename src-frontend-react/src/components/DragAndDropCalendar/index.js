import { useCallback, useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { Calendar, Views, DateLocalizer } from 'react-big-calendar'
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop'
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import { AppointmentFormModal } from '../AppointmentFormModal'

import LoadingOverlay from 'react-loading-overlay-ts';
import { RRule, RRuleSet } from 'rrule';
import Select from 'react-select';
import { customFetch } from '../../utils';
import { Button, Stack } from 'react-bootstrap';
import { PrintModal } from '../PrintModal';
import { schedule_state, user_type } from '@prisma/client';
import Cookies from 'js-cookie';
import { socket } from '../../socket';

const DEFAULT_USER_TO_FILTER_VALUES = {
  id: '',
  fname: '',
  mname: '',
  lname: '',
  type: ''
}

/// NOTE The `{ ...DEFAULT_FORM_VALUES }` is used because simply
//      placing `DEFAULT_FORM_VALUES` seems to make it so that 
//      the forms modify this variable
const DEFAULT_STAFF_TO_FILTER_VALUE = { value: { ...DEFAULT_USER_TO_FILTER_VALUES }, label: "Select staff to see only their availability" }

const CalendarWithDragAndDrop = withDragAndDrop(Calendar)

export default function DragAndDropCalendar({ localizer }) {
  const [showPrintModal, setShowPrintModal] = useState(false)
  const [date, setDate] = useState(new Date())

  const [eventsFull, setEventsFull] = useState([])
  const [eventsMapped, setEventsMapped] = useState([])

  const [eventsForRender, setEventsForRender] = useState([])
  const [eventsForBG, setEventsForBG] = useState([])

  const [showModal, setShowModal] = useState(false)
  const [modalId, setModalId] = useState('')

  const [isLoading, setIsLoading] = useState(false)

  const [staffListOptions, setStaffListOptions] = useState([])
  const [selectedStaffToFilter, setSelectedStaffToFilter] = useState({ ...DEFAULT_STAFF_TO_FILTER_VALUE })

  const [eventRange, setEventRange] = useState({
    fromDate: Date.now(),
    toDate: Date.now(),
  })

  const eventsFullRef = useRef([])
  useEffect(() => { eventsFullRef.current = eventsFull }, [eventsFull])

  const [isFetchingAll, setIsFetchingAll] = useState(true)
  const fetchAll = useCallback(async () => {
    const request = selectedStaffToFilter.value.id ?
      `${global.server_backend_url}/backend/appointments/schedules/by-user/${selectedStaffToFilter.value.id}`
      : `${global.server_backend_url}/backend/appointments/schedules`
    console.log(request)
    setIsLoading(true)
    Promise.all([
      customFetch(request)
        .then((response) => {
          if (response.ok) return response.json();
          else throw response;
        }).then((data) => {
          if (data !== eventsFullRef.current) {
            setEventsFull(data);

            setEventsMapped([...data
              .filter((event) => event.state !== schedule_state.Completed)
              .map((eventFull) => {

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
                console.log("is draggable", !Cookies.get("usertype") === user_type.Student)

                return {
                  id: eventFull.id,
                  title: eventFull.title,
                  start: new Date(eventFull.fromDate),
                  end: new Date(eventFull.toDate),
                  authorUserId: eventFull.authorUserId,
                  isDraggable: ((eventFull.state === schedule_state.Pending ||
                    eventFull.state === schedule_state.Available) &&
                    Cookies.get("usertype") !== user_type.Student),
                  state: eventFull.state,
                  allDay: isMultiDays,
                  repeat: eventFull.repeat,
                  selectable: eventFull.authorUserId === Cookies.get('userid') || !eventFull.state === schedule_state.Available

                }
              })])
          }
        }),
      customFetch(`${global.server_backend_url}/backend/appointments/staff`)
        .then((response) => {
          if (response.ok) return response.json();
          else throw response;
        }).then((data) => {
          setStaffListOptions([{ ...DEFAULT_STAFF_TO_FILTER_VALUE }, ...data.map((staff) => {
            return { value: staff, label: `[${staff.type}] ${staff.lname}, ${staff.fname} ${staff.mname}` }
          })])
        })
    ]).catch((err) => {
      console.error(err)
    }).finally(() => {
      setIsLoading(false)
      setIsFetchingAll(false)
    })
  }, [selectedStaffToFilter.value])
  useEffect(() => {
    if (isFetchingAll) {
      fetchAll().then(() => {
        setIsLoading(false)
        setIsFetchingAll(false)
      })
    }
  }, [fetchAll, isFetchingAll])
  useEffect(() => {
    socket.on("update appointments", () => {
      setIsLoading(true)
      setIsFetchingAll(true)
    });
  }, [])

  const getRecurredEvents = useCallback((event) => {
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
      default: break
    }

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
    console.log(start_dates)

    // console.log(`starts: ${start_dates}`)
    // console.log(`ends: ${end_dates}`)

    return start_dates.map((date, index) => {
      return {
        ...event,
        start: new Date(date),
        end: new Date(end_dates[index]),
      }
    })
  }, [date])

  const updateEvents = useCallback(() => {
    console.log('updateEvents ran')

    const eventsForBG = [...eventsMapped.filter((event) => event.state === "Available" && event.repeat === "None")]

    const eventsForFG = [...eventsMapped.filter((event) => event.state !== "Available" && event.repeat === "None")]

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

    console.log("Compiled BG Events: ", compiledBGEvents)
    console.log("Compiled FG Events: ", compiledFGEvents)

    setEventsForRender(compiledFGEvents)
    setEventsForBG(compiledBGEvents)

    // console.log(
    //   `eventsMapped: ${eventsMapped}`
    // )

    // console.log(recurringEventsForFG)
    // console.log(date)

  }, [eventsMapped, getRecurredEvents])

  useEffect(() => updateEvents(), [eventsMapped, updateEvents])
  useEffect(() => {
    updateEvents()
  }, [date, updateEvents])

  const appointmentsTypesColors = {
    Available: "#dee2e6",
    Pending: "#fff3cd",
    Approved: "#afdbc7",
    Ongoing: "#fecba1",
    Completed: "#d8fea1"
  }
  const eventPropGetter = useCallback(
    (event, _start, _end) => ({
      ...(event.state === "Available" && {
        style: {
          backgroundColor: appointmentsTypesColors.Available,
        },
        className: 'text-dark',
      }),
      ...(event.state === "Pending" && {
        style: {
          backgroundColor: appointmentsTypesColors.Pending,
        },
        className: 'text-dark',
      }),
      ...(event.state === "Approved" && {
        style: {
          backgroundColor: appointmentsTypesColors.Approved,
        },
        className: 'text-dark',
      }),
      ...(event.state === "Ongoing" && {
        style: {
          backgroundColor: appointmentsTypesColors.Ongoing,
        },
        className: 'text-dark',
      }),
      ...(event.state === "Completed" && {
        style: {
          backgroundColor: appointmentsTypesColors.Completed,
        },
        className: 'text-dark',
      }),
    }),
    [appointmentsTypesColors.Approved,
    appointmentsTypesColors.Ongoing,
    appointmentsTypesColors.Pending,
    appointmentsTypesColors.Available,
    appointmentsTypesColors.Completed]
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

      customFetch(`${global.server_backend_url}/backend/appointments/schedule/${event.id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      }).then((response) => {
        console.log(response)
        if (response.ok) {
          setIsFetchingAll(true)
          return response.json();
        } else throw response;

      }).catch((err) => {
        console.log(err)
      }).finally(() => setIsLoading(false))
    },
    []
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

      customFetch(`${global.server_backend_url}/backend/appointments/schedule/${event.id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      }).then((response) => {
        console.log(response)
        if (response.ok) {
          setIsFetchingAll(true)
          return response.json();
        } else throw response;

      }).catch((err) => {
        console.log(err)
      }).finally(() => setIsLoading(false))
    },
    []
  )

  const handleSelectSlot = useCallback(
    ({ start, end }) => {
      // const title = window.prompt(`New Event name ${start} ${end}`)
      setIsLoading(true)
      setEventRange({ fromDate: start, toDate: end })
      setModalId("")
      setShowModal(true)
      // console.log(`new modal id: ${modalId}`)
      // if (title) {
      //   setEventsFull((prev) => [...prev, { start, end, title }])
      // }
    },
    [setShowModal, setEventRange]
  )

  const handleSelectEvent = useCallback(
    (event) => {
      // window.alert(event.title)
      setIsLoading(true)
      setEventRange({ fromDate: event.start, toDate: event.end })
      setModalId(event.id)
      setShowModal(true);
    },
    [setShowModal, setEventRange]
  )

  const handleStaffToFilterSelectionChange = (e) => {
    setSelectedStaffToFilter({ value: e.value, label: e.label })
    // const announcement = e.value

    // setFormData(announcement)
  }

  useEffect(() => {
    setIsFetchingAll(true)
  }, [selectedStaffToFilter])

  const onNavigate = useCallback((newDate) => setDate(newDate), [setDate])

  return (
    <LoadingOverlay active={isLoading} spinner text='Waiting for update...'>
      <div className='text-center'>
        <AppointmentFormModal
          id={modalId}
          show={showModal}
          eventRange={eventRange}
          handleClose={() => {
            setShowModal(false)
            setIsFetchingAll(true)
          }}
        />
        <PrintModal
          show={showPrintModal}
          records={eventsFull.filter((event) => {
            return event.state === schedule_state.Completed
          })}
          onClose={() => {
            setShowPrintModal(false)
          }} />
        <Select className='fs-5 mb-3' options={staffListOptions} value={selectedStaffToFilter} onChange={handleStaffToFilterSelectionChange} />
        <Stack direction='horizontal' className='gap-4 justify-content-center mb-2'>
          {Object.keys(appointmentsTypesColors).map((key) => (
            <div key={key}>
              <i className="bi bi-caret-down-fill" style={{ color: appointmentsTypesColors[key] }}></i>
              {key}
            </div>
          ))}
        </Stack>
        <CalendarWithDragAndDrop
          defaultView={Views.WEEK}
          backgroundEvents={eventsForBG}
          events={eventsForRender}
          eventPropGetter={eventPropGetter}
          localizer={localizer}

          min={new Date(1972, 0, 1, 8)}
          max={new Date(1972, 0, 1, 17)}

          date={date}
          onNavigate={onNavigate}

          onEventDrop={moveEvent}
          onEventResize={resizeEvent}

          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}

          popup
          draggableAccessor="isDraggable"
          resizable
          selectable
          style={{ height: '40rem' }}
        />
        <Button className='mt-3' onClick={() => setShowPrintModal(true)}>Print</Button>

      </div>
    </LoadingOverlay>
  )
}
DragAndDropCalendar.propTypes = {
  localizer: PropTypes.instanceOf(DateLocalizer),
}
