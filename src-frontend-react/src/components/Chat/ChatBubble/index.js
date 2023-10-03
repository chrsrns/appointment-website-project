import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Stack, Form, Button } from 'react-bootstrap';
import { customFetch } from '../../../utils';

const DEFAULT_FORM_VALUES = {
  content: ''
}

const Chat = ({ scheduleId }) => {
  const [messages, setMessages] = useState([])

  const [formData, setFormData] = useState(DEFAULT_FORM_VALUES);

  const fetchAll = () => {
    if (scheduleId)
      customFetch(`${global.server_backend_url}/backend/appointments/messages/by-schedule/${scheduleId}`)
        .then((response) => {
          if (response.ok) {
            return response.json();
          }
          throw response;
        })
        .then((data) => {
          setMessages(
            data
              .slice()
              .sort((a, b) => a.timestamp - b.timestamp)
          )
        })
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleMessageSend = () => {
    customFetch(`${global.server_backend_url}/backend/appointments/message`, {
      method: "POST",
      body: JSON.stringify(formData),
    })
      .then((response) => {
        if (response.ok) return response.json();
        throw response;
      })
  }

  useEffect(() => {
    fetchAll()
    setFormData({
      ...formData,
      scheduleId: scheduleId,
    });
  }, [scheduleId])
  useEffect(() => {
    fetchAll()
    setFormData({
      ...formData,
      scheduleId: scheduleId,
    });

  }, [])
  return (
    <Container className='px-3 mb-4'>
      <div className="overflow-scroll p-3 mb-4" style={{ maxHeight: "30rem", borderBottom: '1px solid #ccc' }}>
        {messages.map((message, index) => (
          <div
            key={index}
            className={`my-2 ${message.sender === 'user' ? 'text-end' : 'text-start'}`}
          >
            <Card className='d-inline-block text-break m-1 px-1 rounded-3 shadow-sm' style={{ width: 'auto', maxWidth: '60%' }}>
              <Card.Body>
                <p className="fw-bold mb-2 border-bottom border-secondary pb-2">{message.name}</p>
                {message.text}
                <p className={`mt-1 mb-0 text-black-50 ${message.sender === 'user' ? 'text-end' : 'text-start'}`} style={{ fontSize: '.8rem' }}>
                  {new Date(message.timestamp).toLocaleString()}
                </p>
              </Card.Body>
            </Card>
          </div>
        ))}
      </div>
      <Stack direction="horizontal" gap={3}>
        <Form.Control
          className="me-auto"
          as={'textarea'}
          name="content"
          rows={3}
          placeholder="Type your message here..."
          onChange={handleChange}
          value={formData.content} />
        <Button variant="primary" onClick={handleMessageSend}>
          Send
        </Button>
      </Stack>

    </Container>
  );
};

export default Chat;

