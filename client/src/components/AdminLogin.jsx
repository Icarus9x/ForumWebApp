import {useContext, useState, useEffect} from 'react';
import QRCode  from 'react-qr-code';
import {Container, Form, Button} from 'react-bootstrap'
import {Link} from 'react-router'

function AdminLogin(props){
    const {mfa} = props;
    const [totp, setTotp] = useState("");

    const [QRurl, setUrl] = useState(undefined);

    const [error, setError] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        setError(null);
    
        mfa({code : totp});
    
      };

    useEffect(() => {
        async function getQRurl(){
        try{
            const response = await fetch('http://localhost:3001/2faCode', {
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include'
            });
            
            if (response.ok) {
              const data = await response.json();
                setUrl(data.url);
            }
          }catch(err){
            console.error("Error: " + err);
          }
        }

        getQRurl();
    }, []);

    return <Container className="mt-5" style={{ maxWidth: '400px' }}>
    <p>Scan this QR code with your authenticator app:</p>
    {QRurl && <div className="text-center mb-4">
        <img
          src={QRurl}
          style={{ width: 180, height: 180, display: 'block', margin: 'auto' }}
        />
    </div>}
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-3" controlId="totpPassword">
        <Form.Label>Enter your password or TOTP code</Form.Label>
        <Form.Control
          type="password"
          value={totp}
          onChange={e => setTotp(e.target.value)}
          placeholder="Password or 6-digit code"
          required
        />
      </Form.Group>

      {error && <p className="text-danger">{error}</p>}
      <div className="d-flex justify-content-between">
      <Button variant="primary" type="submit" className="w-5">
        Login as Admin
      </Button>
      <Link to="/"><Button variant ="secondary" type="submit"><i className="bi bi-house"/></Button></Link>
      </div>
    </Form>
  </Container>
}

export default AdminLogin;