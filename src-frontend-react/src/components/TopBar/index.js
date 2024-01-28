import { useCookies } from "react-cookie";
import Cookies from "js-cookie";
import { Button, Container, Nav, Navbar, Stack } from "react-bootstrap";
import { DarkModeToggleButton } from "./DarkModeToggleButton";
import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { user_type } from "@prisma/client";

export const TopBar = () => {
  const [cookies] = useCookies(["login_username"]);

  const [radios, setRadios] = useState([
    {
      name: "Dashboard",
      value: "1",
      link: "/",
    },
    {
      name: "Appointments",
      value: "2",
      link: "/appointments",
    },
    {
      name: "Profile",
      value: "3",
      link: "/profile",
    },
  ]);

  const updateRadios = useCallback(() => {
    if (
      Cookies.get("usertype") === user_type.Admin &&
      !radios.some((e) => e.name === "Admin Tools")
    )
      setRadios((prevRadios) => [
        ...prevRadios,
        {
          name: "Admin Tools",
          value: "6",
          link: "/admin",
        },
      ]);
    if (
      Cookies.get("usertype") === user_type.Clinic &&
      !radios.some((e) => e.name === "Medical Records")
    )
      setRadios((prevRadios) => [
        ...prevRadios,
        {
          name: "Medical Records",
          value: "5",
          link: "/medrecords",
        },
      ]);
    if (
      Cookies.get("usertype") === user_type.Guidance &&
      !radios.some((e) => e.name === "Guidance Records")
    )
      setRadios((prevRadios) => [
        ...prevRadios,
        {
          name: "Guidance Records",
          value: "4",
          link: "/guidancerecords",
        },
      ]);
    console.log("updating sidebar");
  }, [radios]);

  useEffect(() => {
    updateRadios();
  }, [updateRadios]);

  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Navbar expand="lg" className="bg-body-tertiary shadow-sm">
      <Container>
        <Navbar.Brand href="/">
          <i className="bi bi-calendar2-week me-2"></i>
          Scheduler Project
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse>
          <Nav
            defaultActiveKey={location.pathname}
            variant="underline"
            onSelect={(link) => {
              navigate(link);
            }}
            className="me-auto"
          >
            {cookies.login_username
              ? radios.map((radio, idx) => (
                  <TopBarNavLink
                    idx={idx}
                    key={idx}
                    name={radio.name}
                    link={radio.link}
                  />
                ))
              : ""}
          </Nav>
          <Navbar.Text as="div" className="">
            <Stack
              className="justify-content-between"
              direction="horizontal"
              gap={3}
            >
              {cookies.login_username ? (
                <Stack direction="horizontal" gap={2}>
                  <i className="bi bi-person" />
                  {cookies.login_username}
                </Stack>
              ) : (
                ""
              )}
              <Stack direction="horizontal" gap={3}>
                {cookies.login_username ? (
                  <Button
                    onClick={() => {
                      Cookies.set("refreshToken", "");
                      Cookies.set("accessToken", "");
                      Cookies.set("usertype", "");
                      Cookies.set("userid", "");
                      Cookies.set("login_username", "");
                    }}
                  >
                    Logout
                  </Button>
                ) : (
                  ""
                )}
                <DarkModeToggleButton />
              </Stack>
            </Stack>
          </Navbar.Text>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

const TopBarNavLink = ({ idx, name, link }) => {
  return (
    <Nav.Link key={idx} eventKey={link}>
      {name}
    </Nav.Link>
  );
};
