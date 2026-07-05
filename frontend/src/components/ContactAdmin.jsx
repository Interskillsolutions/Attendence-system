import React from 'react';
import { FaWhatsapp } from 'react-icons/fa'; // We need react-icons/fa but wait, we already have react-icons installed. Let's use FiMessageSquare or a generic icon if Fa is not imported easily, actually react-icons/fa is available.
// I'll use simple Fiicons to be safe.
import { FiMessageCircle } from 'react-icons/fi';

const ContactAdmin = () => {
  const adminName = "Yash Diwate";
  const adminPhone = "918799903365";
  const prefilledMessage = encodeURIComponent("Hi Yash, I have a doubt regarding attendance.");
  const whatsappUrl = `https://wa.me/${adminPhone}?text=${prefilledMessage}`;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <h1 className="page-title" style={{ alignSelf: 'flex-start', width: '100%' }}>Contact Admin</h1>
      
      <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', textAlign: 'center', padding: '40px' }}>
        <div style={{ 
          width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.2)', 
          color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', 
          fontSize: '40px', margin: '0 auto 24px' 
        }}>
          <FiMessageCircle />
        </div>
        
        <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '8px' }}>Need Help?</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '32px', lineHeight: '1.6' }}>
          If you have any doubts, need to request an attendance override, or are facing issues with the system, you can directly contact the admin, <strong>{adminName}</strong>, on WhatsApp.
        </p>
        
        <a 
          href={whatsappUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="btn btn-success"
          style={{ fontSize: '18px', padding: '12px 24px', width: '100%' }}
        >
          <FiMessageCircle style={{ marginRight: '8px' }} /> Chat on WhatsApp
        </a>
      </div>
    </div>
  );
};

export default ContactAdmin;
