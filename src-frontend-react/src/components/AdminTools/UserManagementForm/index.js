import moment from "moment";
import { useEffect, useState } from "react";
import { Form, Button, Row, Col, Stack, Accordion } from "react-bootstrap";
import Select from "react-select";

import LoadingOverlay from "react-loading-overlay-ts";
import { customFetch } from "../../../utils";
import { toast } from "react-toastify";
import { socket } from "../../../socket";
import { user_type } from "@prisma/client";

const DEFAULT_FORM_VALUES = {
  id: "",
  fname: "",
  lname: "",
  type: "",
  login_username: "", // Add username field
};

/// NOTE The `{ ...DEFAULT_FORM_VALUES }` is used because simply
//      placing `DEFAULT_FORM_VALUES` seems to make it so that
//      the forms modify this variable
/// TODO Add placeholders to the form controls
const DEFAULT_SELECT_VALUE = {
  value: { ...DEFAULT_FORM_VALUES },
  label: "Create new user",
};

export const UserManagementForm = () => {
  const [usersList, setUsersList] = useState([]);
  const [userTypes, setUserTypes] = useState([]);

  const [archivedUsersList, setArchivedUsersList] = useState([]);

  const [usersListOptions, setUsersListOptions] = useState([]);
  const [selectedUser, setSelectedUser] = useState({ ...DEFAULT_SELECT_VALUE });

  const [formData, setFormData] = useState({ ...DEFAULT_FORM_VALUES });

  const [formErrors, setFormErrors] = useState({ ...DEFAULT_FORM_VALUES });

  const [isLoading, setIsLoading] = useState(true);

  const resetToDefault = () => {
    setFormData({ ...DEFAULT_FORM_VALUES });
    setFormErrors({ ...DEFAULT_FORM_VALUES });
    setSelectedUser({ ...DEFAULT_SELECT_VALUE });
  };

  const fetchAll = () => {
    setIsLoading(true);
    Promise.all([
      customFetch(`${global.server_backend_url}/backend/admin/users`)
        .then((response) => {
          if (response.ok) return response.json();
          else throw response;
        })
        .then((data) => {
          setUsersList(data);
          return data;
        }),
      customFetch(`${global.server_backend_url}/backend/admin/archivedusers`)
        .then((response) => {
          if (response.ok) return response.json();
          else throw response;
        })
        .then((data) => {
          setArchivedUsersList(data);
          return data;
        }),
      customFetch(`${global.server_backend_url}/backend/admin/usertypes`)
        .then((response) => {
          if (response.ok) return response.json();
          else throw response;
        })
        .then((data) => {
          setUserTypes(data);
          return data;
        }),
    ]).then(() => {
      console.log("done");
      setIsLoading(false);
    });
  };

  useEffect(() => {
    fetchAll();
    socket.on("notify", () => {
      fetchAll();
    });
  }, []);

  useEffect(() => {
    setUsersListOptions([
      { ...DEFAULT_SELECT_VALUE },
      ...usersList.map((user) => {
        return {
          value: user,
          label: `[${user.type}] ${user.lname}, ${user.fname}`,
        };
      }),
    ]);
    console.log(usersList);
  }, [usersList]);

  useEffect(() => {
    console.log(usersListOptions);
  }, [usersListOptions]);

  const handleUserSelectionChange = (e) => {
    setSelectedUser({ value: e.value, label: e.label });
    const user = e.value;

    user.login_password = "";

    setFormData(user);
    console.log(user);
  };

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
    e.preventDefault();

    if (validateForm()) {
      // Handle form submission here (e.g., send data to a server).
      const formatted = {
        fname: formData.fname,
        lname: formData.lname,
        type: formData.type,
        login_username: formData.login_username,
      };

      if (formData.id) {
        /// Means user is updated only. Do not include password field if empty

        if (formData.login_password)
          formatted.login_password = formData.login_password;

        customFetch(
          `${global.server_backend_url}/backend/admin/user/${formData.id}`,
          {
            method: "PUT",
            body: JSON.stringify(formatted),
          },
        )
          .then((response) => {
            fetchAll();
            resetToDefault();
            if (response.ok) {
              return response.json();
            } else throw response;
          })
          .then((data) => toast(data.msg))
          .catch((err) => {
            console.log(err);
          });
      } else {
        /// Means user is created, not updated

        formatted.login_password = formData.login_password;

        customFetch(`${global.server_backend_url}/backend/admin/user`, {
          method: "POST",
          body: JSON.stringify(formatted),
        })
          .then((response) => {
            console.log(response);
            fetchAll();
            resetToDefault();

            if (response.ok) {
              return response.json();
            } else throw response;
          })
          .then((data) => toast(data.msg))
          .catch((err) => {
            console.log(err);
          });
      }
      console.log(formatted);
    } else {
      console.log("Form validation failed");
    }
  };

  const handleDelete = () => {
    if (formData.id) {
      customFetch(
        `${global.server_backend_url}/backend/admin/user/${formData.id}`,
        {
          method: "DELETE",
        },
      )
        .then((response) => {
          console.log(response);
          if (response.ok) {
            fetchAll();
            resetToDefault();
            return response.json();
          } else throw response;
        })
        .then((data) => {
          toast(data.msg);
        })
        .catch((err) => {
          console.log(err);
          console.error(err.errbody);
        });
    }
  };

  const handleUnArchive = (id) => {
    customFetch(`${global.server_backend_url}/backend/admin/unarchive/${id}`, {
      method: "POST",
    })
      .then((response) => {
        console.log(response);
        if (response.ok) {
          fetchAll();
          resetToDefault();
          return response.json();
        } else throw response;
      })
      .then((data) => {
        toast(data.msg);
      })
      .catch((err) => {
        console.log(err);
        console.error(err.errbody);
      });
  };

  return (
    <LoadingOverlay active={isLoading} spinner text="Waiting for update...">
      <Form onSubmit={handleSubmit} className="mb-3">
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
        <Select
          className="fs-5 mb-3"
          classNames={{
            control: () => "bg-body text-body",
            menu: () => "bg-body text-body",
            multiValue: () => "bg-body text-body",
            option: (state) =>
              state.isFocused
                ? "bg-primary-subtle text-body"
                : "bg-body text-body",
            singleValue: () => "bg-body text-body",
            valueContainer: () => "bg-body text-body",
          }}
          options={usersListOptions}
          value={selectedUser}
          onChange={handleUserSelectionChange}
        />
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
        <Row className="mb-3">
          <Form.Group as={Col}>
            <Form.Label>User Type</Form.Label>
            <div key="inline-radio" className="mb-3">
              {userTypes.map((userType) => (
                <Form.Check
                  inline
                  name="type"
                  type="radio"
                  id={`inline-radio-${userType}`}
                  key={`inline-radio-${userType}`}
                  label={userType}
                  value={userType}
                  onChange={handleChange}
                  checked={formData.type === userType}
                />
              ))}
            </div>
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
              value={formData.login_password}
              onChange={handleChange}
            />
            <div className="text-danger">{formErrors.login_password}</div>
          </Form.Group>
        </Row>
        <Stack direction="horizontal" className="gap-3 justify-content-between">
          <Button className="mt-2" variant="primary" type="submit">
            {`${formData.id ? "Modify User" : "Create User"}`}
          </Button>
          <Button
            variant="danger"
            className={`${formData.id ? "" : "invisible"}`}
            onClick={handleDelete}
          >
            {`${
              selectedUser.value.type === user_type.Admin
                ? "Archive User"
                : "Delete User"
            }`}
          </Button>
        </Stack>
      </Form>
      <Accordion>
        <Accordion.Item eventKey="0">
          <Accordion.Header>Archived Users</Accordion.Header>
          <Accordion.Body>
            <Accordion>
              {archivedUsersList.map((user) => {
                return (
                  <Accordion.Item key={`${user.id}`} eventKey={`${user.id}`}>
                    <Stack
                      direction="horizontal"
                      className="w-100 px-3 justify-content-between"
                    >
                      <Accordion.Header className="w-100 pe-3">
                        {`[${user.type}] ${user.lname}, ${user.fname}`}
                      </Accordion.Header>
                      <Button onClick={() => handleUnArchive(user.id)}>
                        Unarchive
                      </Button>
                    </Stack>
                    <Accordion.Body>
                      {/* <p className="fw-bold mb-2 border-bottom border-secondary pb-2"> */}
                      {/* </p> */}

                      <p>{`Username: ${user.login_username}`}</p>
                    </Accordion.Body>
                  </Accordion.Item>
                );
              })}
            </Accordion>
            {archivedUsersList.length === 0 ? "Nothing to show." : ""}
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    </LoadingOverlay>
  );
};

export default UserManagementForm;
