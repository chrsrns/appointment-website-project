import { useEffect, useState } from "react";
import { Button, Card, Col, Form, FormGroup, Row } from "react-bootstrap";
import { Jumbotron } from "../Jumbotron";
import RegistrationForm from "./RegistrationForm";

export const AdminTools = ({ sidebarbtn_onClick }) => {

  const [data, setData] = useState([]);

  useEffect(() => {
    fetch(`${global.server_backend_url}/backend/users/announcements`)
      .then((response) => {
        if (response.ok) {
          console.log("res ok")
          return response.json();
        }
        throw response;
      })
      .then((data) => {
        setData(data);
        console.log(data);
      }).catch((err) => {
        console.log(err)
      });
  }, []);

  return (
    <>
      <p className="float-start d-lg-none d-md-block">
        <Button variant="primary" size="sm" onClick={sidebarbtn_onClick}>
          <i className="bi bi-chevron-right"></i>
        </Button>
      </p>
      <Jumbotron header="Admin Tools">
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
            <Card.Header as={"h2"}>Announcements Management</Card.Header>
            <Card.Body>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};
