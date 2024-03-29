import {ReactElement} from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

import './modal.css';

interface ModalProps {
  children: ReactElement;
  handleClose: () => void;
  show: boolean;
  title: string;
}

function ModalReusable(props: ModalProps): JSX.Element {
  const {children, handleClose, show, title} = props;
  return (
    <Modal show={show} fullscreen="md-down" dialogClassName="modal-90w" onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {children}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ModalReusable;
