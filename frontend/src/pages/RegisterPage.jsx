import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    
    // Dynamically choose API URL based on where it's running
    const API_URL = window.location.hostname === 'localhost' 
      ? 'http://localhost:5000/api/users' 
      : '/api/users';

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          name, 
          email, 
          username, 
          password, 
          role 
        })
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
    <div style={{ padding: '2rem' }}>
      <h1>Register New Account</h1>
      <form onSubmit={handleRegister}>
        <div>
          <label>Name: </label>
          <input type="text" onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <label>Email: </label>
          <input type="email" onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label>Desired Username: </label>
          <input type="text" onChange={(e) => setUsername(e.target.value)} required />
        </div>
        <div>
          <label>Password: </label>
          <input type="password" onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <div>
          <label>Role: </label>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="student">Student</option>
            <option value="club">Club</option>
          </select>
        </div>
        <button type="submit">Create Account</button>
      </form>
    </div>
  );
}