import moment from "moment";
import { useCallback, useEffect, useState } from "react";
import {
  Form,
  Button,
  Row,
  Col,
  ToastContainer,
  Toast,
  Stack,
} from "react-bootstrap";

import { customFetch } from "../../utils";
import { useGoogleLogin } from "@react-oauth/google";

const DEFAULT_FORM_VALUES = {
  id: "",
  fname: "",
  lname: "",
  type: "",
  login_username: "",
};

const RegistrationForm = ({ setIsLoading, setLoadingText, setTabKey }) => {
  const [userTypes, setUserTypes] = useState([]);

  const [formData, setFormData] = useState({ ...DEFAULT_FORM_VALUES });
  const [formErrors, setFormErrors] = useState({ ...DEFAULT_FORM_VALUES });

  const [showNotif, setShowNotif] = useState(false);
  const [responseHeader, setResponseHeader] = useState("");
  const [responseBody, setResponseBody] = useState("");

  const resetToDefault = () => {
    setFormData({ ...DEFAULT_FORM_VALUES });
    setFormErrors({ ...DEFAULT_FORM_VALUES });
  };

  const [isFetchingAll, setIsFetchingAll] = useState(true);
  const fetchAll = useCallback(() => {
    setIsLoading(true);
    setLoadingText("Fetching data...");
    Promise.all([
      customFetch(`${global.server_backend_url}/backend/auth/usertypes`)
        .then((response) => {
          if (response.ok) return response.json();
          else throw response;
        })
        .then((data) => {
          setUserTypes(data);
          return data;
        }),
    ]).then(() => {
      setIsLoading(false);
    });
  }, [setIsLoading, setLoadingText]);

  useEffect(() => {
    if (isFetchingAll) fetchAll();
  }, [fetchAll, isFetchingAll]);

  useEffect(() => {
    setIsFetchingAll(true);
  }, []);

  const handleChange = (e) => {
    let { name, value } = e.target;
    if (name === "fname" || name === "lname") {
      console.log("triggered");
      value = value.replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      });
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
    if (formData.fname.trim() === "") {
      newFormErrors.fname = "First Name is required";
      isValid = false;
    } else {
      newFormErrors.fname = "";
    }

    // Validate Last Name
    if (formData.lname.trim() === "") {
      newFormErrors.lname = "Last Name is required";
      isValid = false;
    } else {
      newFormErrors.lname = "";
    }

    // Validate User Type
    if (formData.type.trim() === "") {
      newFormErrors.type = "User type is required";
      isValid = false;
    } else {
      newFormErrors.type = "";
    }

    // Validate Username
    if (formData.login_username.trim() === "") {
      newFormErrors.login_username = "Username is required";
      isValid = false;
    } else {
      newFormErrors.login_username = "";
    }

    setFormErrors(newFormErrors);
    return isValid;
  };

  const handleSubmit = (e) => {
    setShowNotif(false);
    e.preventDefault();

    if (validateForm()) {
      // Handle form submission here (e.g., send data to a server).
      const formatted = {
        fname: formData.fname,
        lname: formData.lname,
        type: formData.type,
        login_username: formData.login_username,
      };

      customFetch(`${global.server_backend_url}/backend/auth/register`, {
        method: "POST",
        body: JSON.stringify(formatted),
      })
        .then((response) => {
          fetchAll();
          if (response.ok) {
            setResponseHeader("Registration Successful");
            setResponseBody(
              "Registration successful! No need for admin to approve the registration. Feel free to login using your username.",
            );
            resetToDefault();
            setShowNotif(true);
          } else throw response;
        })
        .catch(async (err) => {
          const errorBody = await err.json();
          setResponseHeader("Registration Failed");
          setResponseBody(errorBody.msg);
          setShowNotif(true);
        });
    }
  };

  return (
    <>
      <Form className="mb-3" onSubmit={handleSubmit}>
        <Row className="mb-3">
          <Form.Group as={Col} md="6" controlId="firstName">
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
          <Form.Group as={Col} md="6" controlId="lastName">
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
        <Row className="mb-3">
          <Form.Group as={Col}>
            <Form.Label>User Type</Form.Label>
            <p className="text-secondary">
              Each users has their own restrictions. For example, some Teacher
              features don't show up to Student user types.
            </p>
            <div key="inline-radio" defaultValue={"Student"} className="mb-3">
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
                  checked={formData.type === userType}
                />
              ))}
            </div>
            <div className="text-danger">{formErrors.type}</div>
          </Form.Group>
        </Row>

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
              disabled
              type="password"
              name="login_password"
              onChange={handleChange}
              placeholder="Public demo version. Not Required."
            />
          </Form.Group>
        </Row>
        <Button className="w-100 mt-2" variant="primary" type="submit">
          Register
        </Button>
      </Form>
      <div className="d-flex w-100 justify-content-center">
        <Button
          className="mx-auto fw-semibold mb-3"
          variant="link"
          onClick={() => setTabKey("login")}
          style={{ textDecoration: "none" }}
        >
          Login
        </Button>
      </div>
      <p className="text-center text-secondary">
        This is a public version. Logging in is oversimplified to allow testing
        of the application. No need to input a password.
      </p>
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
    </>
  );
};

export default RegistrationForm;
