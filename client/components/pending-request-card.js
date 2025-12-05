import styles from './pending-request-card.module.css';

import DefaultPFP from '@/app/(icons)/default_pfp.svg';
import AcceptIcon from '@/app/(icons)/checkmark_icon.svg';
import RejectIcon from '@/app/(icons)/close_window_icon.svg';

export default function PendingRequestCard() {
    return(
        <div className={styles.body}>
            <div className={styles['user-info']}>
                <div className={styles['pfp-container']}>
                    <DefaultPFP className={styles.pfp} />
                </div>
                <p>ITZYSTAN123</p>
            </div>
            <ul className={styles['option-icons-list']}>
                <li>
                    <AcceptIcon className={styles['accept-icon']} />
                </li>
                <li>
                    <RejectIcon className={styles['reject-icon']} />
                </li>
            </ul>
        </div>
    )
}