import { useEffect, useState } from "react";
import { Form, Button, Stack } from "react-bootstrap";
import Select from "react-select";

import LoadingOverlay from "react-loading-overlay-ts";
import { customFetch } from "../../../utils";
import { toast } from "react-toastify";

const DEFAULT_FORM_VALUES = {
  userId: "",
  content: "",
};

const DEFAULT_SELECT_VALUE = { value: 0, label: "Please pick a user" };

export const MedicalRecordsForm = () => {
  const [usersList, setUsersList] = useState([]);

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
    customFetch(`${global.server_backend_url}/backend/medrecords/users`)
      .then((response) => {
        if (response.ok) return response.json();
        else throw response;
      })
      .then((data) => {
        setUsersList(data);
        setIsLoading(false);
        return data;
      });
  };

  const validateForm = () => {
    let isValid = true;
    const newFormErrors = { ...formErrors };
    console.log(selectedUser.value);

    if (!selectedUser.value) {
      newFormErrors.userId = "Select user first";
      isValid = false;
    } else newFormErrors.userId = "";

    if (formData.content.trim() === "") {
      newFormErrors.content = "Content is required";
      isValid = false;
    } else newFormErrors.content = "";

    setFormErrors(newFormErrors);
    return isValid;
  };

  const handleUserSelectionChange = (e) => {
    setSelectedUser({ value: e.value, label: e.label });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      const formatted = {
        content: formData.content,
        userId: selectedUser.value.id,
      };

      customFetch(`${global.server_backend_url}/backend/medrecords/record`, {
        method: "POST",
        body: JSON.stringify(formatted),
      })
        .then((response) => {
          fetchAll();
          resetToDefault();
          if (response.ok) {
            return response.json();
          } else throw response;
        })
        .then((data) => {
          toast(`Successfully added medical records for ${data.user.lname}`);
        })
        .catch((err) => {
          console.log(err);
        })
        .finally(() => {
          fetchAll();
        });
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    setUsersListOptions([
      ...usersList.map((user) => {
        return {
          value: user,
          label: `[${user.type}] ${user.lname}, ${user.fname} ${
            user.mname ? user.mname[0] + "." : ""
          }`,
        };
      }),
    ]);
    console.log(usersList);
  }, [usersList]);

  return (
    <LoadingOverlay active={isLoading} spinner text="Waiting for update">
      <Form onSubmit={handleSubmit}>
        <Select
          className="fs-5"
          options={usersListOptions}
          value={selectedUser}
          onChange={handleUserSelectionChange}
        />
        <div className="text-danger mb-3">{formErrors.userId}</div>
        <Form.Group controlId="content" className="mb-3">
          <Form.Label>Medical Record Contents</Form.Label>
          <Form.Control
            type="text"
            as={"textarea"}
            rows={5}
            name="content"
            value={formData.content}
            onChange={handleChange}
            required
          />
          <div className="text-danger">{formErrors.content}</div>
        </Form.Group>
        <Stack direction="horizontal" className="gap-3 justify-content-between">
          <Button className="mt-2" variant="primary" type="submit">
            Create Medical Record
          </Button>
          <Button
            variant="danger"
            className={`${formData.id ? "" : "invisible"}`}
          >
            Delete
          </Button>
        </Stack>
      </Form>
    </LoadingOverlay>
  );
};
