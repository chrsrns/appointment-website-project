import { Card, Button, Col, Row } from 'react-bootstrap';
import { Jumbotron } from "../Jumbotron";
import { MedicalRecordsForm } from './MedicalRecordsForm';
import Cookies from 'js-cookie';
import { SelectedMedicalRecords } from './SelectedMedicalRecords';

export const MedicalRecords = ({ sidebarbtn_onClick }) => {
  const usertype = Cookies.get("usertype")

  return (
    <>
      <Jumbotron header="Medical Records" onSideBarToggleClick={sidebarbtn_onClick}>
        Browse a summary of your health records.
      </Jumbotron>
      <Row>
        <Col>
        </Col>
      </Row>
      {usertype === "Clinic" ?
        <Row>
          <Col>
            <SelectedMedicalRecords />
          </Col>
        </Row> : null}
      {usertype === "Clinic" ?
        <Row>
          <Col>
            <Card className='mb-3'>
              <Card.Header as="h2">Add Medical Record To User</Card.Header>
              <Card.Body>
                <MedicalRecordsForm />
              </Card.Body>
            </Card>
          </Col>
        </Row> : null}
    </>
  );
};
