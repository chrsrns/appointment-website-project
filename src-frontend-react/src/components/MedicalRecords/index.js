import { useCallback, useEffect, useState } from 'react';
import { Accordion, Card, Button, Col, Row } from 'react-bootstrap';
import { customFetch } from '../../utils';
import { Jumbotron } from "../Jumbotron";
import { MedicalRecordsForm } from './MedicalRecordsForm';
import Cookies from 'js-cookie';
import moment from 'moment';
import { socket } from '../../socket';
import LoadingOverlay from 'react-loading-overlay-ts';
import { SelectedMedicalRecords } from './SelectedMedicalRecords';

export const MedicalRecords = ({ sidebarbtn_onClick }) => {
  const usertype = Cookies.get("usertype")
  const [medicalRecords, setMedicalRecords] = useState([]);

  const [isLoading, setIsLoading] = useState(false)
  const [isFetchingAll, setIsFetchingAll] = useState(true)
  const fetchAll = useCallback(() => {
    setIsLoading(true)
    customFetch(`${global.server_backend_url}/backend/medrecords/records`)
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        throw response;
      })
      .then((data) => {
        data = data.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        setMedicalRecords(data);
      })
      .finally(() => {
        setIsLoading(false);
        setIsFetchingAll(false);
      });
  }, [])
  useEffect(() => {
    if (isFetchingAll) fetchAll()
  }, [fetchAll, isFetchingAll])

  useEffect(() => {
    socket.on("update medrecords", () => {
      setIsLoading(true)
      setIsFetchingAll(true)
    });
  }, [])

  return (
    <LoadingOverlay active={isLoading} spinner text='Waiting for update...'>
      <p className="float-start d-lg-none d-md-block">
        <Button variant="primary" size="sm" onClick={sidebarbtn_onClick}>
          <i className="bi bi-chevron-right"></i>
        </Button>
      </p>
      <Jumbotron header="Medical Records">
        Browse a summary of your health records.
      </Jumbotron>
      <Row>
        <Col>
          <Card className='mb-3'>
            <Card.Header as="h2">My Medical Records</Card.Header>
            <Card.Body className="d-flex flex-column overflow-scroll" style={{ maxHeight: "40rem" }}>
              {medicalRecords.length !== 0 ?
                <Accordion>
                  {medicalRecords.map((record, index) => (
                    <Accordion.Item eventKey={index} key={index}>
                      <Accordion.Header>
                        {moment(record.createdAt).format('MMM DD, YYYY hh:mm A')}
                      </Accordion.Header>
                      <Accordion.Body>
                        <span style={{ whiteSpace: "pre-line" }}>
                          {record.content}
                        </span>
                      </Accordion.Body>
                    </Accordion.Item>
                  ))}
                </Accordion> : <div className='text-secondary align-self-center'>Nothing to show</div>}
            </Card.Body>
          </Card>
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
    </LoadingOverlay>
  );
};
