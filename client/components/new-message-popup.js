import { useSelector } from 'react-redux';
import styles from './new-message-popup.module.css';

export default function NewMessagePopUp() {
    const showNewMessagesPopUp = useSelector(state => state.home.showNewMessagesPopUp);
    return(
        <div className={`
            ${styles.body}
            ${showNewMessagesPopUp ? styles.visible : ''}
        `}>
            <p>New Message!</p>
        </div>
    )
}