import { useEffect, useState } from "react";
import { Card, Accordion } from "react-bootstrap";
import Select from "react-select";

import LoadingOverlay from "react-loading-overlay-ts";
import { customFetch } from "../../../utils";
import { toast } from "react-toastify";
import moment from "moment";
import { socket } from "../../../socket";

const DEFAULT_SELECT_VALUE = { value: 0, label: "Please pick a user" };

export const SelectedMedicalRecords = () => {
  const [usersList, setUsersList] = useState([]);

  const [usersListOptions, setUsersListOptions] = useState([]);
  const [selectedUser, setSelectedUser] = useState({ ...DEFAULT_SELECT_VALUE });
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [isQuerySuccess, setIsQuerySuccess] = useState(false);

  const [isLoading, setIsLoading] = useState(true);

  const fetchAll = () => {
    setIsLoading(true);
    customFetch(`${global.server_backend_url}/backend/medrecords/users`)
      .then((response) => {
        if (response.ok) return response.json();
        else throw response;
      })
      .then((data) => {
        setUsersList(data);
      })
      .catch((err) => {
        if (err.status === 500) toast("Something went wrong");
      })
      .finally(() => setIsLoading(false));
  };

  const handleUserSelectionChange = (e) => {
    setSelectedUser({ value: e.value, label: e.label });
  };

  useEffect(() => {
    fetchAll();
    socket.on("notify", () => {
      fetchAll();
    });
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
  }, [usersList]);

  useEffect(() => {
    customFetch(
      `${global.server_backend_url}/backend/medrecords/records-by/${selectedUser.value.id}`,
    )
      .then((response) => {
        if (response.ok) {
          setIsQuerySuccess(true);
          return response.json();
        } else throw response;
      })
      .then((data) => {
        data = data
          .slice()
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setMedicalRecords(data);
      })
      .catch((err) => {
        if (err.status === 500) toast("Something went wrong");
      })
      .finally(() => setIsLoading(false));
  }, [selectedUser]);

  return (
    <>
      {isQuerySuccess ? (
        <Card className="mb-3">
          <Card.Header as="h2">Users' Records</Card.Header>
          <Card.Body style={{ maxHeight: "40rem" }}>
            <LoadingOverlay
              active={isLoading}
              spinner
              text="Waiting for update"
            >
              <Select
                className="fs-5 mb-2"
                options={usersListOptions}
                value={selectedUser}
                onChange={handleUserSelectionChange}
              />
              <div className="d-flex flex-column overflow-scroll">
                {medicalRecords.length !== 0 ? (
                  <Accordion>
                    {medicalRecords.map((record, index) => (
                      <Accordion.Item eventKey={index} key={index}>
                        <Accordion.Header>
                          {moment(record.createdAt).format(
                            "MMM DD, YYYY hh:mm A",
                          )}
                        </Accordion.Header>
                        <Accordion.Body>
                          <span style={{ whiteSpace: "pre-line" }}>
                            {record.content}
                          </span>
                        </Accordion.Body>
                      </Accordion.Item>
                    ))}
                  </Accordion>
                ) : (
                  <div className="text-secondary align-self-center">
                    Nothing to show
                  </div>
                )}
              </div>
            </LoadingOverlay>
          </Card.Body>
        </Card>
      ) : (
        ""
      )}
    </>
  );
};
