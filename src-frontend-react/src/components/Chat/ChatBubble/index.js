import { useCallback, useEffect, useState } from 'react';
import { Container, Card, Stack, Form, Button } from 'react-bootstrap';
import { useCookies } from 'react-cookie';
import LoadingOverlay from 'react-loading-overlay-ts';
import { socket } from '../../../socket';
import { customFetch } from '../../../utils';

const DEFAULT_FORM_VALUES = {
  content: ''
}

const Chat = ({ scheduleId, hideTextBox = false }) => {

  const [cookies] = useCookies(['login_username'])

  const [messages, setMessages] = useState([])
  const [formData, setFormData] = useState(DEFAULT_FORM_VALUES);
  const [isLoading, setIsLoading] = useState(true)

  const [isFetchingAll, setIsFetchingAll] = useState(true)
  const fetchAll = useCallback(() => {
    setIsLoading(true)
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
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          )
        }).finally(() => {
          setIsLoading(false)
          setIsFetchingAll(false)
        })

  }, [scheduleId])
  useEffect(() => {
    if (isFetchingAll) {
      fetchAll()
    }
  }, [fetchAll, isFetchingAll])
  useEffect(() => {
    socket.on("update chats", () => {
      setIsLoading(true)
      setIsFetchingAll(true)
    });
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleMessageSend = (event) => {
    event.preventDefault()

    const formDataTransformed = {
      ...formData,
      scheduleId: scheduleId,
    }
    customFetch(`${global.server_backend_url}/backend/appointments/message`, {
      method: "POST",
      body: JSON.stringify(formDataTransformed),
    }).then((response) => {
      if (response.ok) {
        setIsFetchingAll(true)
        return response.json();
      } throw response;
    }).finally(() => {
      setFormData(DEFAULT_FORM_VALUES)
      setIsLoading(false)
    })
  }

  useEffect(() => {
    setIsFetchingAll(true)
  }, [fetchAll])
  return (
    <LoadingOverlay spinner active={isLoading}>
      <Container className='px-3 mb-4'>
        <div className="overflow-scroll p-3 mb-4 d-flex flex-column-reverse"
          style={hideTextBox ? {} : { maxHeight: "30rem", borderBottom: '1px solid #ccc' }}
        >
          {messages.map((message, index) => (
            <div
              key={index}
              className={`my-2 ${message.User.login_username === cookies.login_username ? 'text-end' : 'text-start'}`}
            >
              <Card className='d-inline-block text-break m-1 px-1 rounded-3 shadow-sm' style={{ width: 'auto', maxWidth: '60%' }}>
                <Card.Body>
                  <p className="fw-bold mb-2 border-bottom border-secondary pb-2">
                    {`${message.User.lname}, ${message.User.fname} ${message.mname ? message.mname[0] + "." : ""}`}
                  </p>
                  {message.content}
                  <p className={`mt-1 mb-0 text-black-50 ${message.User.login_username === cookies.login_username ? 'text-end' : 'text-start'}`} style={{ fontSize: '.8rem' }}>
                    {new Date(message.createdAt).toLocaleString()}
                  </p>
                </Card.Body>
              </Card>
            </div>
          ))}
        </div>
        {hideTextBox ?
          '' :
          <Form onSubmit={handleMessageSend}>
            <Stack direction="horizontal" gap={3}>
              <Form.Control
                className="me-auto"
                name="content"
                placeholder="Type your message here..."
                onChange={handleChange}
                value={formData.content} />
              <Button variant="primary" type='submit'>
                Send
              </Button>
            </Stack>
          </Form>
        }
      </Container>

    </LoadingOverlay>
  );
};

export default Chat;

