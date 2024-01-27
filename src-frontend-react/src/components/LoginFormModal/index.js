import { useState } from "react";
import { Modal, Button, Tab, Col, Row } from "react-bootstrap";
import { useCookies } from "react-cookie";

import LoadingOverlay from "react-loading-overlay-ts";

import RegistrationForm from "./RegistrationForm";
import { LoginForm } from "./LoginForm";

export const LoginFormModal = ({ show, onHide }) => {
  const [cookies] = useCookies(["darkmode"]);

  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [tabKey, setTabKey] = useState("login");

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
          content: (base) => ({
            ...base,
            color: "#000000",
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
                    <LoginForm
                      setIsLoggingIn={setIsLoggingIn}
                      setTabKey={setTabKey}
                    />
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
