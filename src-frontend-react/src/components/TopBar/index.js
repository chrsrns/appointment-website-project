import { useCookies } from "react-cookie";
import Cookies from "js-cookie";
import { Button, Container, Nav, Navbar, Stack } from "react-bootstrap";
import { DarkModeToggleButton } from "./DarkModeToggleButton";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { user_type } from "@prisma/client";

const DEFAULT_RADIOS = [
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
];

export const TopBar = () => {
  const [cookies] = useCookies(["login_username", "usertype"]);

  const [radios, setRadios] = useState(DEFAULT_RADIOS);

  const radiosRef = useRef();

  useEffect(() => {
    radiosRef.current = radios;
  }, [radios]);

  const updateRadios = useCallback(() => {
    setRadios(DEFAULT_RADIOS);
    console.log("updating radios");
    if (
      cookies.usertype === user_type.Admin &&
      !radiosRef.current.some((e) => e.name === "Admin Tools")
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
      cookies.usertype === user_type.Clinic &&
      !radiosRef.current.some((e) => e.name === "Medical Records")
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
      cookies.usertype === user_type.Guidance &&
      !radiosRef.current.some((e) => e.name === "Guidance Records")
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
  }, [cookies.usertype]);

  useEffect(() => {
    updateRadios();
  }, [updateRadios]);

  const navigate = useNavigate();
  const location = useLocation();

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const isBelowLgBreakpoint = windowWidth < 992;

  return (
    <Navbar
      expand={cookies.login_username ? "lg" : true}
      className="bg-body-tertiary shadow-sm"
    >
      <Container className="px-4">
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
            className={`me-auto ${isBelowLgBreakpoint ? "gap-1" : ""}`}
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
