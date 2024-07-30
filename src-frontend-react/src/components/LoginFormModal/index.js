import { useEffect, useState } from "react";
import { Modal, Button, Tab, Col, Row } from "react-bootstrap";
import { useCookies } from "react-cookie";

import LoadingOverlay from "react-loading-overlay-ts";

import RegistrationForm from "./RegistrationForm";
import { LoginForm } from "./LoginForm";

export const LoginFormModal = ({ show, onHide }) => {
  const [cookies] = useCookies(["darkmode"]);

  const [isLoading, setIsLoading] = useState(false);

  const [tabKey, setTabKey] = useState("login");
  const [loadingText, setLoadingText] = useState("Trying to log in...");

  useEffect(() => {
    if (show === true) {
      setTabKey("login");
    }
  }, [show]);

  return (
    <Modal
      show={show}
      backdrop="static"
      onHide={() => onHide()}
      size={tabKey === "register" ? "lg" : ""}
      centered
    >
      <div className="position-relative">
        <div
          className="position-absolute"
          style={{
            zIndex: -1,
            left: "-7.5em",
            top: "-7.5em",
            rotate: "-25deg",
            opacity: 0.8,
          }}
        >
          <svg
            fill="currentColor"
            stroke-width="0"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            style={{ overflow: "visible", color: "currentcolor" }}
            height="15em"
            width="15em"
          >
            <path
              fill-rule="evenodd"
              d="M14.5 2H13V1h-1v1H4V1H3v1H1.5l-.5.5v12l.5.5h13l.5-.5v-12l-.5-.5zM14 14H2V5h12v9zm0-10H2V3h12v1zM4 8H3v1h1V8zm-1 2h1v1H3v-1zm1 2H3v1h1v-1zm2-4h1v1H6V8zm1 2H6v1h1v-1zm-1 2h1v1H6v-1zm1-6H6v1h1V6zm2 2h1v1H9V8zm1 2H9v1h1v-1zm-1 2h1v1H9v-1zm1-6H9v1h1V6zm2 2h1v1h-1V8zm1 2h-1v1h1v-1zm-1-4h1v1h-1V6z"
              clip-rule="evenodd"
            ></path>
          </svg>
        </div>
        <div
          className="position-absolute"
          style={{
            zIndex: -1,
            right: "-2em",
            top: "-2em",
            rotate: "-25deg",
            opacity: 0.8,
          }}
        >
          <svg
            fill="currentColor"
            stroke-width="0"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 512 512"
            style={{ overflow: "visible", color: "currentcolor" }}
            height="4em"
            width="4em"
          >
            <path d="M256 512a256 256 0 1 0 0-512 256 256 0 1 0 0 512z"></path>
          </svg>
        </div>
      </div>
      <Modal.Header
        closeButton={tabKey !== "Data Privacy Acknowledge and Consent"}
        data-bs-theme={cookies.darkmode ? "dark" : "light"}
      >
        <Modal.Title>
          {tabKey.replace(/\w\S*/g, function (txt) {
            return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
          })}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <LoadingOverlay
          spinner
          active={isLoading}
          text={loadingText}
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
                      setIsLoading={setIsLoading}
                      setLoadingText={setLoadingText}
                      setTabKey={setTabKey}
                    />
                  </Tab.Pane>
                  <Tab.Pane eventKey="register">
                    <RegistrationForm
                      setIsLoading={setIsLoading}
                      setLoadingText={setLoadingText}
                      setTabKey={setTabKey}
                    />
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
                        onHide();
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
        </LoadingOverlay>
      </Modal.Body>
    </Modal>
  );
};
