import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { Form, Button, Container, Row, Col, Stack } from 'react-bootstrap';
import Select from 'react-select'

import LoadingOverlay from 'react-loading-overlay-ts';

const DEFAULT_FORM_VALUES = {
  id: '',
  fname: '',
  mname: '',
  lname: '',
  addr: '',
  cnum: '',
  emailaddr: '',
  bdate: '',
  type: '',
  login_username: '', // Add username field
  login_password: '', // Add password field
}

/// NOTE The `{ ...DEFAULT_FORM_VALUES }` is used because simply
//      placing `DEFAULT_FORM_VALUES` seems to make it so that 
//      the forms modify this variable
const DEFAULT_SELECT_VALUE = { value: { ...DEFAULT_FORM_VALUES }, label: "Create new user" }

function RegistrationForm() {

  const [usersList, setUsersList] = useState([])
  const [userTypes, setUserTypes] = useState([])

  const [usersListOptions, setUsersListOptions] = useState([])
  const [selectedUser, setSelectedUser] = useState({ ...DEFAULT_SELECT_VALUE })

  const [formData, setFormData] = useState({ ...DEFAULT_FORM_VALUES });

  const [formErrors, setFormErrors] = useState({ ...DEFAULT_FORM_VALUES });

  const [isLoading, setIsLoading] = useState(true)

  const resetToDefault = () => {
    setFormData({ ...DEFAULT_FORM_VALUES })
    setFormErrors({ ...DEFAULT_FORM_VALUES })
    setSelectedUser({ ...DEFAULT_SELECT_VALUE })

  }

  const fetchAll = () => {
    setIsLoading(true)
    Promise.all([
      fetch(`${global.server_backend_url}/backend/admin/users`)
        .then((response) => {
          if (response.ok) return response.json();
          else throw response;
        })
        .then((data) => {
          setUsersList(data)
          return data;
        }),
      fetch(`${global.server_backend_url}/backend/admin/usertypes`)
        .then((response) => {
          if (response.ok) return response.json();
          else throw response;
        })
        .then((data) => {
          setUserTypes(data)
          return data;
        })
    ]).then(responses => {
      console.log("done")
      setIsLoading(false)
    })
  }

  useEffect(() => {
    fetchAll()
  }, [])

  useEffect(() => {
    setUsersListOptions([{ ...DEFAULT_SELECT_VALUE }, ...usersList.map((user) => {
      return { value: user, label: `[${user.type}] ${user.lname}, ${user.fname} ${user.mname}` }
    })])
    console.log(usersList)
  }, [usersList])

  useEffect(() => {
    console.log(usersListOptions)
  }, [usersListOptions])

  const handleUserSelectionChange = (e) => {
    setSelectedUser({ value: e.value, label: e.label })
    const user = e.value

    user.login_password = ''
    user.bdate = moment(user.bdate).format('YYYY-MM-DD')

    setFormData(user)
    console.log(user)

  }

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
    if (!formData.cnum.trim().match(phonePattern)) {
      newFormErrors.cnum = 'Phone number must be 11 digits';
      isValid = false;
    } else {
      newFormErrors.cnum = '';
    }

    // Validate Birthday (you can add custom date validation logic)
    if (formData.bdate.trim() === '') {
      newFormErrors.bdate = 'Birthday is required';
      isValid = false;
    } else {
      newFormErrors.bdate = '';
    }

    // Validate Username
    if (formData.login_username.trim() === '') {
      newFormErrors.login_username = 'Username is required';
      isValid = false;
    } else {
      newFormErrors.login_username = '';
    }

    // Validate Password
    if (formData.login_password.length < 6 && formData.login_password.length != 0 && formData.id) {
      newFormErrors.login_password = 'Password must be at least 6 characters long or be left blank to leave unchanged';
      isValid = false;
    } else if (formData.login_password.length < 6 && !formData.id) {
      newFormErrors.login_password = 'Password must be at least 6 characters long when creating a user';
      isValid = false;
    } else {
      newFormErrors.login_password = '';
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
        addr: formData.addr,
        cnum: formData.cnum,
        emailaddr: formData.emailaddr,
        bdate: moment(new Date(formData.bdate)).toISOString(),
        type: formData.type,
        login_username: formData.login_username,
      }

      if (formData.id) { /// Means user is updated only. Do not include password field if empty

        if (formData.login_password)
          formatted.login_password = formData.login_password

        fetch(`${global.server_backend_url}/backend/admin/user/${formData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formatted)
        }).then((response) => {
          console.log(response)
          fetchAll()
          resetToDefault()

          if (response.ok) {
            return response.json();
          } else throw response;
        }).catch((err) => {
          console.log(err)
        })

      } else { /// Means user is created, not updated

        formatted.login_password = formData.login_password

        fetch(`${global.server_backend_url}/backend/admin/user`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formatted)
        }).then((response) => {
          console.log(response)
          fetchAll()
          resetToDefault()

          if (response.ok) {
            return response.json();
          } else throw response;
        }).catch((err) => {
          console.log(err)
        })

      }
      console.log(formatted)

    } else {
      console.log('Form validation failed');
    }
  };

  const handleDelete = () => {
    if (formData.id) {
      fetch(`${global.server_backend_url}/backend/admin/user/${formData.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      }).then((response) => {
        console.log(response)
        if (response.ok) {
          fetchAll()
          resetToDefault()
          console.log(response)
          return response.json();
        } else throw response;
      }).catch((err) => {
        console.log(err)
      })
    }
  }

  return (
    <LoadingOverlay active={isLoading} spinner text='Waiting for update...'>
      <Container>
        <Row>
          <Col>
            <Form onSubmit={handleSubmit}>
              {/* <Form.Group className='mb-3'> */}
              {/*   <Form.Select size="lg" onChange={(e) => { */}
              {/*     setSelectedUser(e.target.value) */}
              {/*   }}> */}
              {/*     <option key='newUser' value='newUser'>Create New User...</option> */}
              {/*     {usersList.map((user) => { */}
              {/*       return <option key={user.id} value={user.id}>{`[${user.type}] ${user.fname} ${user.mname} ${user.lname}`}</option> */}
              {/*     })} */}
              {/*   </Form.Select> */}
              {/* </Form.Group> */}
              <Select className='fs-5 mb-3' options={usersListOptions} value={selectedUser} onChange={handleUserSelectionChange} />
              <Row className="mb-3">
                <Form.Group as={Col} md="4" controlId="firstName">
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
                <Form.Group as={Col} md="4" controlId="middleName">
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
                <Form.Group as={Col} md="4" controlId="lastName">
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
              </Row>
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
              </Form.Group>
              <Row className="mb-3">
                <Form.Group as={Col} md="6" controlId="emailaddr">
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
                <Form.Group as={Col} md="6" controlId="cnum">
                  <Form.Label>Phone Number</Form.Label>
                  <Form.Control
                    type="tel"
                    name="cnum"
                    value={formData.cnum}
                    onChange={handleChange}
                    required
                  />
                  <div className="text-danger">{formErrors.cnum}</div>
                </Form.Group>
              </Row>
              <Form.Group controlId="bdate" className="mb-3">
                <Form.Label>Birthday</Form.Label>
                <Form.Control
                  type="date"
                  name="bdate"
                  value={formData.bdate}
                  onChange={handleChange}
                  required
                />
                <div className="text-danger">{formErrors.bdate}</div>
              </Form.Group>
              <Form.Group>
                <Form.Label>User Type</Form.Label>
                <div key='inline-radio' className="mb-3">
                  {userTypes.map((userType) => (
                    <Form.Check
                      inline
                      name="type"
                      type="radio"
                      id={`inline-radio-${userType}`}
                      label={userType}
                      value={userType}
                      onChange={handleChange}
                      checked={formData.type === userType} />

                  ))}
                </div>
              </Form.Group>

              <Row className="mb-3">
                <Form.Group as={Col} md="6" controlId="login_username">
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    type="text"
                    name="login_username"
                    value={formData.login_username}
                    onChange={handleChange}
                    required
                  />
                  <div className="text-danger">{formErrors.login_username}</div>
                </Form.Group>

                <Form.Group as={Col} md="6" controlId="login_password">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="login_password"
                    value={formData.login_password}
                    onChange={handleChange}
                  />
                  <div className="text-danger">{formErrors.login_password}</div>
                </Form.Group>
              </Row>
              <Stack direction="horizontal" className="gap-3 justify-content-between">
                <Button className="mt-2" variant="primary" type="submit">
                  {`${formData.id ? 'Modify User' : 'Create User'}`}
                </Button>
                <Button variant="danger" className={`${formData.id ? '' : 'invisible'}`} onClick={handleDelete}>
                  Delete User
                </Button>
              </Stack>
            </Form>
          </Col>
        </Row>
      </Container>
    </LoadingOverlay>
  );
}

export default RegistrationForm;
