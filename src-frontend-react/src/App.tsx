import { useEffect, useState } from "react";
import "./App.css";

import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
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
  ButtonGroup,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";

import { useCookies } from "react-cookie";

import { LoginFormModal } from "./components/LoginFormModal";
import LoadingOverlay from "react-loading-overlay-ts";
import { AdminTools } from "./components/AdminTools";
import { Dashboard } from "./components/Dashboard";
import { Appointments } from "./components/Appointments";

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

type SidebarColBtnType = {
  name: string;
  iconClass: string;
  value: string;
  link: string;
};
const SidebarCol = () => {
  const [radioValue, setRadioValue] = useState("1");

  const radios: SidebarColBtnType[] = [
    { name: "Dashboard", iconClass: "bi-columns-gap", value: "1", link: "/" },
    {
      name: "Appointments",
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
  const location = useLocation();

  return (
    <Button
      variant={link === location.pathname ? "primary" : "secondary"}
      name="radio"
      value={value}
      onClick={(e) => {
        navigate(link);
        setRadioValue(e.currentTarget.value);
      }}
      size="lg"
      className="shadow-sm rounded-pill"
      style={{ fontSize: "1.5rem" }}
    >
      <i className={`bi ${iconClass} mx-2`}></i>
      {name}
    </Button>
  );
};

const App: React.FC = () => {
  const [cookies, setCookie] = useCookies([
    "accessToken",
    "refreshToken",
    "username",
  ]);

  const [isActive, setIsActive] = useState(false);
  const sidebarbtn_onClick = () => setIsActive(!isActive);
  const mainRowClassName = `row-offcanvas row-offcanvas-left ${
    isActive ? "active" : ""
  }`;

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLogInDone, setIsLogInDone] = useState(false);

  const getLoggedInStatus = () => {
    const data = { refreshToken: cookies.refreshToken };
    console.log(`token: ${data}`);

    fetch(`${global.server_backend_url}/backend/auth/refreshToken`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
      .then((response) => {
        if (response.ok) return response.json();
        else {
          setIsLoggedIn(false);
          setIsLogInDone(true);
        }
        throw response;
      })
      .then((data) => {
        setCookie("accessToken", data.accessToken);
        setCookie("refreshToken", data.refreshToken);
        setIsLoggedIn(true);
        setIsLogInDone(true);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => getLoggedInStatus(), []);

  return (
    <BrowserRouter>
      <LoadingOverlay spinner active={!isLogInDone}>
        <TopBar />
        <LoginFormModal
          show={!isLoggedIn}
          onHide={setIsLoggedIn}
          isLoggingIn={!isLogInDone}
        />
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
                  <Route path="/admin" element={<AdminTools />} />
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
      </LoadingOverlay>
    </BrowserRouter>
  );
};

export default App;
