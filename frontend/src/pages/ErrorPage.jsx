import { useNavigate } from 'react-router-dom';

export default function ErrorPage() {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1); 
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.badge}>SYSTEM ERROR</div>
        
        <h1 style={styles.title}>SOMETHING WENT WRONG.</h1>
        <p style={styles.subtitle}>
          The page you are looking for doesn't exist, or you don't have permission to access it.
        </p>

        <button onClick={handleGoBack} style={{ ...styles.button, width: '100%', marginTop: '1rem' }}>
          ← GO BACK
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor:'#F3F3F3',
    minHeight:'100vh',
    display:'flex',
    justifyContent:'center',
    alignItems:'center',
    fontFamily:'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    padding:'1rem'
  },
  card: {
    backgroundColor:'#FFFFFF',
    border:'3px solid #000000',
    boxShadow:'6px 6px 0px #000000',
    width:'100%',
    maxWidth:'450px',
    padding:'3rem 2rem',
    boxSizing:'border-box',
    textAlign:'center',
    display:'flex',
    flexDirection:'column',
    alignItems:'center'
  },
  badge: {
    backgroundColor:'#000000',
    color:'#FFCC00',
    fontWeight:'900',
    fontSize:'1.2rem',
    padding:'0.5rem 1rem',
    display:'inline-block',
    border:'2px solid #000000',
    marginBottom:'1.5rem',
    letterSpacing:'1px'
  },
  title: {
    margin:'0 0 1rem 0',
    fontSize:'1.8rem',
    fontWeight:'900',
    color:'#000000',
    textTransform:'uppercase'
  },
  subtitle: {
    fontSize:'1rem',
    color:'#333',
    marginBottom:'2rem',
    lineHeight:'1.5'
  },
  button: {
    backgroundColor:'#FFCC00',
    color:'#000000',
    fontWeight:'900',
    padding:'0.9rem',
    border:'2px solid #000000',
    cursor:'pointer',
    boxShadow:'3px 3px 0px #000000',
    fontSize:'1rem',
    letterSpacing:'1px',
    textTransform:'uppercase'
  }
};