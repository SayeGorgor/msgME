'use client';

import { useState } from 'react';
import { useSelector } from 'react-redux';
import styles from './message-card.module.css';

export default function MessageCard({ id, senderID, content, timestamp }) {
    const fullTimestamp = new Date(timestamp);
    const hours = fullTimestamp.getHours();
    const displayHours = hours % 12 === 0 ? '12' : hours % 12;
    const minutes = fullTimestamp.getMinutes();
    const timeOfDay = hours < 12 ? 'AM' : 'PM';
    //Redux
    const session = useSelector(state => state.auth.session);
    const fromUser = session.user.id === senderID;

    //Use State
    const [showTime, setShowTime] = useState(false);
    const [preventAnimation, setPreventAnimation] = useState(true);

    //Functions
    const displayTime = () => {
        setPreventAnimation(false);
        setShowTime(!showTime);
    }

    return(
        <div className={styles['message-wrapper']}>
            {!fromUser ? 
                (
                    <>
                        <p 
                            className={`
                                ${styles.timestamp} 
                                ${styles['contact-message']}
                                ${showTime ? styles['time-visible'] : ''}
                                ${preventAnimation ? styles['no-animation'] : ''}
                            `}
                        >
                            {`${displayHours}:${minutes} ${timeOfDay}`}
                        </p>
                        <div className={styles['message-body']} onClick={displayTime}>
                            <div className={`
                                ${styles.message} 
                                ${styles['contact-message']}
                                ${showTime ? styles['visible'] : styles['hidden']}
                                ${preventAnimation ? styles['no-animation'] : ''}
                            `}>
                                <p>{content}</p>
                            </div>
                        </div>
                    </>
                )
                :
                (
                    <>
                        <div className={`
                                ${styles['message-body']} 
                                ${fromUser ? styles['user-message'] : styles['contact-message']}
                            `}
                            onClick={displayTime}
                        >
                            <div className={`
                                ${styles.message} 
                                ${styles['user-message']}
                                ${showTime ? styles['visible'] : styles['hidden']}
                                ${preventAnimation ? styles['no-animation'] : ''}
                            `}>
                                <p>{content}</p>
                            </div>
                        </div>
                        <p
                            className={`
                                ${styles.timestamp} 
                                ${styles['user-message']}
                                ${showTime ? styles['time-visible'] : ''}
                                ${preventAnimation ? styles['no-animation'] : ''}
                            `}
                        >
                            {`${displayHours}:${minutes} ${timeOfDay}`}
                        </p>
                    </>
                )
            }
        </div>
    );
}