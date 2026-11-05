import { Link } from 'react-router-dom';

export default function ErrorPage() {
  return (
    <div style={{ padding: '2rem', color: 'red' }}>
      <h1>Login Failure</h1>
      <p>The credentials you entered were incorrect.</p>
      <Link to="/">Return to Login</Link>
    </div>
  );
}