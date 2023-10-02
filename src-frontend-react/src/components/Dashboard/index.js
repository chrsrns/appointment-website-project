import moment from "moment";
import { useEffect, useState } from "react";
import { Button, Card, Col, ListGroup, ListGroupItem, Row, Table } from "react-bootstrap";
import { Jumbotron } from "../Jumbotron";

export const Dashboard = ({ sidebarbtn_onClick }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch(`${global.server_backend_url}/backend/users/announcements`)
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        throw response;
      })
      .then((data) => {
        data = data.slice().sort((a, b) => new Date(a.createdAt) + new Date(b.createdAt))
        setData(data);
        console.log(data);
      });
  }, []);

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
                {data.map((announcement) => {
                  return <ListGroupItem className="m-2">
                    <p className="fw-bold mb-2 border-bottom border-secondary pb-2">{announcement.title}</p>
                    {announcement.content}
                    <p className="mt-1 mb-0 text-black-50" style={{ fontSize: '.8rem' }}>
                      {
                        moment(announcement.createdAt).format('MMM DD, YYYY hh:mm')
                      }
                    </p>
                  </ListGroupItem>;
                })}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col>
          <Card className="shadow-sm">
            <Card.Header as={"h2"}>My Appointments</Card.Header>
            <Card.Body>
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
                      <th scope="col">Hours</th>
                      <th scope="col">By Students</th>
                      <th scope="col">Staff Involved</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Like a butterflies</td>
                      <td>Boxing</td>
                      <td>8:00 AM - 11:00 AM</td>
                    </tr>
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};
