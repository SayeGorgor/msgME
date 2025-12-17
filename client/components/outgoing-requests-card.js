import styles from './outgoing-requests-card.module.css';
import DefaultPFP from '@/app/(icons)/default_pfp.svg';

export default function OutgoingRequestsCard({ username, pfpPath }) {
    return(
        <div className={styles.body}>
            <div className={styles['user-info']}>
                <div className={styles['pfp-container']}>
                    {pfpPath ? 
                        <img 
                            src={pfpPath} 
                            alt={`${username}'s Profile Picture`} 
                            className={styles.pfp}
                        />
                        :
                        <DefaultPFP className={styles.pfp} />
                    }
                </div>
                <p>{username}</p>
            </div>
        </div>
    )
}