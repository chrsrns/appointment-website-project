import { useState, useEffect } from "react";
import { Modal, Spinner } from "react-bootstrap";

const FullscreenLoaderModal = ({ show }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading for demonstration purposes
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 3000); // Adjust the delay as needed

    return () => clearTimeout(timeout);
  }, []);

  return (
    <Modal show={show} centered backdrop="static" keyboard={false}>
      <Modal.Body className="text-center">
        {isLoading ? (
          <Spinner animation="border" variant="primary" />
        ) : (
          <p>Website is ready!</p>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default FullscreenLoaderModal;
