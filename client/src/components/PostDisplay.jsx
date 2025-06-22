import { useContext, useEffect, useState } from 'react';
import { Container, Card, Row, Col, ListGroup, Form, Button } from 'react-bootstrap';
import {useParams, Link, useNavigate} from 'react-router';
import NavigationBar from './NavigationBar';
import AuthnContext from '../AuthnContext';
import SuperUserContext from '../SuperUserContext';
import CommentVoting from './CommentVoting';

function ShowComments(props){
    const {post, comments, setComments, loadingComments} = props;
    const [newComment, setNewComment] = useState('');
    const [editMode, setEditMode] = useState(undefined);
    const [oldComment, setOldComment] = useState("");
    const user = useContext(AuthnContext);
    const superUser = useContext(SuperUserContext);

    //COMMENT ADDER
    async function handleAddComment(e) {
        e.preventDefault();
        if (!newComment.trim()) return;
    
        try {
          const res = await fetch(`http://localhost:3001/comment/${post.id}`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ text: newComment }),
            credentials: 'include',
          });
          console.log(res);
          if (res.ok) {
            const addedComment = await res.json();
            setComments(prev => [...prev, addedComment]);
            setNewComment('');
          } else {
            console.error("Failed to add comment");
          }
        } catch (e) {
          console.error(e);
        }
      }

      //COMMENT DELETER
    const deleteComment = async (id) => {
        try {
            const response = await fetch(`http://localhost:3001/comment/${id}`, {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include'
            });
      
            
            if (response.ok) {
              setComments(comments.filter(c => c.id!==id));
              //SOMETHING SHOWING SUCCESS
            } else {
              //SOMETHING SHOWING FAIL
            }
          } catch (err) {
            console.error('Error: ', err);
          }
      }
    
      //COMMENT EDITOR
      const editComment = async (id) => {
        try {
            const response = await fetch(`http://localhost:3001/comment/${id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ text: oldComment }),
              credentials: 'include'
            });
            setEditMode(undefined);
            if (response.ok) {
                const result = await response.json();
                setComments(comments.map(c => c.id === id ? result : c));
              setOldComment("");
              //SOMETHING SHOWING SUCCESS
            } else {
              //SOMETHING SHOWING FAIL
            }
          } catch (err) {
            console.error('Error: ', err);
          }
      }

      return <div>
      <h5>Comments</h5>

      {loadingComments ? (
        <p>Loading comments...</p>
      ) : (
        <ListGroup variant="flush" className="mb-3">
          {comments.length === 0 && <p>No comments yet.</p>}
          {comments.map(c => (
            <ListGroup.Item key={c.id} className="d-flex justify-content-between align-items-start">
              <div>
              <strong>{c.author || 'Anonimo'}:</strong> {c.text} <br />
              <small className="text-muted">{new Date(c.timestamp).toLocaleString()}</small>
              </div>

              {(superUser || user.id === c.author_id) && (
<div>
  <Button 
    variant="outline-primary" 
    size="sm" 
    className="me-2"
    onClick={() => {
        setEditMode(editMode===c.id ? undefined : c.id);
        setOldComment(c.text);
    }}
  >
    <i className="bi bi-pencil"></i>
  </Button>{editMode===c.id && <Form onSubmit={(e) => { 
e.preventDefault(); 
editComment(c.id); 
}}>
  <textarea
    value={oldComment}
    onChange={(e) => setOldComment(e.target.value)}
    rows={4}
    style={{ width: '100%', resize: 'vertical' }}
    required
  />
  <Button type="submit">Send</Button>
</Form>}
  <Button 
    variant="outline-danger" 
    size="sm" 
    onClick={() =>  deleteComment(c.id)}
  >
    <i className="bi bi-trash"></i>
  </Button>
</div>
)}
           <CommentVoting comment={c.id}/>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}

      <Form onSubmit={handleAddComment}>
        <Form.Group controlId="newComment">
          <Form.Control
            as="textarea"
            rows={2}
            placeholder="Type a comment..."
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
          />
        </Form.Group>
        <div className="d-flex justify-content-between">
        <Button type="submit" className="mt-2" disabled={!newComment.trim()}>Submit comment</Button>
        <Link to='/'><Button type='submit' className='mt-2' variant = 'secondary'><i className='bi bi-house'/></Button></Link>
        </div>
      </Form>
      </div>
}



function PostDisplay(props) {
    const {logout} = props;
    const {id} = useParams();
    const postId = Number(id);
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loadingPost, setLoadingPost] = useState(true);
  const [loadingComments, setLoadingComments] = useState(true);
  
const navigate = useNavigate();
  const user = useContext(AuthnContext);
  const superUser = useContext(SuperUserContext);


  useEffect(() => {
    async function fetchPost() {
      setLoadingPost(true);
      try {
        const res = await fetch(`http://localhost:3001/post/${postId}`, { 
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
          });
        if (res.ok) {
          const data = await res.json();
          setPost(data);
        } else {
          console.error("Failed to fetch post");
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingPost(false);
      }
    }

    async function fetchComments() {
      setLoadingComments(true);
      try {
        const res = await fetch(`http://localhost:3001/comment/${postId}`, {
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
          });
        if (res.ok) {
            let data = [];
            if(res.status!==204)
                 data = await res.json();
          setComments(data);
        } else {
          console.error("Failed to fetch comments");
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingComments(false);
      }
    }

    fetchPost();
    fetchComments();
  }, [postId]);

  

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:3001/post/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      if (response.ok) {
        navigate("/");
        //SOMETHING SHOWING SUCCESS
      } else {
        //SOMETHING SHOWING FAIL
      }
    } catch (err) {
      console.error('Error: ', err);
    }
  }

  

  if (loadingPost) return <Container><p>Loading post...</p></Container>;
  if (!post) return <Container><p>Post not found.</p></Container>;

  return (<Container fluid>
    <NavigationBar logout={logout}/>
    <br/>
    <Container className="my-4" style={{ maxWidth: '700px' }}>
      <Card>
        <Card.Body>
        {superUser ||  user.id===post.authorid ? <div className="d-flex justify-content-between align-items-start">
        <Card.Title>{post.title}</Card.Title>
    
        <div>
        <Link to={`/editPost/${post.id}`}>
        <Button variant="outline-primary" size="sm" className="me-2" >
            <i className="bi bi-pencil"></i>
        </Button>
        </Link>
        <Button variant="outline-danger" size="sm" onClick = {() => handleDelete(post.id)}>
        <i className="bi bi-trash"></i>
        </Button>
        </div>
        </div> :  <Card.Title>{post.title}</Card.Title> }
        
          <Card.Subtitle className="mb-2 text-muted">by {post.author} - {new Date(post.timestamp).toLocaleString()}</Card.Subtitle>
          
          <Card.Text style={{ whiteSpace: 'pre-wrap' }}>{post.text}</Card.Text>
          
          <hr />
        <ShowComments post = {post} comments = {comments} setComments={setComments} loadingComments={loadingComments}/>
        </Card.Body>
      </Card>
    </Container>
    </Container>
  );
}

export default PostDisplay;