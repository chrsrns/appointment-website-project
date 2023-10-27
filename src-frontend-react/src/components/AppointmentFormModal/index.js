import { repeat, schedule_state } from "@prisma/client";
import moment from "moment";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button, Form, ListGroup, Modal, Stack, Tab, Tabs } from "react-bootstrap";
import Cookies from "js-cookie";

import LoadingOverlay from 'react-loading-overlay-ts';
import { customFetch } from "../../utils";
import Chat from "../Chat/ChatBubble";

const AppointmentFormUserList = ({ fname, mname, lname, onButtonClick }) => {
  return (
    <ListGroup.Item className="d-flex justify-content-between align-items-center">
      <>
        {`${fname} ${mname} ${lname}`}
      </>
      <Button variant="danger" size="sm" onClick={onButtonClick}>Remove</Button>

    </ListGroup.Item>
  )
}

/// TODO Refactor this component to imitate use of default values in RegistrationForm
export const AppointmentFormModal = ({ id, show, eventRange, handleClose: handleCloseCallback }) => {

  const [staffList, setStaffList] = useState([])
  const [selectedStaffList, setSelectedStaffList] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState("");

  const [studentsList, setStudentsList] = useState([])
  const [selectedStudentsList, setSelectedStudentsList] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  // const [isStudentSelectionEmpty, setIsStudentSelectionEmpty] = useState([]);

  const [scheduleTypes, setScheduleTypes] = useState([])
  const [filteredScheduleTypes, setFilteredScheduleTypes] = useState([])
  const [scheduleRepeatTypes, setScheduleRepeatTypes] = useState([])

  const [isLoading, setIsLoading] = useState(true);

  const defaultLoadingText = "Getting appointment details... "
  const [loadingText, setLoadingText] = useState(defaultLoadingText)

  const [formData, setFormData] = useState({
    start: "",
    end: "",
    title: "",
    content: "",
    scheduletype: schedule_state.Pending,
    repeat: repeat.None
  });
  const [authorUserId, setAuthorUserId] = useState("")

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    console.log(formData)

  };

  const [isFetchingAll, setIsFetchingAll] = useState(true)
  const fetchAll = useCallback(async () => {
    return Promise.all([
      customFetch(`${global.server_backend_url}/backend/appointments/scheduletypes`)
        .then((response) => {
          if (response.ok) return response.json();
          else throw response;
        })
        .then((data) => {
          if (data !== scheduleTypes)
            setScheduleTypes(data);
          return data;
        }),

      customFetch(`${global.server_backend_url}/backend/appointments/schedulerepeattypes`)
        .then((response) => {
          if (response.ok) return response.json();
          else throw response;
        })
        .then((data) => {
          if (data !== scheduleRepeatTypes)
            setScheduleRepeatTypes(data);
          return data;
        }),

      customFetch(`${global.server_backend_url}/backend/appointments/students`)
        .then((response) => {
          if (response.ok) {
            return response.json();
          }
          throw response;
        })
        .then((data) => {
          data = data.filter((user) => user.id !== authorUserId)
          if (data !== studentsList)
            setStudentsList(data);
        }),

      customFetch(`${global.server_backend_url}/backend/appointments/staff`)
        .then((response) => {
          if (response.ok) {
            return response.json();
          }
          throw response;
        })
        .then((data) => {
          data = data.filter((user) => user.id !== authorUserId)
          if (data !== staffList)
            setStaffList(data);
        }),
    ])
  }, [scheduleRepeatTypes, scheduleTypes, staffList, studentsList, authorUserId])
  useEffect(() => {
    if (isFetchingAll) {
      fetchAll().then(() => {
        console.log("fetching done")
        setIsLoading(false)
        setIsFetchingAll(false)
      })
    }
  }, [fetchAll, isFetchingAll])
  useEffect(() => {
    setIsLoading(true)
    setIsFetchingAll(true)
    // const intervalId = setInterval(() => {  //assign interval to a variable to clear it.
    //   fetchAll();
    // }, 5000)
    // return () => clearInterval(intervalId); //This is important
  }, [])
  const scheduleTypeRef = useRef("")
  const idRef = useRef("")
  useEffect(() => {
    scheduleTypeRef.current = formData.scheduletype
    idRef.current = id
  })
  useEffect(() => {
    setFilteredScheduleTypes(scheduleTypes.filter((x) => {
      if (idRef.current) {
        if (scheduleTypeRef.current === schedule_state.Available)
          return x === schedule_state.Available

        if (scheduleTypeRef.current === schedule_state.Pending)
          return x !== schedule_state.Available

        return !(x === schedule_state.Available || x === schedule_state.Pending
        )
      }
      return true;
    }))
  }, [scheduleTypes])

  useEffect(() => {
    console.log(`id: ${id}`)

    if (show) {
      if (id) {
        customFetch(`${global.server_backend_url}/backend/appointments/schedule/${id}`)
          .then((response) => {
            if (response.ok)
              return response.json(); else throw response;
          }).then((data) => {
            const students = data.Users
              .filter((user) => user.type === "Student")
            const staff = data.Users
              .filter((user) => user.type !== "Student" && user.type !== "Admin")

            setSelectedStudentsList(students);
            setSelectedStaffList(staff);

            setFormData(formData => ({
              ...formData,
              title: data.title,
              content: data.desc,
              scheduletype: data.state,
              start: moment(data.fromDate).format('YYYY-MM-DDThh:mm'),
              end: moment(data.toDate).format('YYYY-MM-DDThh:mm'),
              repeat: data.repeat,
            }));
            setAuthorUserId(data.authorUserId)

          }).catch((err) => {
            console.log(err)
          })
        console.log(`test ${id}`)
      } else {
        setFormData(formData => ({
          ...formData,
          title: "",
          content: "",
          scheduletype: schedule_state.Pending,
          start: moment(eventRange.fromDate).format('YYYY-MM-DDThh:mm'),
          end: moment(eventRange.toDate).format('YYYY-MM-DDThh:mm'),
          repeat: repeat.None,
        }));
        setAuthorUserId("")
      }
    }


  }, [id, show, eventRange.fromDate, eventRange.toDate])

  ///https://stackoverflow.com/questions/62111525/how-i-add-an-object-to-an-existing-array-react 
  //https://stackoverflow.com/questions/45277306/check-if-item-exists-in-array-react
  const addStudentToSelection = () => {
    setSelectedStudentsList(prev => [...prev,
    ...studentsList.filter((student) => {
      return student.id === selectedStudent && selectedStudentsList.every(x => x.id !== selectedStudent)
    })
    ])
  }

  const addStaffToSelection = () => {
    setSelectedStaffList(prev => [...prev,
    ...staffList.filter((staff) => {
      return staff.id === selectedStaff && selectedStaffList.every(x => x.id !== selectedStaff)
    })
    ])
  }

  const addScheduleToDB = () => {
    const users = [...selectedStaffList.map((selectedStaff) => {
      return { id: selectedStaff.id }
    }), ...selectedStudentsList.map((selectedStudent) => {
      return { id: selectedStudent.id }
    })]
    const data = {
      title: formData.title,
      desc: formData.content,
      state: formData.scheduletype,
      fromDate: eventRange.fromDate,
      toDate: eventRange.toDate,
      repeat: formData.repeat,
      Users: {
        connect: users
      }
    }

    customFetch(`${global.server_backend_url}/backend/appointments/schedule`, {
      method: 'POST',
      body: JSON.stringify(data)
    }).then((response) => {
      console.log(response)
      if (response.ok) {
        onModalClose();
        return response.json();
      } else throw response;

    }).catch((err) => {
      console.log(err)
    })
  }

  const modifyScheduleToDB = () => {
    const users = [...selectedStaffList.map((selectedStaff) => {
      return { id: selectedStaff.id }
    }), ...selectedStudentsList.map((selectedStudent) => {
      return { id: selectedStudent.id }
    })]
    const data = {
      title: formData.title,
      desc: formData.content,
      state: formData.scheduletype,
      fromDate: moment(formData.start).toISOString(),
      toDate: moment(formData.end).toISOString(),
      repeat: formData.repeat,
      Users: {
        set: users
      }
    }

    customFetch(`${global.server_backend_url}/backend/appointments/schedule/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }).then((response) => {
      console.log(response)
      if (response.ok) {
        onModalClose();
        return response.json();
      } else throw response;

    }).catch((err) => {
      console.log(err)
    })
  }

  const onModalSubmit = () => {
    if (id) {
      modifyScheduleToDB();
    } else addScheduleToDB();
  }

  const onModalClose = () => {
    handleCloseCallback();
    setSelectedStaffList([])
    setSelectedStaff("")
    setSelectedStudentsList([])
    setIsLoading(true)
    setLoadingText(defaultLoadingText)

  }

  const onModalOpen = () => {
    console.log("modal opened")
    setIsLoading(true)
    setIsFetchingAll(true)
  }

  const handleDelete = () => {
    if (id) {
      customFetch(`${global.server_backend_url}/backend/appointments/schedule/${id}`, {
        method: 'DELETE',
      }).then((response) => {
        console.log(response)
        if (response.ok) {
          onModalClose();
          return response.json();
        } else throw response;

      }).catch((err) => {
        console.log(err)
      })
    }
  }

  const disableForms = ((formData.scheduletype !== schedule_state.Pending &&
    formData.scheduletype !== schedule_state.Available) ||
    Cookies.get("usertype") === "Student") && !Cookies.get("userid") === authorUserId
  return (
    <Modal
      show={show}
      onHide={onModalClose}
      onShow={onModalOpen}
      backdrop="static"
      keyboard={false}
      size="lg"
    >
      <Modal.Header>
        <Modal.Title>{id ? "Modifying Existing Appointment" : "Create New Appointment"}</Modal.Title>
      </Modal.Header>
      <LoadingOverlay active={isLoading || !show} spinner text={loadingText}>
        <Modal.Body>
          <Tabs defaultActiveKey="form" className="mb-3">
            <Tab eventKey="form" title="Edit">
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Students Involved</Form.Label>
                  <Stack direction="horizontal" gap={3}>
                    <Form.Select
                      size="lg"
                      disabled={disableForms}
                      onChange={(e) => {
                        setSelectedStudent(e.target.value)
                      }}>
                      <option key='blankChoice' hidden value>Select students...</option>
                      {studentsList.map((student) => {
                        return <option key={student.id} value={student.id}>{`${student.fname} ${student.mname} ${student.lname}`}</option>
                      })}
                    </Form.Select>
                    <Button variant="primary" size="lg" onClick={addStudentToSelection}>Select</Button>
                  </Stack>
                  <Form.Text className="text-muted">
                    These people will be notified when added.
                  </Form.Text>
                  <ListGroup>
                    {selectedStudentsList.map((selectedStudent) => {
                      // return <ListGroup.Item className="d-flex justify-content-between"> <>
                      //   {`${selectedStudent.fname} ${selectedStudent.mname} ${selectedStudent.lname}`}
                      // </>
                      //   <Button variant="danger" size="sm">Remove</Button>

                      // </ListGroup.Item>
                      return <AppointmentFormUserList
                        key={selectedStudent.id}
                        fname={selectedStudent.fname}
                        mname={selectedStudent.mname}
                        lname={selectedStudent.lname}
                        onButtonClick={() => {
                          setSelectedStudentsList(
                            selectedStudentsList.filter((x) => {
                              return x.id !== selectedStudent.id
                            })
                          )
                        }} />
                    })}
                    {selectedStudentsList.length === 0 ?
                      <ListGroup.Item disabled>Selected students appear here...</ListGroup.Item> : <></>
                    }
                  </ListGroup>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Staff Involved</Form.Label>
                  <Stack direction="horizontal" gap={3}>
                    <Form.Select
                      size="lg"
                      disabled={disableForms}
                      onChange={(e) => {
                        setSelectedStaff(e.target.value)
                        console.log("test")
                      }}>
                      <option key='blankChoice' hidden value>Select staff...</option>
                      {staffList.map((staff) => {
                        return <option key={staff.id} value={staff.id}>{`${staff.fname} ${staff.mname} ${staff.lname}`}</option>
                      })}
                    </Form.Select>
                    <Button variant="primary" size="lg" onClick={addStaffToSelection}>Select</Button>
                  </Stack>
                  <Form.Text className="text-muted">
                    These people will be notified when added.
                  </Form.Text>
                  <ListGroup>
                    {selectedStaffList.map((selectedStaff) => {
                      return <AppointmentFormUserList
                        key={`${selectedStaff.fname}.${selectedStaff.mname}.${selectedStaff.lname}`}
                        fname={selectedStaff.fname}
                        mname={selectedStaff.mname}
                        lname={selectedStaff.lname}
                        onButtonClick={() => {
                          setSelectedStaffList(
                            selectedStaffList.filter((x) => {
                              return x.id !== selectedStaff.id
                            })
                          )
                        }} />
                    })}
                    {selectedStaffList.length === 0 ?
                      <ListGroup.Item disabled>Selected staff appear here...</ListGroup.Item> : <></>
                    }
                  </ListGroup>
                </Form.Group>

                <Form.Group>

                  <Form.Label>Schedule Status</Form.Label>
                  <div key='inline-radio' className="mb-3 mx-3">
                    {filteredScheduleTypes.map((scheduleType) => (
                      <Form.Check
                        key={scheduleType}
                        inline
                        name="scheduletype"
                        type="radio"
                        id={`inline-radio-${scheduleType}`}
                        label={scheduleType}
                        value={scheduleType}
                        disabled={
                          Cookies.get("usertype") === "Student" || (Cookies.get("userid") !== authorUserId && Cookies.get("usertype") !== "Admin")}
                        onChange={handleChange}
                        checked={formData.scheduletype === scheduleType} />

                    ))}
                  </div>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Appointment Title</Form.Label>
                  <Form.Control
                    name="title"
                    placeholder="Required"
                    disabled={disableForms}
                    onChange={handleChange}
                    value={formData.title} />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Appointment Content</Form.Label>
                  <Form.Control
                    as={'textarea'}
                    name="content"
                    rows={5}
                    placeholder="Can either be appointment details, etc..."
                    disabled={disableForms}
                    onChange={handleChange}
                    value={formData.content} />
                </Form.Group>

                <Form.Group className="hstack gap-3 mb-3" >
                  <>
                    <Form.Label>Start Date</Form.Label>
                    <Form.Control
                      type="datetime-local"
                      name="start"
                      value={formData.start}
                      disabled={
                        (formData.scheduletype !== schedule_state.Pending &&
                          formData.scheduletype !== schedule_state.Available && id)}
                      onChange={handleChange}
                      required
                    />
                  </>
                  <>
                    <Form.Label>End Date</Form.Label>
                    <Form.Control
                      type="datetime-local"
                      name="end"
                      value={formData.end}
                      disabled={
                        (formData.scheduletype !== schedule_state.Pending &&
                          formData.scheduletype !== schedule_state.Available && id)}
                      onChange={handleChange}
                      required
                    />
                  </>
                </Form.Group>

                <Form.Group className="mb-3">

                  <Form.Label className="me-4">Repeat</Form.Label>
                  {scheduleRepeatTypes.map((scheduleRepeatType) => {
                    return <Form.Check
                      key={scheduleRepeatType}
                      inline
                      name="repeat"
                      type="radio"
                      id={`inline-radio-${scheduleRepeatType}`}
                      label={scheduleRepeatType}
                      value={scheduleRepeatType}
                      disabled={disableForms}
                      onChange={handleChange}
                      checked={formData.repeat === scheduleRepeatType} />

                  })}
                </Form.Group>

                <Stack direction="horizontal" className="gap-3 justify-content-between">
                  <div>
                    <Button variant="secondary" onClick={onModalClose}>
                      Close
                    </Button>{' '}
                    <Button variant="primary" onClick={onModalSubmit}>
                      Submit
                    </Button>{' '}
                  </div>
                  <Button variant="danger" className={`${id ? '' : 'invisible'}`} onClick={handleDelete}>
                    Delete
                  </Button>
                </Stack>

              </Form>
            </Tab>
            {id ?
              <Tab eventKey="messages" title="Minutes">
                <Chat scheduleId={id} />
              </Tab> : ''
            }
          </Tabs>
        </Modal.Body>
      </LoadingOverlay>
    </Modal>
  );
}
