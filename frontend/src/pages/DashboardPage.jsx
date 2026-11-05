import { useState } from 'react';

export default function DashboardPage() {
  const [items, setItems] = useState(['Plan event', 'Invite guests']);
  const [newItem, setNewItem] = useState('');

  const addItem = () => {
    if (newItem) {
      setItems([...items, newItem]);
      setNewItem('');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Event Dashboard</h1>
      <p>Welcome to the main application!</p>
      
      <div>
        <h3>Manage Tasks (Interactive Element)</h3>
        <input 
          type="text" 
          value={newItem} 
          onChange={(e) => setNewItem(e.target.value)} 
          placeholder="New task..."
        />
        <button onClick={addItem}>Add Task</button>
        <ul>
          {items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}