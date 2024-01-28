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
    >
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
