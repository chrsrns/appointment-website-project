import { useEffect, useState } from "react";
import { Card, Col, Form, FormGroup, Row } from "react-bootstrap";
import { Jumbotron } from "../Jumbotron";
import RegistrationForm from "./RegistrationForm";

export const AdminTools = () => {

  const [data, setData] = useState([]);

  useEffect(() => {
    fetch(`${process.env.SERVER_URL}/backend/users/announcements`)
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        throw response;
      })
      .then((data) => {
        setData(data);
        console.log(data);
      });
  }, []);

  return (
    <>
      <Jumbotron header="AdminTools">
        Create and update database details
      </Jumbotron>
      <Row>
        <Col>
          <Card>
            <Card.Header as="h2">Users Management</Card.Header>
            <Card.Body>
              <RegistrationForm />
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col>
          <Card className="shadow-sm">
            <Card.Header as={"h2"}>My Appointments</Card.Header>
            <Card.Body>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};
