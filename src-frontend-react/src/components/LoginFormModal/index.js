import React, { useEffect, useState } from 'react';
import { Modal, Button, Form, Tab, Tabs, Col, Row } from 'react-bootstrap';
import { useCookies } from 'react-cookie';

import LoadingOverlay from "react-loading-overlay-ts";
import { customFetch } from '../../utils';

import RegistrationForm from './RegistrationForm';

const DEFAULT_REG_FORM_VALUES = {
  fname: '',
  mname: '',
  lname: '',
  addr: '',
  cnum: '',
  emailaddr: '',
  bdate: '',
  type: '',
  login_username: '', // Add username field
}

export const LoginFormModal = ({ show, onHide, isLoggingIn }) => {
  const [cookies, setCookie] = useCookies(['accessToken', 'refreshToken', 'login_username'])

  const [regFormData, setRegFormData] = useState(DEFAULT_REG_FORM_VALUES)
  const [regFormErrors, setRegFormErrors] = useState(DEFAULT_REG_FORM_VALUES)
  const [userTypes, setUserTypes] = useState([])

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

  const fetchAll = () => {
    Promise.all([

      customFetch(`${global.server_backend_url}/backend/auth/usertypes`)
        .then((response) => {
          if (response.ok)
            return response.json(); else throw response;
        }).then((data) => {
          setUserTypes(data)
        })
    ])
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRegFormData({
      ...regFormData,
      [name]: value,
    });
  };

  useEffect(() => {
    fetchAll()
  }, [])
  return (
    <Modal size='lg' show={show} backdrop="static">
      <Modal.Header>
        <Modal.Title>Login</Modal.Title>
      </Modal.Header>
      <LoadingOverlay active={isLoggingIn} spinner>
        <Modal.Body>
          <Tabs defaultActiveForm="login" className="mb-3">
            <Tab eventKey="login" title="Login">
              <Form className='d-grid gap-3 mb-3' >
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
              </Form>
              <Button variant="primary" type="button" onClick={handleLogin}>
                Login
              </Button>
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
