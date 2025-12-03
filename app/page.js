'use client';

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import styles from "./page.module.css";
import DefaultPFP from './(icons)/default_pfp.svg';
import { fetchSession } from "@/lib/actions";
import { setIsAuthorized, setMessage } from "@/lib/redux/slices/authSlice";
import { setShowAccountOptionsWindow } from "@/lib/redux/slices/headerSlice";

export default function Home() {
  //Redux
  const dispatch = useDispatch();
  const isAuthorized = useSelector(state => state.auth.isAuthorized);

  //States
  const [message, setMessage] = useState('');
  const [session, setSession] = useState('');

  //Effects
  useEffect(() => {
    const getSession = async() => {
      const session = await fetchSession();
      if(session) dispatch(setIsAuthorized(true));
    }

    getSession();
  }, [])

  return (
    <div className={styles.page}>
      {isAuthorized ? 
        <main className={styles['authorized-main']}>
          <div className={styles['contacts-section']}>
            <h2>Contacts</h2>
            <ul className={styles['contact-list']}>
              <li>
                <div className={styles['contact-card']}>
                  <div className={styles['pfp-container']}>
                    <DefaultPFP className={styles.pfp} />
                  </div>
                  <div className={styles['contact-info']}>
                    <h3>ITZYSTAN123</h3>
                    <p>I love itzy!</p>
                  </div>
                </div>
              </li>
              <li>
                <div className={styles['contact-card']}>
                  <div className={styles['pfp-container']}>
                    <DefaultPFP className={styles.pfp} />
                  </div>
                  <div className={styles['contact-info']}>
                    <h3>TAYLORSWIFTSTAN1234</h3>
                    <p>T-Swizzle the goat!</p>
                  </div>
                </div>
              </li>
              <li>
                <div className={styles['contact-card']}>
                  <div className={styles['pfp-container']}>
                    <DefaultPFP className={styles.pfp} />
                  </div>
                  <div className={styles['contact-info']}>
                    <h3>PTVSTAN67</h3>
                    <p>PTV is the single best band to ever exist</p>
                  </div>
                </div>
              </li>
            </ul>
          </div>
          <div className={styles['messaging-section']}>
            <div className={styles['messaging-section-contact-banner']}>
              <h2>ITZYSTAN123</h2>
            </div>
            <div className={styles['messaging-section-texts-section']}>
              <ul className={styles['message-thread']}>
                <li>
                  <div className={styles['message-wrapper']}>
                    <div className={`${styles.message} ${styles['user-message']}`}>
                      <p>This is my message</p>
                    </div>
                  </div>
                </li>
                <li>
                  <div className={styles['message-wrapper']}>
                    <div className={`${styles.message} ${styles['contact-message']}`}>
                      <p>This is my contact's message</p>
                    </div>
                  </div>
                </li>
                <li>
                  <div className={styles['message-wrapper']}>
                    <div className={`${styles.message} ${styles['contact-message']}`}>
                      <p>This is my contact's message as well</p>
                    </div>
                  </div>
                </li>
                <li>
                  <div className={styles['message-wrapper']}>
                    <div className={`${styles.message} ${styles['user-message']}`}>
                      <p>This is my message again</p>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
            <form className={styles['messaging-section-text-bar']}>
              <input
                type="text"
                name="pending-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type Message..."
              />
              <button type="submit">Send</button>
            </form>
          </div>
        </main>
        :
        <main className={styles['unauthorized-main']}>
          <h2>Please Log In Or Sign Up To Begin Messaging!</h2>
        </main>
      }
    </div>
  );
}
