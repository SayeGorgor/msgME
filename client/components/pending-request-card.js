import { useDispatch, useSelector } from 'react-redux';
import styles from './pending-request-card.module.css';

import DefaultPFP from '@/app/(icons)/default_pfp.svg';
import AcceptIcon from '@/app/(icons)/checkmark_icon.svg';
import RejectIcon from '@/app/(icons)/close_window_icon.svg';
import { decideOnRequest } from '@/lib/redux/slices/homeSlice';

export default function PendingRequestCard({ requestID, senderID, username }) {
    //Redux
    const dispatch = useDispatch();
    const session = useSelector(state => state.auth.session);

    //Functions
    const handleRequestDecision = (decision) => {
        const decisionInfo = {
            decision,
            requestID,
            senderID,
            receiverID: session.user.id
        }

        dispatch(decideOnRequest(decisionInfo));
    }
    return(
        <div className={styles.body}>
            <div className={styles['user-info']}>
                <div className={styles['pfp-container']}>
                    <DefaultPFP className={styles.pfp} />
                </div>
                <p>{username}</p>
            </div>
            <ul className={styles['option-icons-list']}>
                <li>
                    <AcceptIcon 
                        className={styles['accept-icon']}
                        onClick={() => handleRequestDecision('accept')} 
                    />
                </li>
                <li>
                    <RejectIcon 
                        className={styles['reject-icon']}
                        onClick={() => handleRequestDecision('reject')}
                     />
                </li>
            </ul>
        </div>
    )
}