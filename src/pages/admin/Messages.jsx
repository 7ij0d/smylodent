import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import supabase from '../../supabaseClient';
import { Inbox, CheckCircle, Trash2, Phone, Calendar } from 'lucide-react';

export const Messages = () => {
  const { t } = useLanguage();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false });
      if (data) setMessages(data);
    } catch (err) {
      console.error('Error fetching admin inbox messages', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (msgId, currentReadState) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ is_read: !currentReadState })
        .eq('id', msgId);
      
      if (!error) {
        setMessages((prev) =>
          prev.map((msg) => (msg.id === msgId ? { ...msg, is_read: !currentReadState } : msg))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteMessage = async (msgId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه الرسالة نهائياً؟ / Confirm delete message?')) return;
    try {
      const { error } = await supabase.from('messages').delete().eq('id', msgId);
      if (!error) {
        setMessages((prev) => prev.filter((item) => item.id !== msgId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="animate-fade-in">
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Inbox size={24} style={{ color: 'var(--secondary)' }} />
          الرسائل الواردة / Contact Inbox
        </h1>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="skeleton" style={{ height: '100px', width: '100%' }}></div>
          <div className="skeleton" style={{ height: '100px', width: '100%' }}></div>
        </div>
      ) : messages.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', backgroundColor: 'var(--surface-color)' }}>
          صندوق الوارد فارغ. لا توجد رسائل جديدة حالياً.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              className="card"
              style={{
                padding: '1.25rem',
                backgroundColor: 'var(--surface-color)',
                borderLeft: msg.is_read ? '1px solid var(--border-color)' : '4px solid var(--secondary)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                opacity: msg.is_read ? 0.8 : 1
              }}
            >
              {/* Header row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', borderBottom: '1px dashed var(--border-color)', paddingBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary)' }}>{msg.name}</h3>
                  <a
                    href={`https://wa.me/218${msg.phone.replace(/^0/, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline"
                    style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem', borderRadius: 'var(--radius-sm)', gap: '0.2rem' }}
                  >
                    <Phone size={12} style={{ color: 'var(--success)' }} />
                    واتساب: {msg.phone}
                  </a>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  <Calendar size={14} />
                  <span>{new Date(msg.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Message text content */}
              <p style={{ fontSize: '0.9rem', lineHeight: 1.6, whiteSpace: 'pre-line' }}>{msg.message}</p>

              {/* Action buttons footer */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem', marginTop: '0.25rem' }}>
                
                <button
                  onClick={() => handleMarkAsRead(msg.id, msg.is_read)}
                  className="btn btn-outline"
                  style={{
                    padding: '0.3rem 0.6rem',
                    fontSize: '0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    borderColor: msg.is_read ? 'var(--border-color)' : 'var(--secondary)',
                    color: msg.is_read ? 'var(--text-muted)' : 'var(--secondary)',
                    gap: '0.2rem'
                  }}
                >
                  <CheckCircle size={12} />
                  {msg.is_read ? 'تحديد كغير مقروء' : 'تحديد كمقروء'}
                </button>

                <button
                  onClick={() => handleDeleteMessage(msg.id)}
                  className="btn btn-outline"
                  style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', borderRadius: 'var(--radius-sm)', color: 'var(--danger)', gap: '0.2rem' }}
                >
                  <Trash2 size={12} />
                  {t('admin.delete')}
                </button>

              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default Messages;
