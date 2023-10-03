import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { useCookies } from 'react-cookie';

import LoadingOverlay from "react-loading-overlay-ts";
import { customFetch } from '../../utils';

export const LoginFormModal = ({ show, onHide, isLoggingIn }) => {

  const [cookies, setCookie] = useCookies(['accessToken', 'refreshToken', 'username'])

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
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
      setCookie("login_username", username)
      setCookie("accessToken", data.accessToken)
      setCookie("refreshToken", data.refreshToken)
      onHide(true)
    })
    // Perform your login logic here
    // For example, you can make an API call to authenticate the user
    // and handle success/failure accordingly
  };

  return (
    <Modal show={show} backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Login</Modal.Title>
      </Modal.Header>
      <LoadingOverlay active={isLoggingIn} spinner>
        <Modal.Body>
          <Form className='d-grid gap-3' >
            <Form.Group controlId="formBasicEmail">
              <Form.Label>Email address</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email"
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

            <Button variant="primary" type="button" onClick={handleLogin}>
              Login
            </Button>
          </Form>
        </Modal.Body>
      </LoadingOverlay>

    </Modal>
  );
};
