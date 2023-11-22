import { Button, Card, Col, Row } from "react-bootstrap";
import { Jumbotron } from "../Jumbotron";
import { AnnouncementsForm } from "./AnnouncementsForm";
import UserManagementForm from "./UserManagementForm";
import UserApprovalComponent from "./UserApproval";
import Cookies from "js-cookie";
import FeedbackAnalytics from "./FeedbackAnalytics";

export const AdminTools = ({ sidebarbtn_onClick }) => {
  const usertype = Cookies.get("usertype")

  return (
    <>
      {usertype === "Admin" ?
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
              <FeedbackAnalytics />
            </Col>
          </Row>
          <Row>
            <Col>
              <Card>
                <Card.Header as="h2">Users Management</Card.Header>
                <Card.Body>
                  <UserManagementForm />
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
        : null
      }
    </>
  );
};
