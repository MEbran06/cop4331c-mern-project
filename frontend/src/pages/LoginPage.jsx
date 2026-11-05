import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function LoginPage() {
  const [username, setUsername] = useState('');
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ login: username, password: password }) 
      });

      const data = await response.json();

      if (response.ok) {
        navigate('/dashboard');
      } else {
        navigate('/error');
      }
    } catch (error) {
      console.error('Login error:', error);
      navigate('/error');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Login</h1>
      <form onSubmit={handleLogin}>
        <div>
          <label>Username: </label>
          <input type="text" onChange={(e) => setUsername(e.target.value)} required />
        </div>
        <div>
          <label>Password: </label>
          <input type="password" onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="submit">Login</button>
      </form>
      <p>Need an account? <Link to="/register">Register here</Link></p>
    </div>
  );
}