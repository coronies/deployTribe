
import React, { useState } from 'react';
import '../styles/PersonalAssistant.css';

const PersonalAssistant = () => {
    const [query, setQuery] = useState('');
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [openSourcesIndex, setOpenSourcesIndex] = useState(null);
    const [error, setError] = useState('');

    const handleQueryChange = (e) => {
        setQuery(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!query.trim()) return;
        if (query.trim().length < 3) {
            setError('Please enter at least 3 characters.');
            return;
        }

        const userMessage = { text: query, sender: 'user' };
        setMessages((prevMessages) => [...prevMessages, userMessage]);
        setLoading(true);

        try {
            const response = await fetch('http://127.0.0.1:8000/api/v1/assistant/query', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query_text: query }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            const assistantMessage = { text: data.answer_text, sender: 'assistant', sources: data.sources };
            setMessages((prevMessages) => [...prevMessages, assistantMessage]);
        } catch (error) {
            console.error('There was a problem with the fetch operation:', error);
            setError('Sorry, I am having trouble connecting to the server.');
            const errorMessage = { text: 'Sorry, I am having trouble connecting to the server.', sender: 'assistant' };
            setMessages((prevMessages) => [...prevMessages, errorMessage]);
        } finally {
            setLoading(false);
            setQuery('');
        }
    };

    const handleToggleSources = (index) => {
        setOpenSourcesIndex(openSourcesIndex === index ? null : index);
    };

    return (
        <div className="personal-assistant-container">
            <div className="chat-window">
                {messages.map((msg, index) => (
                    <div key={index} className={`message ${msg.sender}`}>
                        <p>{msg.text}</p>
                        {msg.sender === 'assistant' && msg.sources && msg.sources.length > 0 && (
                            <div className="sources-tab">
                                <button
                                    className="sources-toggle-btn"
                                    onClick={() => handleToggleSources(index)}
                                >
                                    {openSourcesIndex === index ? 'Hide Sources' : 'Show Sources'}
                                </button>
                                {openSourcesIndex === index && (
                                    <div className="sources-list">
                                        <strong>Sources:</strong>
                                        <ul>
                                            {msg.sources.map((source, i) => (
                                                <li key={i}>
                                                    <a href={source.source_url} target="_blank" rel="noopener noreferrer">
                                                        {source.source_url}
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
                {loading && <div className="message assistant">Thinking...</div>}
            </div>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleSubmit} className="chat-input-form">
                <input
                    type="text"
                    value={query}
                    onChange={handleQueryChange}
                    placeholder="Ask me anything about UT Austin..."
                    disabled={loading}
                />
                <button type="submit" disabled={loading}>Send</button>
            </form>
        </div>
    );
};

export default PersonalAssistant;
