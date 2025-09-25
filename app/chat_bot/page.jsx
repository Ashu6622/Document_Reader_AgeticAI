'use client';
import {useState, useRef, useEffect} from 'react';
import {useRouter} from 'next/navigation';
import styles from './chat.module.css';

function Page(){
    const [ques, setQues] = useState("");
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const chatAreaRef = useRef(null);
    const router = useRouter();

    useEffect(() => {
        if (chatAreaRef.current) {
            chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    async function handleAsk(){
        if (!ques.trim() || isLoading) return;
        
        const userMessage = { type: 'user', content: ques };
        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);
        setQues("");

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'content-type': 'application/json'
                },
                body: JSON.stringify(ques)
            });

            const result = await response.json();
            const botMessage = { type: 'bot', content: result.message };
            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            const errorMessage = { type: 'bot', content: 'Sorry, something went wrong.' };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleAsk();
        }
    };

    return(
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Chat Bot</h1>
            </div>
            
            <div className={styles.chatArea} ref={chatAreaRef}>
                {messages.map((message, index) => (
                    <div key={index} className={`${styles.message} ${message.type === 'user' ? styles.userMessage : styles.botMessage}`}>
                        <div className={`${styles.avatar} ${message.type === 'user' ? styles.userAvatar : styles.botAvatar}`}>
                            {message.type === 'user' ? 'U' : 'B'}
                        </div>
                        <div className={styles.messageContent}>
                            {message.content}
                        </div>
                    </div>
                ))}
                
                {isLoading && (
                    <div className={`${styles.message} ${styles.botMessage}`}>
                        <div className={`${styles.avatar} ${styles.botAvatar}`}>B</div>
                        <div className={styles.loading}>
                            <span>Thinking</span>
                            <div className={styles.loadingDots}>
                                <div className={styles.dot}></div>
                                <div className={styles.dot}></div>
                                <div className={styles.dot}></div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className={styles.inputArea}>
                <div className={styles.inputContainer}>
                    <textarea
                        className={styles.input}
                        value={ques}
                        onChange={(e) => setQues(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask about company policies..."
                        rows={1}
                    />
                    <button 
                        className={styles.sendButton}
                        onClick={handleAsk}
                        disabled={!ques.trim() || isLoading}
                    >
                        <svg className={styles.sendIcon} viewBox="0 0 24 24">
                            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                        </svg>
                    </button>
                </div>
            </div>
            <div className={styles.uploadButtonArea}>
                <button className={styles.uploadButton} onClick={()=> router.replace('/')}>Upload another document</button>
            </div>
        </div>
    )
}

export default Page;