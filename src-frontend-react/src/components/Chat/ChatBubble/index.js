import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';

const Chat = ({ messages }) => {
  const sortedMessages = messages.slice().sort((a, b) => a.timestamp - b.timestamp);
  return (
    <Container className='px-3 mb-4 border-bottom' style={{ borderBottom: '1px solid #ccc' }}>
      <div className="overflow-scroll p-3" style={{ maxHeight: "30rem" }}>
        {sortedMessages.map((message, index) => (
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
    </Container>
  );
};

export default Chat;

