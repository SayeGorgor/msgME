import { useSelector } from 'react-redux';
import styles from './new-message-popup.module.css';

export default function NewMessagePopUp({ scrollMessageThreadToBottom }) {
    const showNewMessagesPopUp = useSelector(state => state.messages.showNewMessagesPopUp);
    return(
        <div 
            className={`
                ${styles.body}
                ${showNewMessagesPopUp ? styles.visible : ''}
            `}
            onClick={scrollMessageThreadToBottom}
        >
            <p>New Message!</p>
        </div>
    )
}