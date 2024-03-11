import PropTypes from 'prop-types';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Offcanvas from 'react-bootstrap/Offcanvas';

import './header.css';

export const noop = ()=>{};

function Header({accessToken, onLogOut, profile_image_url, user_id, username}) {
  let img;
  if (profile_image_url) {
    img = (
      <img src={profile_image_url} className="rounded-circle" alt={username} style={{maxHeight: '28px'}} />
    );
  }
  let expand = '';


  return (
    <Navbar expand={false} data-bs-theme="dark" className="bg-body-tertiary mb-3 py-0 raleway-font">
      <Container fluid>
        <Navbar.Brand className="fw-semibold">{img} {username}</Navbar.Brand>
        <Navbar.Toggle aria-controls={`offcanvasNavbar-expand-${expand}`} className="border-0 rounded-0" />
        <Navbar.Offcanvas
          id={`offcanvasNavbar-expand-${expand}`}
          aria-labelledby={`offcanvasNavbarLabel-expand-${expand}`}
          placement="end"
          className="raleway-font"
        >
          <Offcanvas.Header closeButton>
            <Offcanvas.Title id={`offcanvasNavbarLabel-expand-${expand}`} className="fw-bold">
              Settings
            </Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body className="fw-medium">
            <Nav className="justify-content-end flex-grow-1 pe-3">
              <Nav.Item>
                User Info
              </Nav.Item>
              <Navbar.Text className="px-2">
                id: {user_id}
              </Navbar.Text>
              <Navbar.Text className="px-2">
                access_token: {accessToken}
              </Navbar.Text>
              <hr className="border-bottom my-2" />
              <Nav.Link onClick={onLogOut}>Logout</Nav.Link>
            </Nav>
          </Offcanvas.Body>
        </Navbar.Offcanvas>
      </Container>
    </Navbar>
  );
}

Header.propTypes = {
  accessToken: PropTypes.any,
  onLogOut: PropTypes.func,
  profile_image_url: PropTypes.any,
  user_id: PropTypes.any,
  username: PropTypes.any,
};

Header.defaultProps = {
  accessToken: '',
  onLogOut: noop,
  profile_image_url: '',
  user_id: '',
  username: '',
};
export default Header;
