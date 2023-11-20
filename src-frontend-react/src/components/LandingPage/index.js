import { Button, Col, Container, Row } from "react-bootstrap"

export const LandingPage = ({ onButtonClick }) => {

  return (
    <Container
      className="d-flex flex-column align-items-center justify-content-center"
      style={{ height: "80vh" }}
    >
      <Row className="justify-contents-center">
        <Col className="text-center">
          <img src={process.env.PUBLIC_URL + "/school_logo.png"} alt="Logo" />
          <h2 className="my-5">
            WEB-BASED APPOINTMENT AND SCHEDULING SYSTEM WITH INFORMATION
            MANAGEMENT FOR KAPAYAPAAN INTEGRATED SCHOOL
          </h2>
          <p>
            <Button variant="primary" onClick={onButtonClick}>Get Started</Button>
          </p>
        </Col>
      </Row>
    </Container>
  );
};
