import { useState } from 'react'
import {Container, Form, Button, Row, Col, Alert} from "react-bootstrap"
import {Link} from 'react-router';

function LoginForm({handleLogin}) {
    const [username, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
  
    const submitLogin = async (event) => {
      event.preventDefault();
      if (!username || !password) {
        setErrorMsg('Email and password are mandatory');
        return;
      }

      setErrorMsg('');
      const res = await handleLogin({ username, password });

      if(!res.success)
        setErrorMsg("Wrong email or password");
    };
  
    return (
      <Container className="mt-5">
        <Row className="justify-content-md-center">
          <Col md={6}>
            <h2>Login</h2>
            {errorMsg && <Alert variant="danger">{errorMsg}</Alert>}
            <Form onSubmit={submitLogin}>
              <Form.Group controlId="formEmail" className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter your email"
                  value={username}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Form.Group>
  
              <Form.Group controlId="formPassword" className="mb-3">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </Form.Group>
  
            <div className="d-flex justify-content-between">
            <Button variant="primary" type="submit">
             Login
            </Button>
            <Link to='/'><Button type='submit' className='mt-2' variant = 'secondary'><i className='bi bi-house'/></Button></Link>
            </div>
            
            </Form>
          </Col>
        </Row>
      </Container>
    );
  }
  
  export default LoginForm;