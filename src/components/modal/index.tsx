import {JSX, ReactElement} from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

import './modal.css';

interface ModalProps {
  children: ReactElement;
  handleClose: () => void;
  id?: string,
  show: boolean;
  title: string;
}

function ModalReusable({children, handleClose, id='modal-reusuable', show, title}: ModalProps): JSX.Element {
  // const {children, handleClose, id, show, title} = props;
  return (
    <Modal id={id} show={show} fullscreen="md-down" dialogClassName="modal-90w" onHide={handleClose} className="modal-reusable">
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
