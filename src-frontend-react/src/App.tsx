import { useEffect, useRef, useState } from "react";
import "./App.css";
import "./Custom.scss";

import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import {
  Button,
  Card,
  Col,
  Container,
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
} from "darkreader";
import { FeedbackForm } from "./components/FeedbackForm";
import { LandingPage } from "./components/LandingPage";

/// TODO Separate components to other files

const TopBar = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [cookies, setCookies] = useCookies(["darkmode"]);
  const cookiesRef = useRef();

  const handleDarkModeToggleClick = () => {
    setDarkMode(!darkMode);
  };
  useEffect(() => {
    cookiesRef.current = cookies.darkmode;
  });

  useEffect(() => {
    console.log("cookies changed");
    setDarkMode(cookiesRef.current);
  }, []);

  useEffect(() => {
    console.log("darkmode changed");
    if (darkMode) {
      enableDarkMode({
        brightness: 100,
        contrast: 100,
      });
      setCookies("darkmode", true);
    } else {
      disableDarkMode();
      setCookies("darkmode", false);
    }
  }, [darkMode, setCookies]);

  return (
    <Navbar expand="lg" className="bg-body-tertiary shadow-sm">
      <Container className="justify-contents-between">
        <div>
          <Navbar.Brand href="/">
            <img
              src={process.env.PUBLIC_URL + "/school_logo.png"}
              alt="Logo"
              width={40}
              height={40}
              className="me-2"
            />
            Kapayapaan Integrated School
          </Navbar.Brand>
        </div>
        <Stack direction="horizontal" gap={3}>
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
          <Button
            onClick={() => {
              Cookies.set("refreshToken", "");
              Cookies.set("accessToken", "");
              Cookies.set("userid", "");
            }}
          >
            Logout
          </Button>
        </Stack>
      </Container>
    </Navbar>
  );
};

const SidebarCol = () => {
  const [radios, setRadios] = useState([
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
  ]);
  useEffect(() => {
    console.log("usertype: ", Cookies.get("usertype"));
    console.log("isAdmin: ", Cookies.get("usertype") === "Admin");
    if (
      Cookies.get("usertype") === "Admin" &&
      !radios.some((e) => e.name === "Admin Tools")
    )
      setRadios([
        ...radios,
        {
          name: "Admin Tools",
          iconClass: "bi-terminal",
          value: "4",
          link: "/admin",
        },
      ]);
  }, [radios]);

  return (
    <Col
      xs={6}
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
              link={radio.link}
            />
          ))}
        </ButtonGroup>
      </div>
    </Col>
  );
};

const SidebarColBtn = ({ idx, name, iconClass, value, link }) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Button
      key={idx}
      variant={link === location.pathname ? "primary" : "secondary"}
      name="radio"
      value={value}
      onClick={() => {
        navigate(link);
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

type user = {
  self: boolean;
  login_username: string;
};
type sort_obj = {
  self: number;
  username: string;
};
const App: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [isLandingPageActive, setIsLandingPageActive] = useState(true);

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
    console.log(global.server_backend_url);

    customFetch(`${global.server_backend_url}/backend/auth/refreshToken`, {
      method: "POST",
      body: JSON.stringify(data),
    })
      .then((response) => {
        if (response.ok) {
          console.log("login successful");
          return response.json();
        } else {
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

  const attemptSocketConnection = () => {
    socket.auth = {
      accessToken: Cookies.get("accessToken"),
      refreshToken: Cookies.get("refreshToken"),
    };
    socket.connect();
  };
  useEffect(() => {
    document.title =
      "Kapayapaan Integrated School Scheduler System | JB Lustre";
    getLoggedInStatus();
    socket.onAny((event, ...args) => {
      console.log("Socket onAny: ");
      console.log(event, args);
    });
    socket.on("users", (users) => {
      users.forEach((user: user) => {
        user.self = user.login_username === Cookies.get("login_username");
        // initReactiveProperties(user);
      });
      // put the current user first, and then sort by username
      users = users.sort((a: sort_obj, b: sort_obj) => {
        if (a.self) return -1;
        if (b.self) return 1;
        if (a.username < b.username) return -1;
        return a.username > b.username ? 1 : 0;
      });
      socket.on("connect_error", (err) => {
        console.log(`Socket.io error due to: ${err.message}`);
        console.log(err);
      });

      setOnlineUsers(users);
    });
    socket.on("notify", ({ title, message }) => {
      console.log("Notify detected");
      toast(() => (
        <div style={{ fontSize: "0.8rem" }}>
          <p className="fw-bold mb-2 border-bottom border-secondary pb-2">
            {title}
          </p>
          {message}
        </div>
      ));
    });
    attemptSocketConnection();
  }, []);

  useEffect(() => {
    if (!cookies.accessToken) {
      setIsLandingPageActive(true);
      setIsLoggedIn(false);
      socket.disconnect();
    } else attemptSocketConnection();
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

  const handleLandingPageClick = () => {
    setIsLandingPageActive(false);
  };

  return (
    <BrowserRouter>
      <LoadingOverlay spinner active={!isLogInDone}>
        <TopBar />
        <LoginFormModal
          show={!isLoggedIn && !isLandingPageActive}
          onHide={setIsLoggedIn}
          isLoggingIn={!isLogInDone}
        />
        {isLandingPageActive || !isLoggedIn ? (
          <LandingPage onButtonClick={handleLandingPageClick} />
        ) : (
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
                        <MedicalRecords
                          sidebarbtn_onClick={sidebarbtn_onClick}
                        />
                      }
                    />
                    <Route
                      path="/feedback"
                      element={
                        <FeedbackForm sidebarbtn_onClick={sidebarbtn_onClick} />
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
                        {onlineUsers.map((user) => {
                          console.log("online user: ", user);
                          return (
                            <ListGroupItem
                              key={
                                user.fname + user.mname + user.lname + user.type
                              }
                            >{`[${user.type}] ${user.lname}, ${user.fname} ${user.mname[0]}.`}</ListGroupItem>
                          );
                        })}
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
        )}
      </LoadingOverlay>
      <ToastContainer />
    </BrowserRouter>
  );
};

export default App;
