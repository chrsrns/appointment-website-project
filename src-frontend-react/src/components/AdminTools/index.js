import { Button, Card, Col, Row } from "react-bootstrap";
import { Jumbotron } from "../Jumbotron";
import { AnnouncementsForm } from "./AnnouncementsForm";
import RegistrationForm from "./RegistrationForm";
import UserApprovalComponent from "./UserApproval";

export const AdminTools = ({ sidebarbtn_onClick }) => {

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
              <AnnouncementsForm />
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row>
        <UserApprovalComponent />
      </Row>
    </>
  );
};
