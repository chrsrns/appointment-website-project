import { Button, Col, Container, Image, Row } from "react-bootstrap";

export const LandingPage = ({ onButtonClick }) => {
  return (
    <Container className="d-flex flex-column align-items-center justify-content-center">
      <Row className="align-items-center mx-2 my-5">
        <Col className="text-center" sm={12} md={6}>
          <h3 className="mt-3 mb-3">
            WEB-BASED APPOINTMENT AND SCHEDULING SYSTEM
          </h3>
          <p>Powered by:</p>
          <div
            className="rounded-pill mb-4 p-3 d-inline-block"
            ref={(node) => {
              if (node) {
                node.style.setProperty(
                  "background-color",
                  "#f8f9fa",
                  "important",
                );
              }
            }}
          >
            <Image
              fluid
              className="w-auto"
              src={process.env.PUBLIC_URL + "/landing-page.svg"}
              alt="Logo"
            />
          </div>
          <p className="mb-5">
            <Button variant="primary" onClick={onButtonClick}>
              Get Started
            </Button>
          </p>
        </Col>
        <Col className="d-flex justify-content-center" sm={12} md={6}>
          <Image
            style={{ width: "75%" }}
            src={process.env.PUBLIC_URL + "/landing-img.svg"}
            fluid
          ></Image>
        </Col>
      </Row>
    </Container>
  );
};
