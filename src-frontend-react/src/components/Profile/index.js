import { user_type } from "@prisma/client";
import { Card, Col, InputGroup, Row } from "react-bootstrap";
import Cookies from "js-cookie";
import { Jumbotron } from "../Jumbotron";
import { FeedbackForm } from "./FeedbackForm";
import { MyGuidanceRecords } from "./MyGuidanceRecords";
import { MyMedicalRecords } from "./MyMedicalRecords";

// TODO Use Portals to remote render the sidebar button from here to the sidebar.
export const Profile = () => {
  return (
    <>
      <Jumbotron header="Profile">Browse things related to only you.</Jumbotron>
      <Row>
        <Col>
          <MyMedicalRecords />
        </Col>
      </Row>
      {Cookies.get("usertype") === user_type.Student ? (
        <Row>
          <Col>
            <MyGuidanceRecords />
          </Col>
        </Row>
      ) : (
        ""
      )}
      <Row>
        <Col>
          <FeedbackForm />
        </Col>
      </Row>
    </>
  );
};
