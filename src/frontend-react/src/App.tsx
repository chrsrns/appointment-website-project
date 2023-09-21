import * as React from "react";
import "./App.css";

import { BrowserRouter, Route, Routes } from "react-router-dom";
import {
  Button,
  Card,
  Col,
  Container,
  Nav,
  NavDropdown,
  Navbar,
  Row,
  Stack,
  ListGroup,
  ListGroupItem,
  Table,
  ButtonGroup,
  ToggleButton,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const TopBar = () => {
  return (
    <Navbar expand="lg" className="bg-body-tertiary shadow-sm">
      <Container>
        <Navbar.Brand href="#home">Integrated School</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="#home">Home</Nav.Link>
            <Nav.Link href="#link">Link</Nav.Link>
            <NavDropdown title="Dropdown" id="basic-nav-dropdown">
              <NavDropdown.Item href="#action/3.1">Action</NavDropdown.Item>
              <NavDropdown.Item href="#action/3.2">
                Another action
              </NavDropdown.Item>
              <NavDropdown.Item href="#action/3.3">Something</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item href="#action/3.4">
                Separated link
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

type JumbotronProps = {
  header: string;
  children: React.ReactNode;
};
const Jumbotron: React.FC<JumbotronProps> = ({ header, children }) => {
  return (
    <div className="jumbotron shadow-sm">
      <h1>{header}</h1>
      <p>{children}</p>
    </div>
  );
};

const Dashboard = ({ sidebarbtn_onClick }) => {
  const [data, setData] = React.useState([]);

  React.useEffect(() => {
    fetch("http://localhost:3001/users/announcements")
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        throw response;
      })
      .then((data) => {
        setData(data);
        console.log(data);
      });
  }, []);

  return (
    <>
      <p className="float-start d-lg-none d-md-block">
        <Button variant="primary" size="sm" onClick={sidebarbtn_onClick}>
          <i className="bi bi-chevron-right"></i>
        </Button>
      </p>
      <Jumbotron header="Dashboard">
        Browse a summary of announcements and appointments relevant to you.
      </Jumbotron>
      <Row>
        <Col>
          <Card>
            <Card.Header as="h2">Announcements</Card.Header>
            <Card.Body>
              <ListGroup>
                {data.map((announcement) => {
                  return <ListGroupItem>{announcement.content}</ListGroupItem>;
                })}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col>
          <Card className="shadow-sm">
            <Card.Header as={"h2"}>My Appointments</Card.Header>
            <Card.Body>
              <div
                className="table-responsive"
                style={{
                  height: "25rem",
                  position: "relative",
                }}
              >
                <Table className="appointments-table">
                  <thead>
                    <tr className="text-uppercase">
                      <th scope="col">Hours</th>
                      <th scope="col">By Students</th>
                      <th scope="col">Staff Involved</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Like a butterflies</td>
                      <td>Boxing</td>
                      <td>8:00 AM - 11:00 AM</td>
                    </tr>
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

const Appointments = ({ sidebarbtn_onClick }) => {
  const [data, setData] = React.useState([]);

  return (
    <>
      <p className="float-start d-lg-none d-md-block">
        <Button variant="primary" size="sm" onClick={sidebarbtn_onClick}>
          <i className="bi bi-chevron-right"></i>
        </Button>
      </p>
      <Jumbotron header="Appointments">
        Let people know when you are available
      </Jumbotron>
      <Row>
        <Col>
          <Card>
            <Card.Header as="h2">Manage Appointments</Card.Header>
            <Card.Body>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

type SidebarColBtnType = {
  name: string;
  iconClass: string;
  value: string;
  link: string;
};
const SidebarCol = () => {
  const [radioValue, setRadioValue] = React.useState("1");

  const radios: SidebarColBtnType[] = [
    { name: "Dashboard", iconClass: "bi-columns-gap", value: "1", link: "/" },
    {
      name: "Analytics",
      iconClass: "bi-clipboard",
      value: "2",
      link: "/appointments",
    },
    {
      name: "Feedback",
      iconClass: "bi-graph-up",
      value: "3",
      link: "/feedback",
    },
  ];

  return (
    <Col
      sm={6}
      lg={{ span: 3, order: "1" }}
      className="sidebar-offcanvas"
      id="sidebar"
    >
      <div>
        <ButtonGroup className="d-grid gap-2">
          {radios.map((radio, idx) => (
            <SidebarColBtn
              idx={idx}
              name={radio.name}
              iconClass={radio.iconClass}
              value={radio.value}
              radioValue={radioValue}
              setRadioValue={setRadioValue}
              link={radio.link}
            />
          ))}
        </ButtonGroup>
      </div>
    </Col>
  );
};

const SidebarColBtn = ({
  idx,
  name,
  iconClass,
  value,
  radioValue,
  setRadioValue,
  link,
}) => {
  const navigate = useNavigate();

  return (
    <ToggleButton
      key={idx}
      id={`radio-${idx}`}
      type="radio"
      variant={radioValue === value ? "primary" : "secondary"}
      name="radio"
      value={value}
      checked={radioValue === value}
      onChange={(e) => {
        navigate(link);
        setRadioValue(e.currentTarget.value);
      }}
      size="lg"
      className="shadow-sm rounded-pill"
      style={{ fontSize: "1.5rem" }}
    >
      <i className={`bi ${iconClass} mx-2`}></i>
      {name}
    </ToggleButton>
  );
};

const App: React.FC = () => {
  const [isActive, setIsActive] = React.useState(false);
  const sidebarbtn_onClick = () => setIsActive(!isActive);
  const mainRowClassName = `row-offcanvas row-offcanvas-left ${
    isActive ? "active" : ""
  }`;

  return (
    <BrowserRouter>
      <TopBar />
      <Stack className="mt-4 px-2">
        <Container fluid>
          <Row className={mainRowClassName}>
            <Col sm={12} lg={{ span: 6, order: 3 }} id="ui-body">
              <Routes>
                <Route
                  path="/"
                  element={
                    <Dashboard sidebarbtn_onClick={sidebarbtn_onClick} />
                  }
                />
                <Route
                  path="/appointments"
                  element={
                    <Appointments sidebarbtn_onClick={sidebarbtn_onClick} />
                  }
                />
              </Routes>
            </Col>
            <SidebarCol />
            <Col
              sm={12}
              lg={{ span: 3, order: "last" }}
              style={{ marginBottom: "3rem" }}
            >
              <Card className="shadow-sm">
                <Card.Header as={"h2"}>People Online</Card.Header>
                <Card.Body>
                  <ListGroup>
                    <ListGroup.Item>Cras justo odio</ListGroup.Item>
                    <ListGroup.Item>Dapibus ac facilisis in</ListGroup.Item>
                    <ListGroup.Item>Morbi leo risus</ListGroup.Item>
                    <ListGroup.Item>Porta ac consectetur ac</ListGroup.Item>
                    <ListGroup.Item>Vestibulum at eros</ListGroup.Item>
                  </ListGroup>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </Stack>
    </BrowserRouter>
  );
};

export default App;
