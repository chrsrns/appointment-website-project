import React, { useState } from 'react';
import { Form, Button, Container, Row, Col } from 'react-bootstrap';

function RegistrationForm() {
  const [formData, setFormData] = useState({
    fname: '',
    mname: '',
    lname: '',
    addr: '',
    phoneNumber: '',
    emailaddr: '',
    birthday: '',
    username: '', // Add username field
    password: '', // Add password field
  });

  const [formErrors, setFormErrors] = useState({
    fname: '',
    mname: '',
    lname: '',
    addr: '',
    phoneNumber: '',
    emailaddr: '',
    birthday: '',
    username: '', // Add username field
    password: '', // Add password field
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validateForm = () => {
    let isValid = true;
    const newFormErrors = { ...formErrors };

    // Validate First Name
    if (formData.fname.trim() === '') {
      newFormErrors.fname = 'First Name is required';
      isValid = false;
    } else {
      newFormErrors.fname = '';
    }

    // Validate Middle Name
    if (formData.mname.trim() === '') {
      newFormErrors.mname = 'Middle Name is required';
      isValid = false;
    } else {
      newFormErrors.mname = '';
    }

    // Validate Last Name
    if (formData.lname.trim() === '') {
      newFormErrors.lname = 'Last Name is required';
      isValid = false;
    } else {
      newFormErrors.lname = '';
    }

    // Validate Address
    if (formData.addr.trim() === '') {
      newFormErrors.addr = 'Address is required';
      isValid = false;
    } else {
      newFormErrors.addr = '';
    }

    // Validate Email
    const emailPattern = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    if (!formData.emailaddr.trim().match(emailPattern)) {
      newFormErrors.emailaddr = 'Invalid email address';
      isValid = false;
    } else {
      newFormErrors.emailaddr = '';
    }

    // Validate Phone Number
    const phonePattern = /^\d{11}$/;
    if (!formData.phoneNumber.trim().match(phonePattern)) {
      newFormErrors.phoneNumber = 'Phone number must be 11 digits';
      isValid = false;
    } else {
      newFormErrors.phoneNumber = '';
    }

    // Validate Birthday (you can add custom date validation logic)
    if (formData.birthday.trim() === '') {
      newFormErrors.birthday = 'Birthday is required';
      isValid = false;
    } else {
      newFormErrors.birthday = '';
    }

    // Validate Username
    if (formData.username.trim() === '') {
      newFormErrors.username = 'Username is required';
      isValid = false;
    } else {
      newFormErrors.username = '';
    }

    // Validate Password
    if (formData.password.length < 6) {
      newFormErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    } else {
      newFormErrors.password = '';
    }

    setFormErrors(newFormErrors);
    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      // Handle form submission here (e.g., send data to a server).
      const formatted =
      {
        fname: formData.fname,
        mname: formData.mname,
        lname: formData.lname,
        cnum: formData.phoneNumber,
        emailaddr: formData.emailaddr,
        bdate: new Date(formData.birthday),
        login_username: formData.username,
        login_password: formData.password
      }
      console.log(formatted)

    } else {
      console.log('Form validation failed');
    }
  };

  return (
    <Container>
      <Row>
        <Col>
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="firstName" className="mb-3">
              <Form.Label>First Name</Form.Label>
              <Form.Control
                type="text"
                name="fname"
                value={formData.fname}
                onChange={handleChange}
                required
              />
              <div className="text-danger">{formErrors.fname}</div>
            </Form.Group>
            <Form.Group controlId="middleName" className="mb-3">
              <Form.Label>Middle Name</Form.Label>
              <Form.Control
                type="text"
                name="mname"
                value={formData.mname}
                onChange={handleChange}
                required
              />
              <div className="text-danger">{formErrors.mname}</div>
            </Form.Group>
            <Form.Group controlId="lastName" className="mb-3">
              <Form.Label>Last Name</Form.Label>
              <Form.Control
                type="text"
                name="lname"
                value={formData.lname}
                onChange={handleChange}
                required
              />
              <div className="text-danger">{formErrors.lname}</div>
            </Form.Group>
            <Form.Group controlId="addr" className="mb-3">
              <Form.Label>Address</Form.Label>
              <Form.Control
                type="text"
                name="addr"
                value={formData.addr}
                onChange={handleChange}
                required
              />
              <div className="text-danger">{formErrors.addr}</div>
            </Form.Group>           <Form.Group controlId="emailaddr" className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="emailaddr"
                value={formData.emailaddr}
                onChange={handleChange}
                required
              />
              <div className="text-danger">{formErrors.emailaddr}</div>
            </Form.Group>
            <Form.Group controlId="phoneNumber" className="mb-3">
              <Form.Label>Phone Number</Form.Label>
              <Form.Control
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
              />
              <div className="text-danger">{formErrors.phoneNumber}</div>
            </Form.Group>
            <Form.Group controlId="birthday" className="mb-3">
              <Form.Label>Birthday</Form.Label>
              <Form.Control
                type="date"
                name="birthday"
                value={formData.birthday}
                onChange={handleChange}
                required
              />
              <div className="text-danger">{formErrors.birthday}</div>
            </Form.Group>
            <Form.Group controlId="username" className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
              />
              <div className="text-danger">{formErrors.username}</div>
            </Form.Group>

            <Form.Group controlId="password" className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <div className="text-danger">{formErrors.password}</div>
            </Form.Group>
            <Button className="mt-2" variant="primary" type="submit">
              Register
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}

export default RegistrationForm;
