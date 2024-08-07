import { useEffect, useRef, useState } from "react";
import "./App.css";

import { BrowserRouter, Route, Routes } from "react-router-dom";
import {
  Card,
  Col,
  Container,
  Row,
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
import { Profile } from "./components/Profile";
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
  const [isLandingPageActive, setIsLandingPageActive] = useState(false);
  const [isModalShow, setIsModalShow] = useState(false);

  const [cookies, setCookies] = useCookies([
    "accessToken",
    "refreshToken",
    "darkmode",
  ]);

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
    const htmlEl = document.getElementsByTagName("html");
    if (cookies.darkmode === undefined) setCookies("darkmode", false);

    htmlEl[0].setAttribute(
      "data-bs-theme",
      cookies.darkmode ? "dark" : "light",
    );
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
        }
        throw response;
      })
      .then((data) => {
        Cookies.set("accessToken", data.accessToken);
        Cookies.set("refreshToken", data.refreshToken);
      })
      .catch(() => {
        Cookies.set("refreshToken", "");
        Cookies.set("accessToken", "");
        Cookies.set("userid", "");
        Cookies.set("usertype", "");
        Cookies.set("login_username", "");
      })
      .finally(() => {
        setIsLogInDone(true);
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
    document.title = "Scheduler System using React-Bootstrap";
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
    setIsLandingPageActive(!cookies.accessToken || isModalShow);
    setIsLoggedIn(cookies.accessToken);
    if (!cookies.accessToken) disconnectSocketConnection();
    else attemptSocketConnection();
  }, [cookies.accessToken, isModalShow]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      getLoggedInStatus();
      // console.log('This code runs every 1 minute');
    }, 60000);
    const socketinterval = setInterval(() => {
      if (
        !socketConnected.current &&
        (cookies.accessToken || cookies.refreshToken)
      )
        attemptSocketConnection();
    }, 1000);
    // Clean up the interval when the component unmounts
    return () => {
      clearInterval(intervalId);
      clearInterval(socketinterval);
    };
  }, [cookies.accessToken, cookies.refreshToken]);

  const handleLandingPageClick = () => {
    setIsLandingPageActive(false);
    if (!isLoggedIn) setIsModalShow(true);
  };

  /// TODO Improve/clarify how states represent logged in status (LoginFormModal should set state here if login/registration offured or the close button is merely clicked.)
  const handleModalClose = () => {
    setIsModalShow(false);
    // if (cookies.accessToken) setIsLoggedIn(true);
    // else setIsLandingPageActive(true);
  };

  return (
    <BrowserRouter>
      <LoadingOverlay
        spinner
        active={!isLogInDone}
        text={"Loading your profile..."}
        styles={{
          overlay: (base) => ({
            ...base,
            background: "var(--bs-body-bg)",
          }),
          spinner: (base) => ({
            ...base,
            "& svg circle": {
              stroke: "var(--bs-body-color)",
            },
          }),
          content: (base) => ({
            ...base,
            color: "var(--bs-body-color)",
          }),
        }}
      >
        <TopBar />
        <LoginFormModal show={isModalShow} onHide={handleModalClose} />
        {isLandingPageActive || !isLoggedIn || !isLogInDone ? (
          <div className="flex-grow-1">
            <LandingPage onButtonClick={handleLandingPageClick} />
          </div>
        ) : (
          <Container fluid className="overflow-x-hidden pt-4 px-4 bg-body">
            <Row>
              <Col
                sm={12}
                lg={{ span: 8, order: 3 }}
                xl={{ span: 9, order: 3 }}
                id="ui-body"
              >
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/appointments" element={<Appointments />} />
                  <Route path="/medrecords" element={<MedicalRecords />} />
                  <Route
                    path="/guidancerecords"
                    element={<GuidanceRecords />}
                  />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/admin" element={<AdminTools />} />
                </Routes>
              </Col>
              <Col
                sm={12}
                lg={{ span: 4, order: "last" }}
                xl={{ span: 3, order: "last" }}
                style={{ marginBottom: "3rem" }}
              >
                <Card className="shadow-sm mb-3">
                  <Card.Header as={"h2"}>Users Online</Card.Header>
                  <Card.Body>
                    <ListGroup>
                      {onlineUsers.map((user) => {
                        return (
                          <ListGroupItem
                            key={user.fname + user.lname + user.type}
                          >{`[${user.type}] ${user.lname}, ${user.fname}`}</ListGroupItem>
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
        )}
      </LoadingOverlay>
      <ToastContainer />
    </BrowserRouter>
  );
};

export default App;
