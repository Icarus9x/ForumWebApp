import { useState } from 'react';
import { Form, Button, Container } from 'react-bootstrap';
import {Link, useNavigate} from 'react-router';

function PostAdder(props){
    const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [maxComments, setMaxComments] = useState(undefined);
    const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      setError('Please fill in both fields');
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ title : title, text: content, maxcomments: maxComments })
      });

      if (response.ok) {
        let data={id : ""};
        if(response.status===200)
         data = await response.json()
        setTitle('');
        setContent('');

        navigate("/posts/" + data.id);
      } else {
        console.err('Failed to create post');
      }
    } catch (err) {
      console.error('Error connecting to server' + err);
    }
  };

  return (
    <Container className="mt-4" style={{ maxWidth: '600px' }}>
      <h3 className="mb-4">Create a New Post</h3>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3" controlId="postTitle">
          <Form.Label>Title</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter post title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="postContent">
          <Form.Label>Content</Form.Label>
          <Form.Control
            as="textarea"
            rows={6}
            placeholder="Write your post..."
            value={content}
            onChange={e => setContent(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-4" controlId="maxComments">
          <Form.Label>Maximum number of comments (optional)</Form.Label>
          <Form.Control
            type="number"
            min="0"
            placeholder="Leave empty for unlimited"
            value={maxComments}
            onChange={e => setMaxComments(e.target.value)}
          />
        </Form.Group>

        <div className="d-flex justify-content-between">
        <Button variant="primary" type="submit" className="w-50">
          Publish Post
        </Button>
            <Link to='/'><Button type='submit' className='mt-2' variant = 'secondary'><i className='bi bi-house'/></Button></Link>
            </div>
        
      </Form>
    </Container>
  );
}

export default PostAdder;