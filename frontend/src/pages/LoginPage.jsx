import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const API_URL = window.location.hostname === 'localhost' 
      ? 'http://localhost:5000/api/auth/login' 
      : '/api/auth/login';

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('role', data.user.role);
        if (data.token) {
           localStorage.setItem('token', data.token);
        }
        navigate('/dashboard');
      } else {
        alert(`Login failed: ${data.error || 'Invalid credentials'}`);
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Could not connect to the server.');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.badge}>WELCOME BACK!</div>
        <p style={styles.subtitle}>Log in to see what your clubs are up to.</p>
        
        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>EMAIL</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              style={styles.input}
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>PASSWORD</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              style={styles.input}
            />
          </div>
          <button type="submit" style={styles.button}>LOG IN →</button>
        </form>

        <p style={styles.footerText}>
          Need an account? <Link to="/register" style={styles.link}>CREATE ACCOUNT</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: '#D1D1D1',
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    padding: '1rem'
  },
  card: {
    backgroundColor: '#FFFFFF',
    border: '3px solid #000000',
    boxShadow: '6px 6px 0px #000000',
    width: '100%',
    maxWidth: '400px',
    padding: '2rem',
    boxSizing: 'border-box'
  },
  badge: {
    backgroundColor: '#FFCC00',
    color: '#000000',
    fontWeight: '900',
    fontSize: '1.5rem',
    padding: '0.5rem 1rem',
    display: 'inline-block',
    border: '2px solid #000000',
    marginBottom: '1rem',
    letterSpacing: '1px'
  },
  subtitle: {
    fontSize: '0.9rem',
    color: '#333',
    marginBottom: '1.5rem'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.2rem'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem'
  },
  label: {
    fontSize: '0.75rem',
    fontWeight: 'bold',
    letterSpacing: '0.5px'
  },
  input: {
    padding: '0.75rem',
    border: '2px solid #000000',
    fontSize: '1rem',
    outline: 'none',
    backgroundColor: '#FAFAFA'
  },
  button: {
    backgroundColor: '#FFCC00',
    color: '#000000',
    fontWeight: '900',
    padding: '0.9rem',
    border: '2px solid #000000',
    cursor: 'pointer',
    boxShadow: '3px 3px 0px #000000',
    marginTop: '0.5rem',
    fontSize: '1rem',
    letterSpacing: '1px'
  },
  footerText: {
    marginTop: '1.5rem',
    fontSize: '0.85rem',
    textAlign: 'center'
  },
  link: {
    color: '#000000',
    fontWeight: 'bold',
    textDecoration: 'underline'
  }
};