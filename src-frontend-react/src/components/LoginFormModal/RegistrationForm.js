import moment from 'moment';
import { useEffect, useState } from 'react';
import { Form, Button, Row, Col, ToastContainer, Toast, Stack } from 'react-bootstrap';

import LoadingOverlay from 'react-loading-overlay-ts';
import { customFetch } from '../../utils';
import { useGoogleLogin } from '@react-oauth/google';
import { toast } from 'react-toastify';

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
  otp: '',
}

const RegistrationForm = () => {

  const [userTypes, setUserTypes] = useState([])

  const [formData, setFormData] = useState({ ...DEFAULT_FORM_VALUES });
  const [formErrors, setFormErrors] = useState({ ...DEFAULT_FORM_VALUES });

  const [showNotif, setShowNotif] = useState(false)
  const [responseHeader, setResponseHeader] = useState("")
  const [responseBody, setResponseBody] = useState("")

  const [isLoading, setIsLoading] = useState(true)

  const resetToDefault = () => {
    setFormData({ ...DEFAULT_FORM_VALUES })
    setFormErrors({ ...DEFAULT_FORM_VALUES })

  }

  const glogin = useGoogleLogin({
    onSuccess: tokenResponse => handleGoogleLoginSuccess(tokenResponse),
  });

  const fetchAll = () => {
    setIsLoading(true)
    Promise.all([
      customFetch(`${global.server_backend_url}/backend/auth/usertypes`)
        .then((response) => {
          if (response.ok) return response.json();
          else throw response;
        })
        .then((data) => {
          setUserTypes(data)
          return data;
        })
    ]).then(() => {
      setIsLoading(false)
    })
  }

  useEffect(() => {
    fetchAll()
  }, [])

  const handleChange = (e) => {
    let { name, value } = e.target;
    if (name === "fname" || name === "mname" || name === "lname") {
      console.log('triggered')
      value = value.replace(
        /\w\S*/g,
        function(txt) {
          return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        }
      );
    }
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
    const phonepattern = /^(09|\+639)\d{9}$/;
    if (!formData.cnum.trim().match(phonepattern)) {
      newFormErrors.cnum = 'phone number must be in 09xxxxxxxxx or in +639xxxxxxxxx format';
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
    const lrnPattern = /^\d{12}$/;
    if (formData.login_username.trim() === '') {
      newFormErrors.login_username = 'Username is required';
      isValid = false;
    } else if (formData.type === 'Student' && !formData.login_username.trim().match(lrnPattern)) {
      newFormErrors.login_username = 'LRN must be a 12-digit LRN';
      isValid = false;
    } else {
      newFormErrors.login_username = '';
    }

    // Validate Password
    const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@#$%^&+=!_]).{8,}$/;
    if (!formData.login_password.trim().match(passwordPattern) && formData.login_password.length !== 0 && formData.id) {
      newFormErrors.login_password = "Password must be left blank to leave unchanged or:\n- be at least 8 characters long\n- contain at least 1 alphabet and 1 numeric character\n- contain at least 1 special character (@#$%^&+=!_)";
      isValid = false;
    } else if (!formData.login_password.trim().match(passwordPattern) && !formData.id) {
      newFormErrors.login_password = "Password must be:\n- be at least 8 characters long\n- contain at least 1 alphabet and 1 numeric character\n- contain at least 1 special character (@#$%^&+=!_)";
      isValid = false;
    } else {
      newFormErrors.login_password = '';
    }

    setFormErrors(newFormErrors);
    return isValid;
  };

  const handleSubmit = (e) => {
    setShowNotif(false)
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
        login_password: formData.login_password,
        otp: formData.otp
      }

      customFetch(`${global.server_backend_url}/backend/auth/register`, {
        method: 'POST',
        body: JSON.stringify(formatted)
      }).then((response) => {
        fetchAll()
        if (response.ok) {
          setResponseHeader("Registration Successful")
          setResponseBody("Please wait for the admin to approve your registration before you can sign in.")
          resetToDefault()
          setShowNotif(true)
        } else throw response;
      }).catch(async (err) => {
        const errorBody = await err.json()
        setResponseHeader("Registration Failed")
        setResponseBody(errorBody.msg)
        setShowNotif(true)
      })
    }
  };

  // TODO Enhance security by sending access_token to register endpoint then verifying again if the email from field is similar from email fetched by access token from Google.
  const handleGoogleLoginSuccess = (response) => {
    setFormData({
      ...formData,
      gaccesstoken: response.access_token,
    });
    setIsLoading(true)

    customFetch(`${global.server_backend_url}/backend/auth/emailfromgoogle`, {
      headers: { Authorization: `Bearer ${response.access_token}` }
    }).then((response) => {
      if (response.ok) return response.json();
      else throw response;
    }).then((data) => {
      console.log("Data: ", data)
      setFormData({
        ...formData,
        emailaddr: data.email,
      });
      toast("OTP sent to your Gmail. Please put it in the OTP field.")
      return data;
    }).finally(() => setIsLoading(false))
  };
  return (
    <LoadingOverlay active={isLoading} spinner text='Waiting for update...'>
      <Form onSubmit={handleSubmit}>
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
            />
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
          <Form.Group as={Col} lg="6" controlId="emailaddr">
            <Form.Label>Email</Form.Label>
            <Stack gap={2}>
              <Stack direction='horizontal' gap={2}>
                <Form.Control
                  type="email"
                  name="emailaddr"
                  value={formData.emailaddr}
                  onChange={handleChange}
                  placeholder="Use Google Login..."
                  disabled
                />
                <Button onClick={() => glogin()}><i class="bi bi-google"></i></Button>
              </Stack>
              <div className="text-danger">{formErrors.emailaddr}</div>
              <Form.Control
                type="text"
                pattern='[0-9]{6}'
                name="otp"
                value={formData.otp}
                onChange={handleChange}
                placeholder="6-Digit OTP (Google Login Required) "
                disabled={!formData.emailaddr}
              />
            </Stack>
          </Form.Group>
          <Form.Group as={Col} lg="6" controlId="cnum">
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
        <Row className="mb-3">
          <Form.Group as={Col} md="4" controlId="bdate" className="mb-3">
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
          <Form.Group as={Col} md="8" >
            <Form.Label>User Type</Form.Label>
            <div key='inline-radio' defaultValue={"Student"} className="mb-3">
              {userTypes.map((userType) => (
                <Form.Check
                  inline
                  key={userType}
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
        </Row>

        <Row className="mb-3">
          <Form.Group as={Col} md="6" controlId="login_username">
            <Form.Label>{`${formData.type === "Student" ? 'LRN' : 'Username'}`}</Form.Label>
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
        <Button className="mt-2" variant="primary" type="submit">
          Register
        </Button>
      </Form>
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
    </LoadingOverlay>
  );
}

export default RegistrationForm
