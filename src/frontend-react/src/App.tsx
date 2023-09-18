import * as React from "react";
import "./App.css";

import { BrowserRouter } from "react-router-dom";
import {
  Button,
  Card,
  Col,
  Container,
  Nav,
  NavDropdown,
  Navbar,
  Row,
  Stack,
  ListGroup,
  ListGroupItem,
  Table,
} from "react-bootstrap";

const TopBar = () => {
  return (
    <Navbar expand="lg" className="bg-body-tertiary">
      <Container>
        <Navbar.Brand href="#home">Integrated School</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="#home">Home</Nav.Link>
            <Nav.Link href="#link">Link</Nav.Link>
            <NavDropdown title="Dropdown" id="basic-nav-dropdown">
              <NavDropdown.Item href="#action/3.1">Action</NavDropdown.Item>
              <NavDropdown.Item href="#action/3.2">
                Another action
              </NavDropdown.Item>
              <NavDropdown.Item href="#action/3.3">Something</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item href="#action/3.4">
                Separated link
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

type JumbotronProps = {
  header: string;
  children: React.ReactNode;
};
const Jumbotron: React.FC<JumbotronProps> = ({ header, children }) => {
  return (
    <div className="jumbotron">
      <h1>{header}</h1>
      <p>{children}</p>
    </div>
  );
};

const App = () => {
  const [isActive, setIsActive] = React.useState(false);
  const sidebarbtn_onClick = () => setIsActive(!isActive);
  const mainRowClassName = `row-offcanvas row-offcanvas-left ${
    isActive ? "active" : ""
  }`;

  return (
    <BrowserRouter>
      <TopBar />
      <Stack>
        <Container fluid>
          <Row className={mainRowClassName}>
            <Col sm={12} md={{ span: 6, order: 3 }} id="ui-body">
              <p className="float-start d-md-none d-sm-block">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={sidebarbtn_onClick}
                >
                  <i className="bi bi-chevron-right"></i>
                </Button>
              </p>
              <Jumbotron header="Dashboard">
                Browse a summary of announcements and appointments relevant to
                you.
              </Jumbotron>
              <Row>
                <Col sm={12}>
                  <Card>
                    <Card.Header as="h2">Announcements</Card.Header>
                    <Card.Body>
                      <ListGroup>
                        <ListGroupItem>Announcement 1</ListGroupItem>
                        <ListGroupItem>Announcement 2</ListGroupItem>
                      </ListGroup>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
              <Row>
                <Col sm={12} md={{ order: 2 }}>
                  <Card>
                    <Card.Header as={"h2"}>My Appointments</Card.Header>
                    <Card.Body>
                      <div
                        className="table-responsive"
                        style={{
                          height: "25rem",
                          position: "relative",
                        }}
                      >
                        <Table className="appointments-table">
                          <thead>
                            <tr className="text-uppercase">
                              <th scope="col">Hours</th>
                              <th scope="col">By Students</th>
                              <th scope="col">Staff Involved</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td>Like a butterflies</td>
                              <td>Boxing</td>
                              <td>9:00 AM - 11:00 AM</td>
                            </tr>
                          </tbody>
                        </Table>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Col>
            <Col
              sm={6}
              md={{ span: 3, order: "1" }}
              className="sidebar-offcanvas"
              id="sidebar"
            >
              <div className="list-group">
                <a href="#" className="list-group-item active">
                  I'm the Sidebar
                </a>
                <a href="#" className="list-group-item">
                  Link
                </a>
                <a href="#" className="list-group-item">
                  Link
                </a>
                <a href="#" className="list-group-item">
                  Link
                </a>
                <a href="#" className="list-group-item">
                  Link
                </a>
                <a href="#" className="list-group-item">
                  Link
                </a>
                <a href="#" className="list-group-item">
                  Link
                </a>
                <a href="#" className="list-group-item">
                  Link
                </a>
                <a href="#" className="list-group-item">
                  Link
                </a>
                <a href="#" className="list-group-item">
                  Link
                </a>
              </div>
            </Col>
            <Col
              sm={12}
              md={{ span: 3, order: "last" }}
              style={{ marginBottom: "3rem" }}
            >
              <div className="list-group">
                <a href="#" className="list-group-item active">
                  I'm the Sidebar
                </a>
                <a href="#" className="list-group-item">
                  Link
                </a>
                <a href="#" className="list-group-item">
                  Link
                </a>
                <a href="#" className="list-group-item">
                  Link
                </a>
              </div>
            </Col>
          </Row>
        </Container>
      </Stack>
    </BrowserRouter>
  );
};

export default App;
