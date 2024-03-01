import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';

import {Counter} from '@/features/state-counter/Counter';
import {ReduxCounter} from '@/features/redux-counter/ReduxCounter';

import Todo from '@/features/todos/Todos';
import {Link} from 'react-router-dom';

import './demo.css';

const createDemoExample = (component: JSX.Element, title: string) => (
  <Col className="Demo-example" lg="4">
    <Card bg="dark" text="white" border="primary" className="shadow h-100">
      <Card.Body>
        <Card.Title className="pb-1 border-bottom border-secondary-subtle">
          {title}
        </Card.Title>
        {component}
      </Card.Body>
    </Card>
  </Col>
);

function Demo() {
  return (
    <div className="Demo">
      <Navbar bg="dark" data-bs-theme="dark" sticky="top" >
        <Container>
          <Navbar.Brand>
            <Link className="navbar-brand" to="/">
              ← Home
            </Link>
          </Navbar.Brand>
        </Container>
      </Navbar>

      <Container className="text-center pt-2">

        <small>Oh, hey, you found some...</small>

        <h2 className="py-3">Demos & Examples</h2>

      </Container>

      <Container className="Demo-examples" data-bs-theme="dark">
        <Row>
          {createDemoExample(<Todo />, 'Redux To-Dos')}

          {createDemoExample(<ReduxCounter />, 'Redux Counter')}

          {createDemoExample(<Counter />, 'State Counter')}
        </Row>
      </Container>
    </div>
  );
}

export default Demo;
