import {Container, Row} from 'react-bootstrap';
import NavigationBar from './NavigationBar';
import PostCard from './PostCard';
import { useEffect, useState, useContext } from 'react';
import AuthnContext from '../AuthnContext';

function Home(props){

    const {posts, setPosts, logout} = props;
    const [loading, setLoading] = useState(false);
    const user = useContext(AuthnContext);
    
    useEffect(() => {
        async function getPosts(){
            try{
            const response = await fetch('http://localhost:3001/post',  {
                headers: {
                  'Content-Type': 'application/json'
                },
                credentials : 'include'
              });
            
            if(response.ok){
                const result = await response.json();
                setPosts(result.map(p => {return {id:p.id, title : p.title, author : p.author, text: p.text, timestamp:p.timestamp, currentcomments:p.currentcomments, maxcomments:p.maxcomments}}))
                
            }else
            console.error("Error with server response");
        }catch(err){
            console.error("Error during posts fetch: ", err);
        }finally{
            setLoading(false);
        }
        }
        setLoading(true);
        getPosts();
    }, []);

    return (
        <Container fluid>
          <NavigationBar logout={logout}/>
          <br/>
          {loading ? (
            <Row className="justify-content-center">
              <p>Loading...</p>
            </Row>
          ) : (
            <Row>
              {posts.map(p => <PostCard key= {p.id} id= {p.id} title={p.title} author={p.author} content = {p.text} timestamp={p.timestamp} maxComments={p.maxcomments} commentCount={p.currentcomments}/>)}
            </Row>
          )}
        </Container>
      );
}


export default Home;