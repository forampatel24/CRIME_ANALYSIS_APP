import { useState } from 'react';
import { User, Phone, Plus, Save } from 'lucide-react';

export default function ProfilePage() {
  const [contacts, setContacts] = useState([
    { name: 'Mom', phone: '+1 555-0100' },
    { name: 'Brother', phone: '+1 555-0101' }
  ]);
  const [newContact, setNewContact] = useState({ name: '', phone: '' });
  
  // Profile State
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: 'Jane Doe',
    email: 'jane@example.com',
    phone: '+1 555-9999'
  });

  const handleAddContact = (e) => {
    e.preventDefault();
    if (newContact.name && newContact.phone) {
      setContacts([...contacts, newContact]);
      setNewContact({ name: '', phone: '' });
      window.triggerAlert("Emergency Contact Added");
    }
  };

  const handleProfileSave = (e) => {
    e.preventDefault();
    setIsEditing(false);
    window.triggerAlert("Profile Updated Successfully");
  };

  return (
    <div className="dashboard-grid">
      <div className="glass-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
          <h3 style={{ margin: 0 }}>
            <User size={20} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '8px' }} />
            User Profile
          </h3>
          {!isEditing && (
            <button className="btn btn-primary" onClick={() => setIsEditing(true)} style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
              Edit Profile
            </button>
          )}
        </div>
        
        {isEditing ? (
          <form onSubmit={handleProfileSave}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input type="text" className="form-input" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input type="email" className="form-input" value={profile.email} onChange={e => setProfile({...profile, email: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input type="tel" className="form-input" value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} />
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
              <button type="submit" className="btn btn-primary">
                <Save size={18} /> Save Changes
              </button>
              <button type="button" className="btn" onClick={() => setIsEditing(false)} style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}>
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div>
            <div style={{ marginBottom: '1rem' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Full Name</span>
              <div style={{ fontSize: '1.1rem', fontWeight: '500' }}>{profile.name}</div>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Email Address</span>
              <div style={{ fontSize: '1.1rem', fontWeight: '500' }}>{profile.email}</div>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Phone Number</span>
              <div style={{ fontSize: '1.1rem', fontWeight: '500' }}>{profile.phone}</div>
            </div>
          </div>
        )}
      </div>

      <div className="glass-panel">
        <h3 style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
          <Phone size={20} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '8px' }} />
          Emergency Contacts
        </h3>
        
        <div style={{ marginBottom: '2rem' }}>
          {contacts.map((contact, idx) => (
            <div key={idx} style={{ 
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', marginBottom: '0.5rem'
            }}>
              <div>
                <div style={{ fontWeight: '600' }}>{contact.name}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{contact.phone}</div>
              </div>
              <button className="btn btn-danger" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => {
                setContacts(contacts.filter((_, i) => i !== idx));
                window.triggerAlert("Contact Removed");
              }}>Remove</button>
            </div>
          ))}
        </div>

        <form onSubmit={handleAddContact} style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem' }}>
          <h4 style={{ marginBottom: '1rem' }}>Add New Contact</h4>
          <div className="form-group">
            <input 
              type="text" className="form-input" placeholder="Contact Name" 
              value={newContact.name} onChange={e => setNewContact({...newContact, name: e.target.value})}
            />
          </div>
          <div className="form-group">
            <input 
              type="tel" className="form-input" placeholder="Phone Number" 
              value={newContact.phone} onChange={e => setNewContact({...newContact, phone: e.target.value})}
            />
          </div>
          <button type="submit" className="btn" style={{ background: 'var(--success)', color: 'white', width: '100%' }}>
            <Plus size={18} /> Add Contact
          </button>
        </form>
      </div>
    </div>
  );
}
