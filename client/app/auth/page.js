import styles from './page.module.css';

export default function AuthPage() {
    return(
        <div className={styles.page}>
            <main className={styles['unauthorized-main']}>
                <h2>Please Log In Or Sign Up To Begin Messaging!</h2>
            </main>
        </div>
    )
}