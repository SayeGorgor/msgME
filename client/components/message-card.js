import styles from './message-card.module.css';
import { useSelector } from 'react-redux';

export default function MessageCard({ id, senderID, content }) {
    const session = useSelector(state => state.auth.session);
    const fromUser = session.user.id === senderID;

    const wtf = () => {
        console.log("Content: ", content);
        console.log("Session ID: ", session.user.id);
        console.log('Sender ID: ', senderID);
        console.log('From User: ', fromUser);
    }

    return(
        <div className={styles['message-wrapper']} onClick={wtf}>
            <div className={`
                ${styles.message} 
                ${fromUser ? styles['user-message'] : styles['contact-message']}
            `}>
                <p>{content}</p>
            </div>
        </div>
    );
}