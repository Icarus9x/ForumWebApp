import {Navbar, Nav, Container, Form, Row, Button} from "react-bootstrap"
import {useState, useContext} from 'react'
import {Link} from 'react-router'
import AuthnContext from '../AuthnContext'
import SuperUserContext from "../SuperUserContext"

function NavigationBar(props){

    const {logout} = props;
    const user = useContext(AuthnContext);
    const superUser = useContext(SuperUserContext);

    const [search, updateSearch] = useState("");

    return <Row>
    <Navbar expand="lg" bg="primary" variant="dark">
      <Container fluid className='px-3'>
        
         <Form className="d-flex me-3" >
          <Link to="/" className='text-white' style={{textDecoration : 'none'}}>
          <i className="bi bi-bug fs-3 me-2"></i>
          <strong>Forum Variety</strong>
          </Link>
        </Form>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />

        <Navbar.Collapse id="basic-navbar-nav">
         
         

          <Nav className="me-auto">
          
          </Nav>
          {user ? (
  <div className="d-flex align-items-center gap-3">
    <div className="text-white text-end">
      
        {(user.name ? user.name : user.email) + (superUser ? " (Admin)" : "")}
      
    </div>
    
    <Link to='/addPost'>
      <Button type='button'>
        <i className="bi bi-plus-square fs-2 text-white"></i>
      </Button>
    </Link>

    {user.isAdmin && !superUser &&
      <Link to='/loginTOTP'>
        <Button type='button'>
          <i className="bi bi-lock-fill fs-2 text-white"></i>
        </Button>
      </Link>
    }

    <Button type='button' onClick={logout}>
      <i className="bi bi-box-arrow-right fs-2 text-white"></i>
    </Button>
  </div>
) : (
  <Link to='/login'>
    <Button type='button'>
      <i className="bi bi-person fs-2 text-white"></i>
    </Button>
  </Link>
)}
          
          
         
            </Navbar.Collapse>
      </Container>
    </Navbar>
    </Row>
}

export default NavigationBar;