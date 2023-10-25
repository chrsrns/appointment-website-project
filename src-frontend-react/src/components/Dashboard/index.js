import { schedule_state } from "@prisma/client";
import moment from "moment";
import { useEffect, useState } from "react";
import { Button, Card, Col, ListGroup, ListGroupItem, Row, Table } from "react-bootstrap";
import { customFetch } from "../../utils";
import { Jumbotron } from "../Jumbotron";

export const Dashboard = ({ sidebarbtn_onClick }) => {
  const [announcements, setAnnouncements] = useState([]);
  const [appointments, setAppointments] = useState([])

  useEffect(() => {
    Promise.all([
      customFetch(`${global.server_backend_url}/backend/users/announcements`)
        .then((response) => {
          if (response.ok) {
            return response.json();
          }
          throw response;
        })
        .then((data) => {
          data = data.slice().sort((a, b) => new Date(a.createdAt) + new Date(b.createdAt))
          setAnnouncements(data);
          console.log(data);
        }),
      customFetch(`${global.server_backend_url}/backend/appointments/schedules-summary`)
        .then((response) => {
          if (response.ok) {
            return response.json();
          }
          throw response;
        })
        .then((data) => {
          data = data
            .slice()
            .sort((a, b) => new Date(a.createdAt) + new Date(b.createdAt))
            .map((x) => {
              x.fromDate = moment(x.fromDate).format('MMM DD, YYYY hh:mm')
              x.toDate = moment(x.toDate).format('MMM DD, YYYY hh:mm')
              return x
            })

          setAppointments(data);
          console.log(data);
        })
    ])
  }, []);

  const nonAvailableSchedules = appointments.filter((appointment) => appointment.state !== schedule_state.Available)
  const availableSchedules = appointments.filter((appointment) => appointment.state === schedule_state.Available)
  return (
    <>
      <p className="float-start d-lg-none d-md-block">
        <Button variant="primary" size="sm" onClick={sidebarbtn_onClick}>
          <i className="bi bi-chevron-right"></i>
        </Button>
      </p>
      <Jumbotron header="Dashboard">
        Browse a summary of announcements and appointments relevant to you.
      </Jumbotron>
      <Row>
        <Col>
          <Card>
            <Card.Header as="h2">Announcements</Card.Header>
            <Card.Body className="overflow-scroll" style={{ maxHeight: "16rem" }}>
              <ListGroup>
                {
                  announcements.length === 0
                    ? <div className='text-secondary align-self-center'>Nothing to show</div> :
                    announcements.map((announcement) => {
                      return <ListGroupItem key={`${announcement.title}.${announcement.createdAt}`} className="m-2">
                        <p className="fw-bold mb-2 border-bottom border-secondary pb-2">{announcement.title}</p>
                        {announcement.content}
                        <p className="mt-1 mb-0 text-muted" style={{ fontSize: '.8rem' }}>
                          {
                            moment(announcement.createdAt).format('MMM DD, YYYY hh:mm')
                          }
                        </p>
                      </ListGroupItem>;
                    })
                }
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col>
          <Card className="shadow-sm">
            <Card.Header as={"h2"}>My Appointments</Card.Header>
            <Card.Body className="d-flex justify-content-center">
              {
                nonAvailableSchedules.length === 0
                  ? <div className='text-secondary align-self-center'>Nothing to show</div> :
                  <div
                    className="table-responsive"
                    style={{
                      height: "25rem",
                      position: "relative",
                    }}
                  >
                    <Table className="appointments-table">
                      <thead>
                        <tr className="text-uppercase">
                          <th scope="col">Title</th>
                          <th scope="col">Hours</th>
                          <th scope="col">Schedule Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {nonAvailableSchedules.map(appointment => (
                          <tr>
                            <td>{appointment.title}</td>
                            <td>{appointment.fromDate} to {appointment.toDate}</td>
                            <td>{appointment.state}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
              }
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col>
          <Card className="shadow-sm">
            <Card.Header as={"h2"}>My Availability</Card.Header>
            <Card.Body className="d-flex justify-content-center">
              {
                availableSchedules.length === 0
                  ? <div className='text-secondary align-self-center'>Nothing to show</div> :
                  <div
                    className="table-responsive"
                    style={{
                      height: "25rem",
                      position: "relative",
                    }}
                  >
                    <Table className="appointments-table">
                      <thead>
                        <tr className="text-uppercase">
                          <th scope="col">Title</th>
                          <th scope="col">Starting Date</th>
                          <th scope="col">Repeats</th>
                        </tr>
                      </thead>
                      <tbody>
                        {availableSchedules.map(appointment => (
                          <tr>
                            <td>{appointment.title}</td>
                            <td>{appointment.fromDate} to {appointment.toDate}</td>
                            <td>{appointment.repeat}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
              }
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};
