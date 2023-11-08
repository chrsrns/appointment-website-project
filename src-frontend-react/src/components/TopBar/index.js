import { useEffect, useRef, useState } from "react";
import { useCookies } from "react-cookie";
import Cookies from "js-cookie";
import {
  enable as enableDarkMode,
  disable as disableDarkMode,
} from "darkreader";
import { Button, Container, Navbar, Stack } from "react-bootstrap";

export const TopBar = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [cookies, setCookies] = useCookies(["darkmode", "login_username"]);
  const cookiesRef = useRef();

  const handleDarkModeToggleClick = () => {
    setDarkMode(!darkMode);
  };
  useEffect(() => {
    cookiesRef.current = cookies.darkmode;
  });

  useEffect(() => {
    setDarkMode(cookiesRef.current);
  }, []);

  useEffect(() => {
    console.log("darkmode changed");
    if (darkMode) {
      enableDarkMode({
        brightness: 100,
        contrast: 100,
      });
      setCookies("darkmode", true);
    } else {
      disableDarkMode();
      setCookies("darkmode", false);
    }
  }, [darkMode, setCookies]);

  return (
    <Navbar expand="lg" className="bg-body-tertiary shadow-sm">
      <Container className="justify-contents-between">
        <div>
          <Navbar.Brand href="/">
            <img
              src={process.env.PUBLIC_URL + "/school_logo.png"}
              alt="Logo"
              width={40}
              height={40}
              className="me-2"
            />
            Kapayapaan Integrated School
          </Navbar.Brand>
        </div>
        <Stack direction="horizontal" gap={3}>
          {cookies.login_username ? (
            <Stack direction="horizontal" gap={2}>
              <i className="bi bi-person" />
              {cookies.login_username}
            </Stack>
          ) : (
            ""
          )}

          <Button onClick={handleDarkModeToggleClick}>
            {darkMode ? (
              <>
                <i className="bi bi-moon-stars-fill" /> Dark
              </>
            ) : (
              <>
                <i className="bi bi-brightness-high" /> Light
              </>
            )}
          </Button>
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
        </Stack>
      </Container>
    </Navbar>
  );
};
