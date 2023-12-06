import { Button, Card, Col, Row } from "react-bootstrap";
import { Jumbotron } from "../Jumbotron";

import { momentLocalizer } from "react-big-calendar";
import moment from "moment";
import DragAndDropCalendar from "../DragAndDropCalendar";

const localizer = momentLocalizer(moment);
export const Appointments = ({ sidebarbtn_onClick }) => {
  return (
    <>
      <Jumbotron header="Appointments" onSideBarToggleClick={sidebarbtn_onClick}>
        Let people know when you are available
      </Jumbotron>
      <Row>
        <Col>
          <Card>
            <Card.Header as="h2">Manage Appointments</Card.Header>
            <Card.Body>
              <DragAndDropCalendar localizer={localizer} />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};
