import { useEffect, useState } from "react";
import { Alert, ListGroup } from "react-bootstrap";
import { toast } from "react-toastify";
import { customFetch } from "../../utils";

const SideNotifications = () => {
  const [notifications, setNotifications] = useState([])
  const [dismissedNotifications, setDismissedNotifications] = useState([]);

  const fetchAll = () => {
    customFetch(`${global.server_backend_url}/backend/notifications/notifications`, {})
      .then((response) => {
        if (response.ok) return response.json();
        throw response;
      })
      .then((data) => {
        console.log(data)
        setNotifications(data
          .slice()
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        );
        setDismissedNotifications([])
      })
      .catch((error) => {
        console.error(error);
        toast("Something went wrong when fetching notifications.");
      });
  }

  useEffect(() => {
    fetchAll()
  }, [])

  const dismissNotification = (id) => {
    setDismissedNotifications([...dismissedNotifications, id]);
    customFetch(`${global.server_backend_url}/backend/notifications/removeFromUsersToNotify/${id}`, {
      method: 'PUT'
    })
      .then((response) => {
        if (response.ok) {
          fetchAll()
          return
        };
        throw response;
      })
      .catch((error) => {
        console.error(error);
        toast("Something went wrong when removing from notification.");
      });

  };

  return (
    <ListGroup className="overflow-scroll" style={{ maxHeight: "38rem" }}>
      {notifications.map((notification) => (
        !dismissedNotifications.includes(notification.id) && (
          <Alert
            key={notification.id}
            dismissible
            onClose={() => dismissNotification(notification.id)}
          >
            <p className="fw-bold mb-2 border-bottom border-secondary pb-2">{notification.title}</p>
            {notification.message}
          </Alert>
        )
      ))}
    </ListGroup>
  );
};

export default SideNotifications;
