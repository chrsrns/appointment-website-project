import LoadingOverlay from "react-loading-overlay-ts";
import moment from "moment";
import { Accordion, Card } from "react-bootstrap";
import { useCallback, useEffect, useState } from "react";
import { socket } from "../../../socket";
import { customFetch } from "../../../utils";

export const MyGuidanceRecords = () => {
  const [guidanceRecords, setGuidanceRecords] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingAll, setIsFetchingAll] = useState(true);
  const fetchAll = useCallback(() => {
    setIsLoading(true);
    customFetch(`${global.server_backend_url}/backend/guidancerecords/records`)
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        throw response;
      })
      .then((data) => {
        data = data
          .slice()
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setGuidanceRecords(data);
      })
      .finally(() => {
        setIsLoading(false);
        setIsFetchingAll(false);
      });
  }, []);
  useEffect(() => {
    if (isFetchingAll) fetchAll();
  }, [fetchAll, isFetchingAll]);

  useEffect(() => {
    socket.on("update guidance records", () => {
      setIsLoading(true);
      setIsFetchingAll(true);
    });
  }, []);

  return (
    <Card className="mb-3">
      <Card.Header as="h2">My Guidance Records</Card.Header>

      <Card.Body
        className="d-flex flex-column overflow-scroll"
        style={{ maxHeight: "40rem" }}
      >
        <LoadingOverlay active={isLoading} spinner text="Waiting for update...">
          {guidanceRecords.length !== 0 ? (
            <Accordion>
              {guidanceRecords.map((record, index) => (
                <Accordion.Item eventKey={index} key={index}>
                  <Accordion.Header>
                    {moment(record.createdAt).format("MMM DD, YYYY hh:mm A")}
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
        </LoadingOverlay>
      </Card.Body>
    </Card>
  );
};
