import { Button, Form, Stack, Toast, ToastContainer } from "react-bootstrap";
import { toast } from "react-toastify";
import { useGoogleLogin } from "@react-oauth/google";
import { useState } from "react";
import { customFetch } from "../../utils";
import { user_approval_type } from "@prisma/client";
import { useCookies } from "react-cookie";

export const LoginForm = ({ setIsLoading, setLoadingText, setTabKey }) => {
  const [, setCookie] = useCookies([
    "accessToken",
    "refreshToken",
    "login_username",
    "userid",
    "usertype",
  ]);
  const [showNotif, setShowNotif] = useState(false);
  const [responseHeader, setResponseHeader] = useState("");
  const [responseBody, setResponseBody] = useState("");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const glogin = useGoogleLogin({
    onSuccess: (tokenResponse) => handleGoogleLogin(tokenResponse),
    onError: () => toast("An error occured on Google's OAuth"),
  });

  const handleLogin = (event) => {
    event.preventDefault();
    setShowNotif(false);
    setLoadingText("Trying to log in...");
    setIsLoading(true);
    const data = {
      login_username: username,
      login_password: password,
    };

    customFetch(`${global.server_backend_url}/backend/auth/login`, {
      method: "POST",
      body: JSON.stringify(data),
    })
      .then((response) => {
        if (response.ok) return response.json();
        else throw response;
      })
      .then((data) => {
        console.log("Login Data", data);
        if (data.approved === user_approval_type.Archived) {
          setResponseHeader("Login Failed");
          setResponseBody("User is archived. Contact your admin.");
          setShowNotif(true);
        } else {
          setCookie("login_username", data.login_username);
          setCookie("accessToken", data.accessToken);
          setCookie("refreshToken", data.refreshToken);
          setCookie("usertype", data.type);
          setCookie("userid", data.id);
          setTabKey("Data Privacy Acknowledge and Consent");
        }
      })
      .catch(async (err) => {
        /// err.json() returns a Promise, so an async/await is necessary
        const errorBody = await err.json();

        setResponseHeader("Login Failed");
        setResponseBody(errorBody.msg);
        setShowNotif(true);
      })
      .finally(() => {
        setPassword("");
        setIsLoading(false);
      });
    // Perform your login logic here
    // For example, you can make an API call to authenticate the user
    // and handle success/failure accordingly
  };

  const handleGoogleLogin = (response) => {
    setShowNotif(false);
    setLoadingText("Connecting with Google...");
    setIsLoading(true);
    customFetch(`${global.server_backend_url}/backend/auth/googlelogin`, {
      method: "POST",
      headers: { Authorization: `Bearer ${response.access_token}` },
    })
      .then((response) => {
        if (response.ok) return response.json();
        else throw response;
      })
      .then((data) => {
        if (data.approved === user_approval_type.Archived) {
          setResponseHeader("Login Failed");
          setResponseBody("User is archived. Contact your admin.");
          setShowNotif(true);
        } else {
          setCookie("login_username", data.login_username);
          setCookie("accessToken", data.accessToken);
          setCookie("refreshToken", data.refreshToken);
          setCookie("usertype", data.type);
          setCookie("userid", data.id);
          setTabKey("Data Privacy Acknowledge and Consent");
        }
      })
      .catch(async (err) => {
        /// err.json() returns a Promise, so an async/await is necessary
        const errorBody = await err.json();

        setResponseHeader("Login Failed");
        setResponseBody(errorBody.msg);
        setShowNotif(true);
      })
      .finally(() => {
        setPassword("");
        setIsLoading(false);
      });
  };
  return (
    <>
      <ToastContainer className="p-3" position="top-end" style={{ zIndex: 1 }}>
        <Toast
          show={showNotif}
          onClose={() => {
            setShowNotif(false);
          }}
          delay={10000}
          autohide
        >
          <Toast.Header>
            <img
              src="holder.js/20x20?text=%20"
              className="rounded me-2"
              alt=""
            />
            <strong className="me-auto">{responseHeader}</strong>
          </Toast.Header>
          <Toast.Body>{responseBody}</Toast.Body>
        </Toast>
      </ToastContainer>
      <Button className="w-100" onClick={() => glogin()}>
        <i className="bi bi-google"></i> &ensp; Continue with Google
      </Button>
      <div className="text-center mt-2">or</div>
      <Form
        className="d-grid gap-3 w-100 mb-3"
        noValidate
        onSubmit={handleLogin}
      >
        <Form.Group controlId="formBasicEmail">
          <Form.Label>Username/LRN</Form.Label>
          <Form.Control
            type="email"
            placeholder="Enter your username or LRN"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </Form.Group>
        <Form.Group controlId="formBasicPassword">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Group>
        <Button className="w-100" variant="primary" type="submit">
          <b>Log in</b>
        </Button>
      </Form>
      <Stack direction="horizontal" className="justify-content-center mb-3">
        <Button
          variant="link"
          onClick={() => setTabKey("register")}
          className="fw-semibold"
          style={{ textDecoration: "none" }}
        >
          Register
        </Button>
        <div className="vr" />
        <Button
          variant="link"
          onClick={() =>
            toast("Please contact an administrator to reset your password.")
          }
          style={{ textDecoration: "none" }}
        >
          Forgot Password
        </Button>
      </Stack>
      <p className="text-center text-secondary">
        Demo user: demoer | Password: demo_1234
      </p>
    </>
  );
};
