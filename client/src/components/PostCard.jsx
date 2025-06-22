import {useEffect, useState, useContext} from 'react';
import {Link} from 'react-router';
import { Card, Row, Col, Badge, Button, ListGroup, Form} from 'react-bootstrap';
import AuthnContext from '../AuthnContext';
import SuperUserContext from '../SuperUserContext';

function PostCard(props) {
  const { id, title, author, timestamp, content, commentCount, maxComments } = props;
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [adderHovered, setAdderHovered] = useState(false);
  const [comment, setComment] = useState("");
  const [currentCommentsNumber, setCurrentCommentNumber] = useState(commentCount);

  const superUser = useContext(SuperUserContext);

  useEffect(() => {
    async function getComments() {
      try {
        const response = await fetch(`http://localhost:3001/comment/${id}`, {
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });

        if (response.ok) {
          const text = await response.text();
        
          if (text.trim() !== '') {
            const result = JSON.parse(text);
            setComments(result.map(c => ({
              id: c.id,
              text: c.text,
              author: c.author,
              timestamp: c.timestamp
            })));
          } else 
            setComments([]); 
        }
      } catch (err) {
        console.error("Error during posts fetch: ", err);
      } finally {
        setLoading(false);
      }
    }

    setLoading(true);
    getComments();
  }, [id, currentCommentsNumber]);

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (comment.trim() !== '') {
      try {
        const response = await fetch(`http://localhost:3001/comment/${id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ text: comment }),
        });
  
        if (response.ok) {
          setCurrentCommentNumber(currentCommentsNumber+1);
          setComment("");
        } else {
          console.error('Failed to create comment');
        }
      } catch (err) {
        console.error('Error connecting to server: ' + err);
      }
    }
  }

  const deleteComment = async (id) => {
    try {
      const response = await fetch(`http://localhost:3001/comment/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      if (response.ok) {
        setComments(comments.filter(c => c.id!==id));
        setCurrentCommentNumber(currentCommentsNumber-1);
        //SOMETHING SHOWING SUCCESS
      } else {
        //SOMETHING SHOWING FAIL
      }
    } catch (err) {
      console.error('Error: ', err);
    }
  }

  return (
    <Card
      className="mb-4 shadow-sm"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Card.Body>
        <Row className="mb-2">
          <Col>
            <Card.Title>{title}</Card.Title>
            <Card.Subtitle className="text-muted">by {author}</Card.Subtitle>
          </Col>
          <Col className="text-end">
            <small className="text-muted">{new Date(timestamp).toLocaleString()}</small>
          </Col>
        </Row>

        <Card.Text className="post" style={{ whiteSpace: 'pre-line' }}>{content}</Card.Text>

        <Row className="mt-3">
          <Col>
            <Badge bg={currentCommentsNumber >= maxComments ? "danger" : "secondary"}>
              {currentCommentsNumber} / {maxComments} comments
            </Badge>
            
            <i className='bi bi-plus'
            onClick={() => setAdderHovered(!adderHovered)}/>
            {adderHovered && <Form onSubmit={handleSubmit}>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Write your comment..."
        rows={4}
        style={{ width: '100%', resize: 'vertical' }}
        required
      />
      <Button type="submit">Send</Button>
    </Form>}
          </Col>
          <Col className="text-end">
            <Link to={`/posts/${id}`}>
              <Button>Check →</Button>
            </Link>
          </Col>
        </Row>

        
        {hovered && (
  loading ? (
    <p className="mt-3">Loading comments...</p>
  ) : comments.length > 0 ? (
    <ListGroup className="mt-3">
      {comments.map((c) => (
        <ListGroup.Item key={c.id} className="small">
          <strong>{c.author || 'Anonymous'}:</strong> <p style={{ whiteSpace: 'pre-line' }}>{c.text}</p>
          {superUser && <i className = 'bi bi-trash' onClick={() => deleteComment(c.id)}/>}
        </ListGroup.Item>
      ))}
    </ListGroup>
  ) : (
    <p className="mt-3 text-muted">No comments available</p>
  )
)}
      </Card.Body>
    </Card>
  );
}

export default PostCard;