import { useEffect, useState } from "react";
import "./App.css";
import "./Custom.scss";

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
  ListGroupItem,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";

import { LoginFormModal } from "./components/LoginFormModal";
import LoadingOverlay from "react-loading-overlay-ts";
import { AdminTools } from "./components/AdminTools";
import { Dashboard } from "./components/Dashboard";
import { Appointments } from "./components/Appointments";
import { MedicalRecords } from "./components/MedicalRecords";
import { customFetch } from "./utils";

import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { socket } from "./socket";
import Cookies from "js-cookie";
import { useCookies } from "react-cookie";
import SideNotifications from "./components/Notifications";

import {
  enable as enableDarkMode,
  disable as disableDarkMode,
  auto as followSystemColorScheme,
  exportGeneratedCSS as collectCSS,
  isEnabled as isDarkReaderEnabled,
} from "darkreader";

/// TODO Separate components to other files

const TopBar = () => {
  const [darkMode, setDarkMode] = useState(false);

  const handleDarkModeToggleClick = () => {
    setDarkMode(!darkMode);
  };

  useEffect(() => {
    // if (darkMode)
    //   document.documentElement.setAttribute("data-bs-theme", "dark");
    // else document.documentElement.setAttribute("data-bs-theme", "light");
    //
    if (darkMode)
      enableDarkMode({
        brightness: 100,
        contrast: 100,
      });
    else disableDarkMode();
  }, [darkMode]);

  return (
    <Navbar expand="lg" className="bg-body-tertiary shadow-sm">
      <Container className="justify-contents-between">
        <>
          <Navbar.Brand href="#home">Integrated School</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
        </>
        <Button onClick={handleDarkModeToggleClick}>
          {darkMode ? (
            <>
              <i className="bi bi-moon-stars-fill" /> Dark
            </>
          ) : (
            <>
              <i className="bi bi-brightness-high" /> Light
            </>
          )}
        </Button>
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
      name: "Medical Records",
      iconClass: "bi-bandaid",
      value: "5",
      link: "/medrecords",
    },
    {
      name: "Feedback",
      iconClass: "bi-graph-up",
      value: "3",
      link: "/feedback",
    },
    {
      name: "Admin Tools",
      iconClass: "bi-terminal",
      value: "4",
      link: "/admin",
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
              key={idx}
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
      key={idx}
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
  const [isActive, setIsActive] = useState(false);
  const sidebarbtn_onClick = () => setIsActive(!isActive);
  const mainRowClassName = `row-offcanvas row-offcanvas-left ${
    isActive ? "active" : ""
  }`;

  const [cookies] = useCookies(["accessToken"]);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLogInDone, setIsLogInDone] = useState(false);

  const [onlineUsers, setOnlineUsers] = useState([]);

  const getLoggedInStatus = () => {
    const data = { refreshToken: Cookies.get("refreshToken") };

    customFetch(`${global.server_backend_url}/backend/auth/refreshToken`, {
      method: "POST",
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
        Cookies.set("accessToken", data.accessToken);
        Cookies.set("refreshToken", data.refreshToken);
        setIsLoggedIn(true);
        setIsLogInDone(true);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const fetchAll = () => {
    customFetch(`${global.server_backend_url}/backend/users/onlineusers`, {})
      .then((response) => {
        if (response.ok) return response.json();
        throw response;
      })
      .then((data) => {
        setOnlineUsers(data);
      })
      .catch((error) => {
        console.error(error);
        toast("Something went wrong when fetching online users.");
      });
  };

  const attemptSocketConnection = () => {
    socket.auth = {
      accessToken: Cookies.get("accessToken"),
      refreshToken: Cookies.get("refreshToken"),
    };
    socket.connect();
  };
  useEffect(() => {
    fetchAll();
    getLoggedInStatus();
    socket.onAny((event, ...args) => {
      console.log("Socket onAny: ");
      console.log(event, args);
    });
    socket.on("online users changed", () => {
      fetchAll();
    });
    socket.on("schedule updated", ({ schedTitle }) => {
      toast(`Schedule "${schedTitle}" was updated.`);
    });
    attemptSocketConnection();
  }, []);

  useEffect(() => {
    attemptSocketConnection();
  }, [cookies]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      getLoggedInStatus();
      // console.log('This code runs every 1 minute');
    }, 60000);
    // Clean up the interval when the component unmounts
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return (
    <BrowserRouter>
      <LoadingOverlay spinner active={!isLogInDone}>
        <TopBar />
        <LoginFormModal
          show={!isLoggedIn}
          onHide={setIsLoggedIn}
          isLoggingIn={!isLogInDone}
        />
        <Stack className="pt-4 px-2 bg-body">
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
                  <Route
                    path="/medrecords"
                    element={
                      <MedicalRecords sidebarbtn_onClick={sidebarbtn_onClick} />
                    }
                  />
                  <Route
                    path="/admin"
                    element={
                      <AdminTools sidebarbtn_onClick={sidebarbtn_onClick} />
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
                <Card className="shadow-sm mb-3">
                  <Card.Header as={"h2"}>People Online</Card.Header>
                  <Card.Body>
                    <ListGroup>
                      {onlineUsers.map((user) => (
                        <ListGroupItem>{`[${user.type}] ${user.lname}, ${user.fname} ${user.mname[0]}.`}</ListGroupItem>
                      ))}
                    </ListGroup>
                  </Card.Body>
                </Card>
                <Card className="shadow-sm mb-3">
                  <Card.Header as={"h2"}>Notifications</Card.Header>
                  <Card.Body>
                    <SideNotifications />
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Container>
        </Stack>
      </LoadingOverlay>
      <ToastContainer />
    </BrowserRouter>
  );
};

export default App;
