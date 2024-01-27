import { useState } from "react";
import {
  Modal,
  Button,
  Form,
  Tab,
  ToastContainer,
  Toast,
  Stack,
  Col,
  Row,
  Container,
} from "react-bootstrap";
import { useCookies } from "react-cookie";

import LoadingOverlay from "react-loading-overlay-ts";
import { customFetch } from "../../utils";

import RegistrationForm from "./RegistrationForm";
import { useGoogleLogin } from "@react-oauth/google";
import { toast } from "react-toastify";
import { user_approval_type } from "@prisma/client";

export const LoginFormModal = ({ show, onHide }) => {
  const [cookies, setCookie] = useCookies([
    "accessToken",
    "refreshToken",
    "login_username",
    "darkmode",
  ]);

  const [showNotif, setShowNotif] = useState(false);
  const [responseHeader, setResponseHeader] = useState("");
  const [responseBody, setResponseBody] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [tabKey, setTabKey] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const glogin = useGoogleLogin({
    onSuccess: (tokenResponse) => handleGoogleLogin(tokenResponse),
    onError: () => toast("An error occured on Google's OAuth"),
  });

  const handleLogin = (event) => {
    event.preventDefault();
    setShowNotif(false);
    setIsLoggingIn(true);
    const data = {
      login_username: username,
      login_password: password,
    };

    customFetch(`${global.server_backend_url}/backend/auth/login`, {
      method: "POST",
      body: JSON.stringify(data),
    })
      .then((response) => {
        if (response.ok) return response.json();
        else throw response;
      })
      .then((data) => {
        console.log("Login Data", data);
        if (data.approved === user_approval_type.Archived) {
          setResponseHeader("Login Failed");
          setResponseBody("User is archived. Contact your admin.");
          setShowNotif(true);
        } else {
          setCookie("login_username", data.login_username);
          setCookie("accessToken", data.accessToken);
          setCookie("refreshToken", data.refreshToken);
          setCookie("usertype", data.type);
          setCookie("userid", data.id);
          setTabKey("Data Privacy Acknowledge and Consent");
        }
      })
      .catch(async (err) => {
        /// err.json() returns a Promise, so an async/await is necessary
        const errorBody = await err.json();

        setResponseHeader("Login Failed");
        setResponseBody(errorBody.msg);
        setShowNotif(true);
      })
      .finally(() => {
        setPassword("");
        setIsLoggingIn(false);
      });
    // Perform your login logic here
    // For example, you can make an API call to authenticate the user
    // and handle success/failure accordingly
  };

  const handleGoogleLogin = (response) => {
    setShowNotif(false);
    setIsLoggingIn(true);
    customFetch(`${global.server_backend_url}/backend/auth/googlelogin`, {
      method: "POST",
      headers: { Authorization: `Bearer ${response.access_token}` },
    })
      .then((response) => {
        if (response.ok) return response.json();
        else throw response;
      })
      .then((data) => {
        if (data.approved === user_approval_type.Archived) {
          setResponseHeader("Login Failed");
          setResponseBody("User is archived. Contact your admin.");
          setShowNotif(true);
        } else {
          setCookie("login_username", data.login_username);
          setCookie("accessToken", data.accessToken);
          setCookie("refreshToken", data.refreshToken);
          setCookie("usertype", data.type);
          setCookie("userid", data.id);
          setTabKey("Data Privacy Acknowledge and Consent");
        }
      })
      .catch(async (err) => {
        /// err.json() returns a Promise, so an async/await is necessary
        const errorBody = await err.json();

        setResponseHeader("Login Failed");
        setResponseBody(errorBody.msg);
        setShowNotif(true);
      })
      .finally(() => {
        setPassword("");
        setIsLoggingIn(false);
      });
  };

  return (
    <Modal show={show} backdrop="static" onHide={() => onHide(true)}>
      <Modal.Header
        closeButton
        data-bs-theme={cookies.darkmode ? "dark" : "light"}
      >
        <Modal.Title>
          {tabKey.replace(/\w\S*/g, function (txt) {
            return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
          })}
        </Modal.Title>
      </Modal.Header>
      <LoadingOverlay
        spinner
        active={isLoggingIn}
        text={"Trying to log in..."}
        styles={{
          overlay: (base) => ({
            ...base,
            background: "rgba(255, 255, 255, 1)",
          }),
          spinner: (base) => ({
            ...base,
            "& svg circle": {
              stroke: "#000000",
            },
          }),
        }}
      >
        <Modal.Body>
          <Tab.Container
            id="login-tabs"
            defaultActiveKey="login"
            activeKey={tabKey}
            onSelect={(k) => setTabKey(k)}
          >
            <Row>
              <Col>
                <Tab.Content>
                  <Tab.Pane eventKey="login">
                    <ToastContainer
                      className="p-3"
                      position="top-end"
                      style={{ zIndex: 1 }}
                    >
                      <Toast
                        show={showNotif}
                        onClose={() => {
                          setShowNotif(false);
                        }}
                        delay={10000}
                        autohide
                      >
                        <Toast.Header>
                          <img
                            src="holder.js/20x20?text=%20"
                            className="rounded me-2"
                            alt=""
                          />
                          <strong className="me-auto">{responseHeader}</strong>
                        </Toast.Header>
                        <Toast.Body>{responseBody}</Toast.Body>
                      </Toast>
                    </ToastContainer>
                    <Form
                      className="d-grid gap-3 w-100 mb-3"
                      noValidate
                      onSubmit={handleLogin}
                    >
                      <Form.Group controlId="formBasicEmail">
                        <Form.Label>Username/LRN</Form.Label>
                        <Form.Control
                          type="email"
                          placeholder="Enter your username or LRN"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                        />
                      </Form.Group>
                      <Form.Group controlId="formBasicPassword">
                        <Form.Label>Password</Form.Label>
                        <Form.Control
                          type="password"
                          placeholder="Password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                      </Form.Group>
                      <Container>
                        <Row>
                          <Col xs={8} className="ps-0">
                            <Button
                              className="w-100"
                              variant="primary"
                              type="submit"
                            >
                              <b>LOGIN</b>
                            </Button>
                          </Col>
                          <Col className="pe-0">
                            <Button className="w-100" onClick={() => glogin()}>
                              <i class="bi bi-google"></i>
                            </Button>
                          </Col>
                        </Row>
                      </Container>
                    </Form>
                    <Stack
                      direction="horizontal"
                      className="justify-content-center mb-3"
                    >
                      <Button
                        variant="link"
                        onClick={() => setTabKey("register")}
                      >
                        Register
                      </Button>
                      <div className="vr" />
                      <Button
                        variant="link"
                        onClick={() =>
                          toast(
                            "Please contact an administrator to reset your password.",
                          )
                        }
                      >
                        Forgot Password
                      </Button>
                    </Stack>
                  </Tab.Pane>
                  <Tab.Pane eventKey="register">
                    <RegistrationForm />
                    <div className="d-flex w-100 justify-content-center">
                      <Button
                        className="mx-auto"
                        variant="link"
                        onClick={() => setTabKey("login")}
                      >
                        Login
                      </Button>
                    </div>
                  </Tab.Pane>
                  <Tab.Pane eventKey="Data Privacy Acknowledge and Consent">
                    <p>
                      By tapping Accept and Continue, I agree to the Terms and
                      Conditions and Privacy Notice and I am giving "WEB-BASED
                      APPOINTMENT AND SCHEDULING SYSTEM WITH INFORMATION
                      MANAGEMENT FOR KAPAYAPAAN INTEGRATED SCHOOL" my consent to
                      use my Personal Data to: facilitate my schedules; collect
                      system feedback; and to process information for
                      statistical, analytical, and research purposes. This
                      consent is given freely without prejudice to my rights as
                      data subject to access and correct my Personal Data, as
                      well as object and be informed of any further use of the
                      same.
                    </p>
                    <Button
                      className="w-100"
                      onClick={() => {
                        onHide(false);
                        setTabKey("login");
                      }}
                    >
                      ACCEPT AND CONTINUE
                    </Button>
                  </Tab.Pane>
                </Tab.Content>
              </Col>
            </Row>
          </Tab.Container>
        </Modal.Body>
      </LoadingOverlay>
    </Modal>
  );
};
