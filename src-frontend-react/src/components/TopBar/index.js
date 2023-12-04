import { useCookies } from "react-cookie";
import Cookies from "js-cookie";
import { Button, Container, Navbar, Stack } from "react-bootstrap";

export const TopBar = () => {
  const [cookies] = useCookies(["login_username"]);

  return (
    <Navbar expand="lg" className="bg-body-tertiary shadow-sm">
      <Container className="justify-contents-between">
        <div>
          <Navbar.Brand href="/">
            <i className="bi bi-calendar2-week me-2"></i>
            Scheduler Project
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
