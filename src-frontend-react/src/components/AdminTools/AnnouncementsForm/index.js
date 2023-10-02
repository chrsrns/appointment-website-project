import React, { useEffect, useState } from 'react';
import { Form, Button, Container, Row, Col, Stack } from 'react-bootstrap';
import Select from 'react-select'

import LoadingOverlay from 'react-loading-overlay-ts';

const DEFAULT_FORM_VALUES = {
  id: '',
  title: '',
  content: '',
}

/// NOTE The `{ ...DEFAULT_FORM_VALUES }` is used because simply
//      placing `DEFAULT_FORM_VALUES` seems to make it so that 
//      the forms modify this variable
const DEFAULT_SELECT_VALUE = { value: { ...DEFAULT_FORM_VALUES }, label: "Create new announcement" }

export const AnnouncementsForm = () => {
  const [announcementsList, setAnnouncementsList] = useState([])

  const [announcementsListOptions, setAnnouncementsListOptions] = useState([])
  const [selectedAnnouncement, setSelectedAnnouncement] = useState({ ...DEFAULT_SELECT_VALUE })

  const [formData, setFormData] = useState({ ...DEFAULT_FORM_VALUES });
  const [formErrors, setFormErrors] = useState({ ...DEFAULT_FORM_VALUES });

  const [isLoading, setIsLoading] = useState(true)

  const resetToDefault = () => {
    setFormData({ ...DEFAULT_FORM_VALUES })
    setFormErrors({ ...DEFAULT_FORM_VALUES })
    setSelectedAnnouncement({ ...DEFAULT_SELECT_VALUE })
  }

  const fetchAll = () => {
    setIsLoading(true)
    fetch(`${global.server_backend_url}/backend/admin/announcements`)
      .then((response) => {
        if (response.ok) return response.json();
        else throw response;
      })
      .then((data) => {
        setAnnouncementsList(data)
        setIsLoading(false)
        return data;
      })
  }

  const validateForm = () => {
    let isValid = true;
    const newFormErrors = { ...formErrors };

    if (formData.title.trim() === '') {
      newFormErrors.title = 'Title is required';
      isValid = false;
    } else {
      newFormErrors.title = '';
    }

    if (formData.content.trim() === '') {
      newFormErrors.content = 'Content is required';
      isValid = false;
    } else {
      newFormErrors.content = '';
    }

    setFormErrors(newFormErrors);
    return isValid;

  }

  const handleAnnouncementSelectionChange = (e) => {
    setSelectedAnnouncement({ value: e.value, label: e.label })
    const announcement = e.value

    setFormData(announcement)
  }

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
        title: formData.title,
        content: formData.content
      }

      if (formData.id) { /// Means user is updated only.

        fetch(`${global.server_backend_url}/backend/admin/announcement/${formData.id}`, {
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

        fetch(`${global.server_backend_url}/backend/admin/announcement`, {
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
    }
  }

  /// TODO Implement error handling when the response is not an object
  const handleDelete = () => {
    if (formData.id) {
      fetch(`${global.server_backend_url}/backend/admin/announcement/${formData.id}`, {
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

  useEffect(() => {
    fetchAll()
  }, [])

  useEffect(() => {
    setAnnouncementsListOptions([{ ...DEFAULT_SELECT_VALUE }, ...announcementsList.map((announcement) => {
      return { value: announcement, label: `${announcement.title}` }
    })])
    console.log(announcementsList)
  }, [announcementsList])

  return (
    <LoadingOverlay active={isLoading} spinner text="Waiting for update">
      <Form onSubmit={handleSubmit}>
        <Select className='fs-5 mb-3' options={announcementsListOptions} value={selectedAnnouncement} onChange={handleAnnouncementSelectionChange} />
        <Form.Group controlId="title" className="mb-3">
          <Form.Label>Announcement Title</Form.Label>
          <Form.Control
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </Form.Group>
        <Form.Group controlId="content" className="mb-3">
          <Form.Label>Announcement Content</Form.Label>
          <Form.Control
            type="text"
            as={'textarea'}
            rows={5}
            name="content"
            value={formData.content}
            onChange={handleChange}
            required
          />
        </Form.Group>
        <Stack direction="horizontal" className="gap-3 justify-content-between">
          <Button className="mt-2" variant="primary" type="submit">
            {`${formData.id ? 'Modify Announcement' : 'Create Announcement'}`}
          </Button>
          <Button variant="danger" className={`${formData.id ? '' : 'invisible'}`} onClick={handleDelete}>
            Delete
          </Button>
        </Stack>
      </Form>
    </LoadingOverlay>
  )
} 
