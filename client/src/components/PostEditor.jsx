import {useState, useEffect} from 'react'
import {useParams, Link, useNavigate} from 'react-router'
import { Container, Form, Button } from 'react-bootstrap';

function PostEditor(){

    const {id} = useParams();
    const postId = Number(id);
    const [loadingPost, setLoadingPost] = useState(false);
    const [post, setPost] = useState(undefined);
    const navigate = useNavigate();

    useEffect(() => {
        async function getPost(){
            const response = await fetch('http://localhost:3001/post/' + postId, {
                headers: {
                    'Content-Type': 'application/json'
                  },
                  credentials: 'include'
            })

            if(response.ok){
                const result = await response.json();
                setPost(result);
                setLoadingPost(false);
            }else{
                setLoadingPost(false);
                console.error("Something went wrong retrieving post");
            }
            
        }
        setLoadingPost(true);
        getPost();
    }, [id]);

    const handleSubmit = async () => {
        const response = await fetch(`http://localhost:3001/post/${post.id}`, {
            method : 'PUT',
            headers: {
                'Content-Type': 'application/json'
              },
              credentials: 'include',
              body: JSON.stringify({ text: post.text })
        })

        if(response.ok){
            navigate(`/posts/${postId}`);
        }
    }

    return (!loadingPost && post &&
        <Container className="mt-4" style={{ maxWidth: '600px' }}>
          <h3 className="mb-4">Edit Post</h3>
          <Form onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }
          }>
            <Form.Group className="mb-3" controlId="postTitle">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter post title"
                value={post.title ?? ""}
                readOnly
              />
            </Form.Group>
      
            <Form.Group className="mb-3" controlId="postContent">
              <Form.Label>Content</Form.Label>
              <Form.Control
                as="textarea"
                rows={6}
                placeholder="Write your post..."
                value={post.text ?? ""}
                onChange={e => setPost(p => ({ ...p, text: e.target.value }))}
                required
              />
            </Form.Group>
      
      
            <div className="d-flex justify-content-between">
              <Button variant="primary" type="submit" className="w-50">
                Publish Post
              </Button>
              <Link to='/'>
                <Button type="button" className="mt-2" variant="secondary">
                  <i className="bi bi-house" />
                </Button>
              </Link>
            </div>
          </Form>
        </Container>)
}

export default PostEditor;