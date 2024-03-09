
import PropTypes from 'prop-types';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';

function MainScreen({accessToken, onLogOut, profile_image_url, user_id, username}) {
  let img;
  if (profile_image_url) {
    img = (
      <img src={profile_image_url} className="rounded-circle" alt={username} style={{maxHeight: 'calc(20px + 2vmin)'}} />
    );
  }
  return (
    <div className="main-screen">
      <Navbar expand={false} className="bg-body-tertiary">
        <Container fluid>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Brand href="#">{img} {username}</Navbar.Brand>
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link className="px-2 fw-bold" href="#" onClick={onLogOut}>
                Logout
              </Nav.Link>
              <Navbar.Text className="px-2">
                id: {user_id}
              </Navbar.Text>
              <Navbar.Text className="px-2">
                access_token: {accessToken}
              </Navbar.Text>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <nav className="navbar navbar-expand-xl navbar-dark fixed-top bg-dark inter-font d-none" data-bs-theme="dark">
        <div className="container-fluid">
          <button className="navbar-toggler collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#navbarCollapse" aria-controls="navbarCollapse" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarCollapse">
            <ul className="navbar-nav me-auto mb-2 mb-md-0">
              <li className="nav-item">
                <a className="nav-link active" aria-current="page" onClick={onLogOut} href="#">Logout</a>
              </li>
            </ul>
            <span className="navbar-text">
              id: {user_id}
            </span>
            <span className="navbar-text">
              access_token: {accessToken}
            </span>
          </div>
          <a className="navbar-brand" title={user_id} href="#">{img} {username}</a>
        </div>
      </nav>
      <div className="text-center">
        <button onClick={onLogOut} className="btn btn-primary">Log Out</button>
      </div>
    </div>

  );
}

MainScreen.propTypes = {
  accessToken: PropTypes.any,
  onLogOut: PropTypes.func.isRequired,
  profile_image_url: PropTypes.any,
  user_id: PropTypes.any,
  username: PropTypes.any,
};

MainScreen.defaultProps = {
  accessToken: '',
  profile_image_url: '',
  user_id: '',
  username: '',
};
export default MainScreen;
