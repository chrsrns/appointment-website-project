import { Button, Col, Container, Row } from "react-bootstrap"

export const LandingPage = ({ onButtonClick }) => {

  return (
    <Container
      className="d-flex flex-column align-items-center justify-content-center"
      style={{ height: "80vh" }}
    >
      <Row className="justify-contents-center">
        <Col className="text-center">
          <i className="bi bi-calendar2-week" style={{ fontSize: '12rem' }}></i>
          <br />
          <h2 className="mt-3 mb-5">
            WEB-BASED APPOINTMENT AND SCHEDULING SYSTEM WITH INFORMATION
            MANAGEMENT USING REACT-BOOTSTRAP PRISMA AND EXPRESS
          </h2>
          <p>Powered by:</p>
          <img className="w-25 mb-5" src={process.env.PUBLIC_URL + "/landing-page.svg"} alt="Logo" />
          <p>
            <Button variant="primary" onClick={onButtonClick}>Get Started</Button>
          </p>
        </Col>
      </Row>
    </Container>
  );
};
