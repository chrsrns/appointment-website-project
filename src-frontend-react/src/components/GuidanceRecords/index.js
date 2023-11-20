import { Card, Button, Col, Row } from 'react-bootstrap';
import { Jumbotron } from "../Jumbotron";
import { GuidanceRecordsForm } from './GuidanceRecordsForm';
import Cookies from 'js-cookie';
import { SelectedGuidanceRecords } from './SelectedGuidanceRecords';
import { user_type } from '@prisma/client';

export const GuidanceRecords = ({ sidebarbtn_onClick }) => {
  const usertype = Cookies.get("usertype")

  return (
    <>
      <p className="float-start d-lg-none d-md-block">
        <Button variant="primary" size="sm" onClick={sidebarbtn_onClick}>
          <i className="bi bi-chevron-right"></i>
        </Button>
      </p>
      <Jumbotron header="Guidance Records">
        Browse a summary of your guidance records.
      </Jumbotron>
      <Row>
        <Col>
        </Col>
      </Row>
      {usertype === user_type.Guidance ?
        <Row>
          <Col>
            <SelectedGuidanceRecords />
          </Col>
        </Row> : null}
      {usertype === user_type.Guidance ?
        <Row>
          <Col>
            <Card className='mb-3'>
              <Card.Header as="h2">Add Guidance Record To User</Card.Header>
              <Card.Body>
                <GuidanceRecordsForm />
              </Card.Body>
            </Card>
          </Col>
        </Row> : null}
    </>
  );
};
