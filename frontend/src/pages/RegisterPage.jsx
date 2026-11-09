import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    const API_URL = window.location.hostname === 'localhost' 
      ? 'http://localhost:5000/api/users' 
      : '/api/users';

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, username, password, role })
      });

      if (response.ok) {
        alert('Account created successfully! Please log in.');
        navigate('/');
      } else {
        const errorData = await response.json();
        alert(`Registration failed: ${errorData.error || errorData.message}`);
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('Could not connect to the server.');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.badge}>CREATE YOUR ACCOUNT</div>
        
        <form onSubmit={handleRegister} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>FULL NAME</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required style={styles.input} />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>EMAIL</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={styles.input} />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>USERNAME</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required style={styles.input} />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>PASSWORD</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={styles.input} />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>ROLE</label>
            <select value={role} onChange={(e) => setRole(e.target.value)} style={styles.input}>
              <option value="student">Student</option>
              <option value="club">Club</option>
            </select>
          </div>
          <button type="submit" style={styles.button}>CREATE ACCOUNT →</button>
        </form>

        <p style={styles.footerText}>
          Already have an account? <Link to="/" style={styles.link}>LOG IN</Link>
        </p>
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
    maxWidth:'420px',
    padding:'2rem',
    boxSizing:'border-box'
  },
  badge: {
    backgroundColor:'#FFCC00',
    color:'#000000',
    fontWeight:'900',
    fontSize:'1.3rem',
    padding:'0.5rem 1rem',
    display:'inline-block',
    border:'2px solid #000000',
    marginBottom:'1.5rem',
    letterSpacing:'1px'
  },
  form: {
    display:'flex',
    flexDirection:'column',
    gap:'1rem'
  },
  inputGroup: {
    display:'flex',
    flexDirection:'column',
    gap:'0.3rem'
  },
  label: {
    fontSize:'0.75rem',
    fontWeight:'bold',
    letterSpacing:'0.5px'
  },
  input: {
    padding:'0.7rem',
    border:'2px solid #000000',
    fontSize:'0.95rem',
    outline:'none',
    backgroundColor:'#FAFAFA',
    color:'#000000',
  },
  button: {
    backgroundColor:'#FFCC00',
    color:'#000000',
    fontWeight:'900',
    padding:'0.9rem',
    border:'2px solid #000000',
    cursor:'pointer',
    boxShadow:'3px 3px 0px #000000',
    marginTop:'0.8rem',
    fontSize:'1rem',
    letterSpacing:'1px'
  },
  footerText: {
    marginTop:'1.2rem',
    fontSize:'0.85rem',
    textAlign:'center'
  },
  link: {
    color:'#000000',
    fontWeight:'bold',
    textDecoration:'underline'
  }
};