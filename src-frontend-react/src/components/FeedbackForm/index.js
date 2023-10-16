import { useEffect, useState } from 'react';
import { Form, Button, Card, Row, Col, Stack } from 'react-bootstrap';

import LoadingOverlay from 'react-loading-overlay-ts';
import { customFetch } from '../../utils';
import { toast } from 'react-toastify';
import { Jumbotron } from '../Jumbotron';

const DEFAULT_FORM_VALUES = {
  rating: '',
  feedbackText: '',
}

const availableRating = [1, 2, 3, 4, 5]

export const FeedbackForm = ({ sidebarbtn_onClick }) => {

  const [formData, setFormData] = useState({ ...DEFAULT_FORM_VALUES });
  const [formErrors, setFormErrors] = useState({ ...DEFAULT_FORM_VALUES });

  const [isLoading, setIsLoading] = useState(false)

  const resetToDefault = () => {
    setFormData({ ...DEFAULT_FORM_VALUES })
    setFormErrors({ ...DEFAULT_FORM_VALUES })
  }

  const validateForm = () => {
    let isValid = true;
    const newFormErrors = { ...formErrors };

    if (formData.rating === '') {
      newFormErrors.rating = 'Please select a rating';
      isValid = false;
    } else newFormErrors.rating = '';

    setFormErrors(newFormErrors);
    return isValid;

  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(e.target)
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  useEffect(() => {
    console.log(formData)
  }, [formData])

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      const formatted = {
        rating: formData.rating,
        feedbackText: formData.feedbackText,
      }

      setIsLoading(true)
      customFetch(`${global.server_backend_url}/backend/feedback/add`, {
        method: 'POST',
        body: JSON.stringify(formatted)
      }).then((response) => {
        resetToDefault()
        if (response.ok) {
          return response.json();
        } else throw response;
      }).then(() => {
        toast(`Thank you for your feedback!`)
      }).catch((err) => {
        console.log(err)
        toast('Sorry. Something went wrong.')
      }).finally(() => {
        setIsLoading(false)
      })
    }
  }

  return (
    <>
      <p className="float-start d-lg-none d-md-block">
        <Button variant="primary" size="sm" onClick={sidebarbtn_onClick}>
          <i className="bi bi-chevron-right"></i>
        </Button>
      </p>
      <Jumbotron header="Feedback">
        Feel free to say your thoughts on the system here.
      </Jumbotron>
      <Row>
        <Col>
          <Card className="shadow-sm">
            <Card.Header as={"h2"}>Feedback Form</Card.Header>
            <Card.Body>
              <div
                className="table-responsive"
                style={{
                  height: "25rem",
                  position: "relative",
                }}
              >
                <LoadingOverlay active={isLoading} spinner text="Waiting for update">
                  <Form onSubmit={handleSubmit}>
                    <Form.Group as={Col} md="8" >
                      <Form.Label>User Type</Form.Label>
                      <div key='inline-radio' className="mb-3">
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
                            checked={formData.rating === ratingNum} />

                        )
                        )}
                      </div>
                      <div className="text-danger">{formErrors.rating}</div>
                    </Form.Group>
                    <Form.Group controlId="feedbackText" className="mb-3">
                      <Form.Label>What additional things can you say about this system?</Form.Label>
                      <Form.Control
                        type="text"
                        as={'textarea'}
                        rows={3}
                        name="feedbackText"
                        value={formData.feedbackText}
                        onChange={handleChange}
                      />
                    </Form.Group>
                    <Stack direction="horizontal" className="gap-3 justify-content-between">
                      <Button className="mt-2" variant="primary" type="submit">
                        Submit
                      </Button>
                    </Stack>
                  </Form>
                </LoadingOverlay>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  )
} 
