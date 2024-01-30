import { useState } from "react";
import { Form, Button, Card, Col, Stack } from "react-bootstrap";

import LoadingOverlay from "react-loading-overlay-ts";
import { toast } from "react-toastify";
import { customFetch } from "../../../utils";

const DEFAULT_FORM_VALUES = {
  rating: "",
  feedbackText: "",
};

const availableRating = ["1", "2", "3", "4", "5"];

export const FeedbackForm = () => {
  const [formData, setFormData] = useState({ ...DEFAULT_FORM_VALUES });
  const [formErrors, setFormErrors] = useState({ ...DEFAULT_FORM_VALUES });

  const [isLoading, setIsLoading] = useState(false);

  const resetToDefault = () => {
    setFormData({ ...DEFAULT_FORM_VALUES });
    setFormErrors({ ...DEFAULT_FORM_VALUES });
  };

  const validateForm = () => {
    let isValid = true;
    const newFormErrors = { ...formErrors };

    if (formData.rating === "") {
      newFormErrors.rating = "Please select a rating";
      isValid = false;
    } else newFormErrors.rating = "";

    setFormErrors(newFormErrors);
    return isValid;
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
        rating: formData.rating,
        feedbackText: formData.feedbackText,
      };

      setIsLoading(true);
      customFetch(`${global.server_backend_url}/backend/feedback/add`, {
        method: "POST",
        body: JSON.stringify(formatted),
      })
        .then((response) => {
          resetToDefault();
          if (response.ok) {
            return response.json();
          } else throw response;
        })
        .then(() => {
          toast(`Thank you for your feedback!`);
        })
        .catch((err) => {
          console.log(err);
          toast("Sorry. Something went wrong.");
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  };

  return (
    <>
      <Card className="shadow-sm">
        <Card.Header as={"h2"}>Feedback Form</Card.Header>
        <Card.Body>
          <LoadingOverlay active={isLoading} spinner text="Waiting for update">
            <Form onSubmit={handleSubmit}>
              <Form.Group as={Col} md="8" className="mb-3">
                <Form.Label>Rating</Form.Label>
                <div key="inline-radio">
                  {availableRating.map((ratingNum) => (
                    <Form.Check
                      inline
                      key={ratingNum}
                      name="rating"
                      type="radio"
                      id={`inline-radio-${ratingNum}`}
                      label={ratingNum}
                      value={ratingNum}
                      onChange={handleChange}
                      checked={formData.rating === ratingNum}
                    />
                  ))}
                </div>
                <Form.Text id="ratingHelpBlock" muted>
                  The scale starts from 1 as the lowest, to 5 as the highest.
                </Form.Text>
                <div className="text-danger">{formErrors.rating}</div>
              </Form.Group>
              <Form.Group controlId="feedbackText" className="mb-3">
                <Form.Label>
                  What additional things can you say about this system?
                </Form.Label>
                <Form.Control
                  type="text"
                  as={"textarea"}
                  rows={3}
                  name="feedbackText"
                  value={formData.feedbackText}
                  onChange={handleChange}
                />
              </Form.Group>
              <Stack
                direction="horizontal"
                className="gap-3 justify-content-between"
              >
                <Button className="mt-2" variant="primary" type="submit">
                  Submit
                </Button>
              </Stack>
            </Form>
          </LoadingOverlay>
        </Card.Body>
      </Card>
    </>
  );
};
