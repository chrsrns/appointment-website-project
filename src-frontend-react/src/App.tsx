import { useEffect, useRef, useState } from "react";
import "./App.css";
import "./Custom.scss";

import { BrowserRouter, Route, Routes } from "react-router-dom";
import {
  Card,
  Col,
  Container,
  Row,
  Stack,
  ListGroup,
  ListGroupItem,
} from "react-bootstrap";

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

import { LandingPage } from "./components/LandingPage";
import { TopBar } from "./components/TopBar";
import { SideBar } from "./components/SideBar";
import { Profile } from "./components/Profile";

import {
  enable as enableDarkMode,
  disable as disableDarkMode,
} from "darkreader";
import { GuidanceRecords } from "./components/GuidanceRecords";

/// TODO Separate components to other files

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
  const [isModalShow, setIsModalShow] = useState(false);

  const sidebarbtn_onClick = () => setIsActive(!isActive);
  const mainRowClassName = `row-offcanvas row-offcanvas-left ${
    isActive ? "active" : ""
  }`;
  const [cookies, setCookies] = useCookies(["accessToken", "darkmode"]);

  // useEffect(() => {
  //   document.documentElement.setAttribute(
  //     "data-bs-theme",
  //     cookies.darkmode ? "dark" : "light",
  //   );
  //   document.documentElement.setAttribute(
  //     "data-theme",
  //     cookies.darkmode ? "dark" : "light",
  //   );
  // });

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLogInDone, setIsLogInDone] = useState(false);

  const [onlineUsers, setOnlineUsers] = useState([]);
  const socketConnected = useRef(false);
  const onFirstRunLoginChecked = useRef(false);

  useEffect(() => {
    if (cookies.darkmode === undefined) setCookies("darkmode", false);

    if (cookies.darkmode) {
      enableDarkMode({
        brightness: 100,
        contrast: 100,
      });
    } else {
      disableDarkMode();
    }
  }, [cookies.darkmode, setCookies]);

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
      .catch(() => {
        Cookies.set("refreshToken", "");
        Cookies.set("accessToken", "");
        Cookies.set("userid", "");
        Cookies.set("usertype", "");
        Cookies.set("login_username", "");
      });
  };

  const attemptSocketConnection = () => {
    console.log("connecting...");
    socket.auth = {
      accessToken: Cookies.get("accessToken"),
      refreshToken: Cookies.get("refreshToken"),
    };
    console.log("socket auth: ", socket.auth);
    socket.connect();
  };
  const disconnectSocketConnection = () => {
    socket.disconnect();
  };
  useEffect(() => {
    if (!onFirstRunLoginChecked.current) {
      if (!cookies.accessToken) {
        console.log("bypass");
        setIsLogInDone(true);
      } else getLoggedInStatus();
      onFirstRunLoginChecked.current = true;
    }
  }, [cookies.accessToken]);
  useEffect(() => {
    document.title = "Kapayapaan Integrated School Scheduler System";
    if (!cookies.accessToken) {
      console.log("bypass");
      setIsLogInDone(true);
    } else getLoggedInStatus();
    socket.onAny((event, ...args) => {
      console.log("Socket onAny: ");
      console.log(event, args);
    });
    socket.on("connect", () => {
      console.log("Socket connected");
      socketConnected.current = true;
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

    return () => {
      socket.off("connect");
      socket.off("users");
      socket.off("connect_error");
      socket.off("notify");
      socket.offAny();
    };
  }, []);

  useEffect(() => {
    if (!cookies.accessToken) {
      setIsLandingPageActive(true);
      setIsLoggedIn(false);
      disconnectSocketConnection();
    } else attemptSocketConnection();
  }, [cookies]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      getLoggedInStatus();
      // console.log('This code runs every 1 minute');
    }, 60000);
    const socketinterval = setInterval(() => {
      if (!socketConnected.current) attemptSocketConnection();
    }, 1000);
    // Clean up the interval when the component unmounts
    return () => {
      clearInterval(intervalId);
      clearInterval(socketinterval);
    };
  }, []);

  const handleLandingPageClick = () => {
    setIsLandingPageActive(false);
    if (!isLoggedIn) setIsModalShow(true);
  };

  /// TODO Improve/clarify how states represent logged in status (LoginFormModal should set state here if login/registration offured or the close button is merely clicked.)
  const handleModalClose = (isCloseButtonClicked: boolean) => {
    setIsModalShow(false);
    if (!isCloseButtonClicked) setIsLoggedIn(true);
    else setIsLandingPageActive(true);
  };

  return (
    <BrowserRouter>
      <LoadingOverlay spinner active={!isLogInDone}>
        <TopBar />
        <LoginFormModal
          show={isModalShow}
          onHide={handleModalClose}
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
                      path="/guidancerecords"
                      element={
                        <GuidanceRecords
                          sidebarbtn_onClick={sidebarbtn_onClick}
                        />
                      }
                    />
                    <Route
                      path="/profile"
                      element={
                        <Profile sidebarbtn_onClick={sidebarbtn_onClick} />
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
                <SideBar />
                <Col
                  sm={12}
                  lg={{ span: 3, order: "last" }}
                  style={{ marginBottom: "3rem" }}
                >
                  <Card className="shadow-sm mb-3">
                    <Card.Header as={"h2"}>Users Online</Card.Header>
                    <Card.Body>
                      <ListGroup>
                        {onlineUsers.map((user) => {
                          return (
                            <ListGroupItem
                              key={
                                user.fname + user.mname + user.lname + user.type
                              }
                            >{`[${user.type}] ${user.lname}, ${user.fname} ${
                              user.mname ? user.mname[0] + "." : ""
                            }`}</ListGroupItem>
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
