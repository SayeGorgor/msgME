import styles from './message.module.css';

export default function Message({ fromUser, content }) {
    return(
        <div className={styles['message-wrapper']}>
            <div className={`
                ${styles.message} 
                ${fromUser ? styles['user-message'] : styles['contact-message']}
            `}>
                <p>{content}</p>
            </div>
        </div>
    );
}