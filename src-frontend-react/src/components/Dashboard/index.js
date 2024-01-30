import { schedule_state, user_type } from "@prisma/client";
import moment from "moment";
import { useEffect, useState } from "react";
import {
  Card,
  Col,
  Container,
  Form,
  ListGroup,
  ListGroupItem,
  Nav,
  Row,
  Table,
} from "react-bootstrap";
import { useCookies } from "react-cookie";
import { Link } from "react-router-dom";
import { socket } from "../../socket";
import { customFetch } from "../../utils";
import { Jumbotron } from "../Jumbotron";

export const Dashboard = () => {
  const [cookies] = useCookies(["usertype"]);
  const [announcements, setAnnouncements] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [staffAvailability, setStaffAvailability] = useState([]);

  const [nonAvailableSchedules, setNonAvailableSchedules] = useState([]);
  const [availableSchedules, setAvailableSchedules] = useState([]);

  const [searchText, setSearchText] = useState("");

  const fetchAll = () => {
    Promise.all([
      customFetch(
        `${global.server_backend_url}/backend/appointments/staff-availability`,
      )
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
              x.dateString = `${moment(x.fromDate).format("dddd")}, ${moment(
                x.fromDate,
              ).format("hh:mm A")} to ${moment(x.toDate).format("hh:mm A")}`;
              return x;
            });
          setStaffAvailability(data);
        }),
      customFetch(`${global.server_backend_url}/backend/users/announcements`)
        .then((response) => {
          if (response.ok) {
            return response.json();
          }
          throw response;
        })
        .then((data) => {
          data = data
            .slice()
            .sort((a, b) => new Date(a.createdAt) + new Date(b.createdAt));
          setAnnouncements(data);
        }),
      customFetch(
        `${global.server_backend_url}/backend/appointments/schedules-summary`,
      )
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
              x.dateString = `${moment(x.fromDate).format("dddd")}, ${moment(
                x.fromDate,
              ).format("hh:mm A")} to ${moment(x.toDate).format("hh:mm A")}`;
              x.fromDateISO = x.fromDate;
              x.toDateISO = x.toDate;
              x.fromDate = moment(x.fromDate).format("MMM DD, YYYY hh:mm A");
              x.toDate = moment(x.toDate).format("MMM DD, YYYY hh:mm A");
              return x;
            });

          setAppointments(data);
          console.log("Dashboard Appointments", data);
        }),
    ]);
  };
  useEffect(() => {
    fetchAll();
    socket.on("notify", () => {
      fetchAll();
    });
  }, []);

  useEffect(() => {
    setNonAvailableSchedules(
      appointments
        .filter((appointment) => appointment.state !== schedule_state.Available)
        .filter(
          (appointment) =>
            searchText.trim() === 0 ||
            Object.values(appointment).some((value) =>
              value.toLowerCase().includes(searchText.toLowerCase()),
            ),
        ),
    );
    setAvailableSchedules(
      cookies.usertype === user_type.Student
        ? staffAvailability.filter(
            (appointment) =>
              searchText.trim().length === 0 ||
              Object.values(appointment).some((value) => {
                delete value.id;
                const stringValue =
                  typeof value === "object"
                    ? Object.values(value).toString()
                    : value.toString();
                return stringValue
                  .toLowerCase()
                  .includes(searchText.toLowerCase());
              }),
          )
        : appointments
            .filter(
              (appointment) => appointment.state === schedule_state.Available,
            )
            .filter(
              (appointment) =>
                searchText.trim().length === 0 ||
                Object.values(appointment).some((value) =>
                  value.toLowerCase().includes(searchText.toLowerCase()),
                ),
            ),
    );
  }, [searchText, appointments, cookies.usertype, staffAvailability]);
  return (
    <>
      <Jumbotron header="Dashboard">
        Browse a summary of announcements and appointments relevant to you.
      </Jumbotron>
      <Row>
        <Col>
          <Card>
            <Card.Header as="h2">Announcements</Card.Header>
            <Card.Body
              className="overflow-scroll"
              style={{ maxHeight: "16rem" }}
            >
              <ListGroup>
                {announcements.length === 0 ? (
                  <div className="text-secondary align-self-center">
                    Nothing to show
                  </div>
                ) : (
                  announcements.map((announcement) => {
                    return (
                      <ListGroupItem
                        key={`${announcement.title}.${announcement.createdAt}`}
                        className="m-2"
                      >
                        <p className="fw-bold mb-2 border-bottom border-secondary pb-2">
                          {announcement.title}
                        </p>
                        {announcement.content}
                        <p
                          className="mt-1 mb-0 text-muted"
                          style={{ fontSize: ".8rem" }}
                        >
                          {moment(announcement.createdAt).format(
                            "MMM DD, YYYY hh:mm A",
                          )}
                        </p>
                      </ListGroupItem>
                    );
                  })
                )}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Card className="shadow-sm">
        <Card.Header>
          <Form.Control
            name="search"
            placeholder="Search for schedules..."
            onChange={(e) => setSearchText(e.target.value)}
            value={searchText}
          />
        </Card.Header>
        <Card.Body className="d-flex justify-content-center">
          <Container>
            <Row className="py-2">
              <Col>
                <Card className="shadow-sm">
                  <Card.Header as={"h2"}>My Appointments</Card.Header>
                  <Card.Body className="d-flex justify-content-center">
                    {nonAvailableSchedules.length === 0 ? (
                      <div className="text-secondary align-self-center">
                        Nothing to show
                      </div>
                    ) : (
                      <div
                        className="table-responsive w-100"
                        style={{
                          height: "25rem",
                          position: "relative",
                        }}
                      >
                        <Table className="appointments-table w-100">
                          <thead>
                            <tr className="text-uppercase">
                              <th scope="col">Title</th>
                              <th scope="col">Hours</th>
                              <th scope="col">Schedule Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {nonAvailableSchedules.map((appointment) => (
                              <tr
                                key={`${appointment.title}-${appointment.fromDate}-${appointment.toDate}-${appointment.state}`}
                              >
                                <td>
                                  <Nav.Link
                                    as={Link}
                                    to={`/appointments?datetime=${appointment.fromDateISO}`}
                                  >
                                    {appointment.title}
                                  </Nav.Link>
                                </td>
                                <td>
                                  {appointment.fromDate} to
                                  <br />
                                  {appointment.toDate}
                                </td>
                                <td>{appointment.state}</td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
            <Row className="py-2">
              <Col>
                <Card className="shadow-sm">
                  <Card.Header as={"h2"}>
                    {cookies.usertype === user_type.Student
                      ? "Staff Availability"
                      : "My Availability"}
                  </Card.Header>
                  <Card.Body className="d-flex justify-content-center">
                    {availableSchedules.length === 0 ? (
                      <div className="text-secondary align-self-center">
                        Nothing to show
                      </div>
                    ) : (
                      <div
                        className="table-responsive w-100"
                        style={{
                          height: "25rem",
                          position: "relative",
                        }}
                      >
                        <Table className="appointments-table w-100">
                          <thead>
                            <tr className="text-uppercase">
                              <th scope="col">Title</th>
                              {cookies.usertype === user_type.Student ? (
                                <th scope="col">By Staff</th>
                              ) : (
                                ""
                              )}
                              <th scope="col">Starting Date</th>
                              <th scope="col">Repeats</th>
                            </tr>
                          </thead>
                          <tbody>
                            {availableSchedules.map((appointment) => (
                              <tr>
                                <td>
                                  <Nav.Link
                                    as={Link}
                                    to={`/appointments?datetime=${moment(
                                      appointment.fromDate,
                                    ).toISOString()}`}
                                  >
                                    {appointment.title}
                                  </Nav.Link>
                                </td>
                                {cookies.usertype === user_type.Student ? (
                                  <td>{`${appointment.authoredBy.lname}, ${appointment.authoredBy.fname}`}</td>
                                ) : (
                                  ""
                                )}
                                <td>{appointment.dateString}</td>
                                <td>{appointment.repeat}</td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Container>
        </Card.Body>
      </Card>
    </>
  );
};
