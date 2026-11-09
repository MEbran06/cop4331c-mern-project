import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function DashboardPage() {
  const navigate = useNavigate();
  // pulling role
  const [userRole, setUserRole] = useState(localStorage.getItem('role') || 'student');
  // temp events0
  const [events, setEvents] = useState([
    { id: 1, title: 'Hackathon', date: '22 OCT', club: 'Computer Science Club' },
    { id: 2, title: 'Fall Movie Knight', date: '24 OCT', club: 'Film Society' }
  ]);

  const handleLogout = () => {
    // clear the temp data
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/');
  };

  return (
    <div style={styles.container}>
      
      {}
      <div style={styles.header}>
        <div style={styles.badge}>WHAT'S HAPPENING</div>
        <button onClick={handleLogout} className="brutalist-button" style={styles.logoutBtn}>
          LOG OUT
        </button>
      </div>

      {/* club only visibility */}
      {userRole === 'club' && (
        <div style={styles.adminPanel}>
          <h2 style={styles.adminTitle}>CLUB MANAGEMENT</h2>
          <p style={{ margin: '0 0 1rem 0' }}>You have permission to create and manage events.</p>
          <button className="brutalist-button" style={{ backgroundColor:'#FFFFFF',color:'#000000' }}>
            + CREATE NEW EVENT
          </button>
        </div>
      )}

      {}
      <div style={styles.grid}>
        {events.map((event) => (
          <div key={event.id} style={styles.card}>
            <div style={styles.cardHeaderYellow}>
              UPCOMING EVENT
            </div>
            
            <div style={styles.cardBody}>
              <div style={styles.dateBlock}>
                <span style={styles.dateNumber}>{event.date.split(' ')[0]}</span>
                <span style={styles.dateMonth}>{event.date.split(' ')[1]}</span>
              </div>
              
              <div style={styles.eventInfo}>
                <h3 style={styles.cardTitle}>{event.title}</h3>
                <p style={styles.cardSubtitle}>Hosted by: {event.club}</p>
              </div>
            </div>
            
            <div style={{ padding: '0 1rem 1rem 1rem' }}>
              <button className="brutalist-button" style={{ width: '100%' }}>
                VIEW & COMMENT →
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}

const styles = {
  container: {
    backgroundColor:'#D1D1D1',
    minHeight:'100vh',
    fontFamily:'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    padding:'2rem 1rem',
    display:'flex',
    flexDirection:'column',
    alignItems:'center',
    boxSizing:'border-box'
  },
  header: {
    width:'100%',
    maxWidth:'600px',
    display:'flex',
    justifyContent:'space-between',
    alignItems:'flex-start',
    marginBottom:'2rem',
  },
  badge: {
    backgroundColor:'#FFCC00',
    color:'#000000',
    fontWeight:'900',
    fontSize:'1.5rem',
    padding:'0.5rem 1rem',
    border:'3px solid #000000',
    boxShadow:'4px 4px 0px #000000',
    textTransform:'uppercase',
  },
  logoutBtn: {
    padding:'0.5rem 1rem',
    fontSize:'0.85rem',
    marginTop:'0',
    backgroundColor:'#000000',
    backgroundColor:'#FFFFFF',
  },
  adminPanel: {
    width:'100%',
    maxWidth:'600px',
    backgroundColor:'#000000',
    color:'#FFCC00',
    padding:'1.5rem',
    border:'3px solid #000000',
    boxShadow:'6px 6px 0px #FFCC00',
    marginBottom:'2rem',
    boxSizing:'border-box',
  },
  adminTitle: {
    margin:'0 0 0.5rem 0',
    fontSize:'1.2rem',
    fontWeight:'900',
    letterSpacing:'1px',
  },
  grid: {
    width:'100%',
    maxWidth:'600px',
    display:'flex',
    flexDirection:'column',
    gap:'1.5rem',
  },
  card: {
    backgroundColor:'#FFFFFF',
    border:'3px solid #000000',
    boxShadow:'6px 6px 0px #000000',
    display:'flex',
    flexDirection:'column',
  },
  cardHeaderYellow: {
    backgroundColor:'#FFCC00',
    borderBottom:'3px solid #000000',
    padding:'0.5rem 1rem',
    fontWeight:'900',
    fontSize:'0.85rem',
    letterSpacing:'1px',
    color:'#000000'
  },
  cardBody: {
    padding:'1rem',
    display:'flex',
    gap:'1rem',
    alignItems:'center',
  },
  dateBlock: {
    display:'flex',
    flexDirection:'column',
    alignItems:'center',
    justifyContent:'center',
    borderRight:'3px solid #000',
    paddingRight:'1rem',
    minWidth:'50px',
    color:'#000000'
  },
  dateNumber: {
    fontSize:'2rem',
    fontWeight:'900',
    lineHeight:'1',
  },
  dateMonth: {
    fontSize:'0.85rem',
    fontWeight:'bold',
  },
  eventInfo: {
    display:'flex',
    flexDirection:'column',
    gap:'0.25rem',
    color:'#000000'
  },
  cardTitle: {
    margin:0,
    fontSize:'1.2rem',
    fontWeight:'900',
    textTransform:'uppercase',
  },
  cardSubtitle: {
    margin:0,
    fontSize:'0.9rem',
  }
};