import { useEffect, useState } from 'react';
import { Button, ListGroup, Container, Row, Col, Card } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { socket } from '../../../socket';
import { customFetch } from '../../../utils';

const UserApprovalComponent = () => {
  const [users, setUsers] = useState([])
  const [approvedUsers, setApprovedUsers] = useState([]);
  const [deniedUsers, setDeniedUsers] = useState([]);

  const setApproval = (userId, approvalType) => {
    customFetch(`${global.server_backend_url}/backend/admin/pendinguser/${userId}`, {
      method: 'PUT',
      body: JSON.stringify({ approved: approvalType })
    })
      .then((response) => {
        fetchAll()
        if (response.ok) {
          return response.json()
        };
        throw response;
      }).then(data => toast(data.msg)
      ).catch((error) => {
        console.error(error);
        toast("Something went wrong when setting user approval.");
      });
  }

  const approveUser = (userId) => {
    setApprovedUsers([...approvedUsers, userId]);
    setApproval(userId, "Approved")
  };

  const denyUser = (userId) => {
    setDeniedUsers([...deniedUsers, userId]);
    setApproval(userId, "Unapproved")
  };


  const fetchAll = () => {
    customFetch(`${global.server_backend_url}/backend/admin/pendingusers`, {})
      .then((response) => {
        if (response.ok) return response.json();
        throw response;
      })
      .then((data) => {
        console.log(data)
        setUsers(data
          .slice()
          .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
        );
      })
      .catch((error) => {
        console.error(error);
        toast("Something went wrong when fetching pending users.");
      });
  }

  useEffect(() => {
    fetchAll()
    socket.on("notify", () => {
      fetchAll()
    });
  }, [])
  const renderUserList = () => {
    return users.map((user) => (
      !approvedUsers.includes(user.id) && !deniedUsers.includes(user.id) &&
      <ListGroup.Item key={user.id}>
        <Container>
          <Row>
            <Col>
              <p className="fw-bold mb-2 border-bottom border-secondary pb-2">
                {`${user.lname} , ${user.fname} ${user.mname ? user.mname : ""}`}
              </p>
              <div className='ms-4'>
                <div>User Type: {user.type}</div>
                <div>Username: {user.login_username}</div>
              </div>
            </Col>
            <Col className='d-flex justify-content-end'>
              <Button
                variant="success"
                className='m-2'
                onClick={() => approveUser(user.id)}
                disabled={approvedUsers.includes(user.id) || deniedUsers.includes(user.id)}
              >
                Approve
              </Button>
              <Button
                variant="danger"
                className='m-2'
                onClick={() => denyUser(user.id)}
                disabled={approvedUsers.includes(user.id) || deniedUsers.includes(user.id)}
              >
                Deny
              </Button>
            </Col>
          </Row>
        </Container>
      </ListGroup.Item>
    ));
  };

  return (
    <div>
      <Card className="shadow-sm">
        <Card.Header as={"h2"}>User Registration Approval</Card.Header>
        <Card.Body>
          <ListGroup>{
            users.length !== 0
              ? renderUserList()
              : <div className='text-secondary align-self-center'>Nothing to show</div>
          }</ListGroup>
        </Card.Body>
      </Card>
    </div>
  );
};

export default UserApprovalComponent;
