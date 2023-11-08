import { useState } from 'react';
import { Modal, Button, Form, Tab, Tabs, ToastContainer, Toast, Stack } from 'react-bootstrap';
import { useCookies } from 'react-cookie';

import LoadingOverlay from "react-loading-overlay-ts";
import { customFetch } from '../../utils';

import RegistrationForm from './RegistrationForm';
import { useGoogleLogin } from '@react-oauth/google';
import { toast } from 'react-toastify';

export const LoginFormModal = ({ show, onHide, isLoggingIn }) => {
  const [cookies, setCookie] = useCookies(['accessToken', 'refreshToken', 'login_username', 'darkmode'])

  const [showNotif, setShowNotif] = useState(false)
  const [responseHeader, setResponseHeader] = useState("")
  const [responseBody, setResponseBody] = useState("")

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const glogin = useGoogleLogin({
    onSuccess: tokenResponse => handleGoogleLogin(tokenResponse),
    onError: response => toast("An error occured on Google's OAuth")
  });

  const handleLogin = (event) => {
    event.preventDefault();
    console.log("test submit")
    setShowNotif(false)
    const data = {
      login_username: username,
      login_password: password
    }

    customFetch(`${global.server_backend_url}/backend/auth/login`, {
      method: 'POST',
      body: JSON.stringify(data)
    }).then((response) => {
      if (response.ok)
        return response.json(); else throw response;
    }).then((data) => {
      setCookie("login_username", data.login_username)
      setCookie("accessToken", data.accessToken)
      setCookie("refreshToken", data.refreshToken)
      setCookie("usertype", data.type)
      setCookie("userid", data.id)
      onHide(false)
    }).catch(async (err) => {
      /// err.json() returns a Promise, so an async/await is necessary
      const errorBody = await err.json()

      setResponseHeader("Login Failed")
      setResponseBody(errorBody.msg)
      setShowNotif(true)
    }).finally(() => setPassword(""))
    // Perform your login logic here
    // For example, you can make an API call to authenticate the user
    // and handle success/failure accordingly
  };

  const handleGoogleLogin = (response) => {
    customFetch(`${global.server_backend_url}/backend/auth/googlelogin`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${response.access_token}` }
    }).then((response) => {
      if (response.ok)
        return response.json(); else throw response;
    }).then((data) => {
      setCookie("login_username", data.login_username)
      setCookie("accessToken", data.accessToken)
      setCookie("refreshToken", data.refreshToken)
      setCookie("usertype", data.type)
      setCookie("userid", data.id)
      onHide(false)
    }).catch(async (err) => {
      /// err.json() returns a Promise, so an async/await is necessary
      const errorBody = await err.json()

      setResponseHeader("Login Failed")
      setResponseBody(errorBody.msg)
      setShowNotif(true)
    }).finally(() => setPassword(""))
  };

  return (
    <Modal
      size='lg'
      show={show}
      backdrop="static"
      onHide={() => onHide(true)}
    >
      <Modal.Header closeButton data-bs-theme={cookies.darkmode ? "dark" : "light"}>
        <Modal.Title>Login</Modal.Title>
      </Modal.Header>
      <LoadingOverlay active={isLoggingIn} spinner>
        <Modal.Body>
          <Tabs defaultActiveForm="login" className="mb-3">
            <Tab eventKey="login" title="Login">
              <ToastContainer className="p-3" position='top-end' style={{ zIndex: 1 }}>
                <Toast show={showNotif} onClose={() => { setShowNotif(false) }} delay={10000} autohide>
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
              <Form className='d-grid gap-3' noValidate onSubmit={handleLogin} >
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
                <Stack direction='horizontal' gap={3}>
                  <Button variant="primary" type="submit">
                    Login
                  </Button>
                  <Button onClick={() => glogin()}><i class="bi bi-google"></i></Button>
                </Stack>
              </Form>
            </Tab>
            <Tab eventKey="register" title="Register">
              <RegistrationForm />
            </Tab>
          </Tabs>
        </Modal.Body>
      </LoadingOverlay>

    </Modal>
  );
};
