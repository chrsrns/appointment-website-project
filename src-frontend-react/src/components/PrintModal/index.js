import moment from "moment";
import { useRef, useState } from "react";
import {
  Modal,
  Card,
  ListGroup,
  Button,
  Tabs,
  Tab,
  Form,
} from "react-bootstrap";
import { useCookies } from "react-cookie";
import { useReactToPrint } from "react-to-print";
import Chat from "../Chat/ChatBubble";

export const PrintModal = ({ show, onClose, records }) => {
  const [cookies] = useCookies(["darkmode"]);

  const componentRef = useRef();
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    pageStyle: "margin: 5em",
  });

  const [formData, setFormData] = useState({
    desc: "",
  });
  const [checkedItems, setCheckedItems] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleCheckChange = (e) => {
    const { name } = e.target;
    setCheckedItems({
      ...checkedItems,
      [name]: !checkedItems[name],
    });
    console.log(formData);
  };

  return (
    <Modal size="lg" show={show} onHide={onClose}>
      <Modal.Header
        closeButton
        data-bs-theme={cookies.darkmode ? "dark" : "light"}
      >
        <Modal.Title>Print Schedule Data</Modal.Title>
      </Modal.Header>
      <Modal.Body className="m-3">
        <Tabs
          defaultActiveKey="configure"
          id="print-tabs"
          className="mb-3"
          justify
        >
          <Tab eventKey="configure" title="Configure">
            <Form.Group controlId="descText" className="mb-3">
              <Form.Label>Description for this print:</Form.Label>
              <Form.Control
                type="description"
                as={"textarea"}
                rows={3}
                name="desc"
                value={formData.desc}
                onChange={handleChange}
              />
            </Form.Group>
            <p className="mb-2 mt-3">Schedules to Print:</p>
            {records.map((record) => (
              <Card className="shadow-sm mb-3">
                <Card.Header>
                  <Form.Check
                    inline
                    name={`record-${record.id}`}
                    id={`print-card-record-checkbox-${record.id}`}
                    onChange={handleCheckChange}
                    checked={checkedItems[`record-${record.id}`] === true}
                  />
                  Schedule Title: <b>{record.title}</b>
                </Card.Header>
                <Card.Body>
                  <p>Description: {record.desc}</p>
                  <p>
                    Schedule Start:{" "}
                    {moment(record.fromDate).format("MMM DD, YYYY hh:mm A")}
                  </p>
                  <p>
                    Schedule End:{" "}
                    {moment(record.toDate).format("MMM DD, YYYY hh:mm A")}
                  </p>
                  <ListGroup>
                    {record.Users.map((user) => (
                      <ListGroup.Item>{`[${user.type}] ${user.lname}, ${
                        user.fname
                      }`}</ListGroup.Item>
                    ))}
                  </ListGroup>
                </Card.Body>
              </Card>
            ))}
          </Tab>
          <Tab eventKey="output-preview" title="Output Preview">
            <Button className="mb-3" onClick={handlePrint}>
              Print
            </Button>
            <div ref={componentRef}>
              <div className="mb-3">
                This record was taken on{" "}
                {moment(Date.now()).format("MMM DD, YYYY hh:mm A")}
              </div>
              <div>Print Description: </div>
              <p>{formData.desc}</p>
              {records
                .filter(
                  (record) => checkedItems[`record-${record.id}`] === true,
                )
                .map((record) => (
                  <Card
                    id={`print-card-record-${record.id}`}
                    className="shadow-sm mb-3"
                  >
                    <Card.Header>
                      Schedule Title: <b>{record.title}</b>
                    </Card.Header>
                    <Card.Body>
                      <p>Description: {record.desc}</p>
                      <p>Schedule State: {record.state}</p>
                      <p>
                        Schedule Start:{" "}
                        {moment(record.fromDate).format("MMM DD, YYYY hh:mm A")}
                      </p>
                      <p>
                        Schedule End:{" "}
                        {moment(record.toDate).format("MMM DD, YYYY hh:mm A")}
                      </p>
                      <p>Repeat: {record.repeat}</p>
                      <p className="mb-2">Users Involved: </p>
                      <ListGroup>
                        {record.Users.map((user) => (
                          <ListGroup.Item>{`[${user.type}] ${user.lname}, ${
                            user.fname
                          }`}</ListGroup.Item>
                        ))}
                      </ListGroup>
                      <p className="mb-3">Minutes: </p>
                      <Chat scheduleId={record.id} hideTextBox={true} />
                    </Card.Body>
                  </Card>
                ))}
            </div>
          </Tab>
        </Tabs>
      </Modal.Body>
    </Modal>
  );
};
