import {useState, useContext, useEffect} from 'react';
import AuthnContext from '../AuthnContext';
import {Button} from "react-bootstrap";

function CommentVoting(props){
    const {comment} = props;
    const [likes, setLikes] = useState([]);
    const user = useContext(AuthnContext);

    useEffect(() => {
        async function fetchLikes(){
            const response = await fetch(`http://localhost:3001/comment/${comment}/allMark`, {
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include'
            })
            if(response.ok){
                const result = await response.json();
                setLikes(result.map(l => l.user_id));
            }

        }

        fetchLikes()
    }, [comment])

    const likeComment = async () => {
        let response
        if(likes.includes(user.id)){
            response = await fetch(`http://localhost:3001/comment/${comment}/unmark`, {
                method : 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include'
            });
            if(response.ok){
                setLikes(likes.filter(l=> l!==user.id));
            }
        }else{
            response = await fetch(`http://localhost:3001/comment/${comment}/mark`, {
                method : 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include'
            });
            if(response.ok){
                setLikes([...likes, user.id]);
            }
        }
    }
    
    return <div className="d-flex justify-content-end align-items-center gap-2">
  <Button
    variant="link"
    size="sm"
    onClick={likeComment}
    style={{ padding: 0 }}
  >
    <i
      className="bi bi-caret-up-fill"
      style={{
        fontSize: '1.5rem',
        color: likes.includes(user.id) ? 'orange' : 'lightgray'
      }}
    ></i>
  </Button>

  <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{likes.length}</div>
</div>
}

export default CommentVoting;