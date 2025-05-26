import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

function VirtualEvent({ event, onJoin, onLeave }) {
  const [isJoined, setIsJoined] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const { currentUser } = useAuth();

  useEffect(() => {
    // Subscribe to event participants and chat messages
    // This would typically use WebSocket or Firebase Realtime Database
  }, [event.id]);

  const handleJoin = () => {
    setIsJoined(true);
    onJoin(event.id);
  };

  const handleLeave = () => {
    setIsJoined(false);
    onLeave(event.id);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    // Add message to chat
    const message = {
      text: newMessage,
      userId: currentUser.uid,
      userName: currentUser.displayName,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  return (
    <div className="virtual-event">
      <div className="event-header">
        <h2>{event.title}</h2>
        <div className="event-controls">
          {!isJoined ? (
            <button onClick={handleJoin} className="join-button">
              Join Event
            </button>
          ) : (
            <button onClick={handleLeave} className="leave-button">
              Leave Event
            </button>
          )}
        </div>
      </div>

      {isJoined && (
        <div className="event-content">
          <div className="video-container">
            {/* Video component would go here */}
            <iframe
              title="event-stream"
              src={event.streamUrl}
              allow="camera; microphone"
              style={{ width: '100%', height: '400px' }}
            />
          </div>

          <div className="interaction-panel">
            <div className="participants-list">
              <h3>Participants ({participants.length})</h3>
              <ul>
                {participants.map(participant => (
                  <li key={participant.id}>
                    {participant.name}
                    {participant.isPresenting && ' (Presenting)'}
                  </li>
                ))}
              </ul>
            </div>

            <div className="chat-panel">
              <div className="chat-messages">
                {messages.map((message, index) => (
                  <div 
                    key={index} 
                    className={`message ${message.userId === currentUser.uid ? 'own-message' : ''}`}
                  >
                    <strong>{message.userName}:</strong>
                    <p>{message.text}</p>
                    <small>{new Date(message.timestamp).toLocaleTimeString()}</small>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendMessage} className="chat-input">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                />
                <button type="submit">Send</button>
              </form>
            </div>

            <div className="event-polls">
              <h3>Polls & Q&A</h3>
              {/* Poll and Q&A components would go here */}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .virtual-event {
          background: white;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .event-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .event-content {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 20px;
        }

        .interaction-panel {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .chat-messages {
          height: 300px;
          overflow-y: auto;
          padding: 10px;
          border: 1px solid #eee;
          border-radius: 4px;
        }

        .message {
          margin-bottom: 10px;
          padding: 8px;
          border-radius: 4px;
          background: #f5f5f5;
        }

        .own-message {
          background: #e3f2fd;
          margin-left: 20px;
        }

        .chat-input {
          display: flex;
          gap: 10px;
          margin-top: 10px;
        }

        .chat-input input {
          flex: 1;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }

        button {
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        .join-button {
          background: #4caf50;
          color: white;
        }

        .leave-button {
          background: #f44336;
          color: white;
        }
      `}</style>
    </div>
  );
}

export default VirtualEvent; 