import { user_type } from "@prisma/client";
import { Button, Card, Col, Container, InputGroup, Row } from "react-bootstrap";
import Cookies from "js-cookie";
import { Jumbotron } from "../Jumbotron";
import { DarkModeToggleButton } from "./DarkModeToggleButton";
import { FeedbackForm } from "./FeedbackForm";
import { MyGuidanceRecords } from "./MyGuidanceRecords";
import { MyMedicalRecords } from "./MyMedicalRecords";

// TODO Use Portals to remote render the sidebar button from here to the sidebar.
export const Profile = ({ sidebarbtn_onClick }) => {

  return (
    <Container>
      <p className="float-start d-lg-none d-md-block">
        <Button variant="primary" size="sm" onClick={sidebarbtn_onClick}>
          <i className="bi bi-chevron-right"></i>
        </Button>
      </p>
      <Jumbotron header="Profile">
        Browse things related to only you.
      </Jumbotron>
      <Row>
        <Col>
          <Card className="mb-3">
            <Card.Header as={"h2"}>Settings</Card.Header>
            <Card.Body>
              <InputGroup>
                <InputGroup.Text id="btnGroupDarkMode">Toggle dark mode for the system</InputGroup.Text>
                <DarkModeToggleButton />
              </InputGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col>
          <MyMedicalRecords />
        </Col>
      </Row>
      <Row>
        <Col>
          {Cookies.get("usertype") === user_type.Student ?
            <MyGuidanceRecords />
            : ''}
        </Col>
      </Row>
      <Row>
        <Col>
          <FeedbackForm />
        </Col>
      </Row>
    </Container>
  );
};
