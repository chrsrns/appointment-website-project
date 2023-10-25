import moment from 'moment';
import { useRef } from 'react';
import { Modal, Card, ListGroup, Button, Stack } from 'react-bootstrap';
import { useReactToPrint } from 'react-to-print';

export const PrintModal = ({ show, onClose, records }) => {
  const componentRef = useRef()
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    pageStyle: "margin: 5em"
  });

  return (
    <Modal size='lg' show={show} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>Print Schedule Data</Modal.Title>
      </Modal.Header>
      <Modal.Body className='m-3' ref={componentRef}>
        <Stack direction='horizontal' gap={3} className='align-items-center mb-3'>
          <div>This record was taken on {moment(Date.now()).format('MMM DD, YYYY hh:mm A')}</div>
          <Button onClick={handlePrint}>Print</Button>
        </Stack>
        {records.map((record) => (
          <Card className="shadow-sm mb-3">
            <Card.Header>Schedule Title: <b>{record.title}</b></Card.Header>
            <Card.Body>
              <p>Description: {record.desc}</p>
              <p>Schedule State: {record.state}</p>
              <p>Schedule Start: {moment(record.fromDate).format('MMM DD, YYYY hh:mm A')}</p>
              <p>Schedule End: {moment(record.toDate).format('MMM DD, YYYY hh:mm A')}</p>
              <p>Repeat: {record.repeat}</p>
              <ListGroup>
                {record.Users.map((user) => (
                  <ListGroup.Item>{`[${user.type}] ${user.lname}, ${user.fname} ${user.mname[0]}.`}</ListGroup.Item>
                )
                )}
              </ListGroup>
            </Card.Body>
          </Card>
        ))}
      </Modal.Body>

    </Modal>
  );
};
