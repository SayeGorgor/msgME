'use client';

import { io } from 'socket.io-client';
import { supabaseAuth } from '../lib/client-actions';
import { v4 as uuid } from 'uuid';
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import styles from "./page.module.css";
import DefaultPFP from './(icons)/default_pfp.svg';
import { setIsAuthorized, setMessage } from "@/lib/redux/slices/authSlice";
import { setShowAccountOptionsWindow } from "@/lib/redux/slices/headerSlice";
import Message from '../components/message';
import ContactCard from '../components/contact-card';
import { fetchContacts } from '../lib/client-actions';

export default function Home() {
  const socket = io('http://localhost:8080');
  
  //Redux
  const dispatch = useDispatch();
  const isAuthorized = useSelector(state => state.auth.isAuthorized);
  const chattingWith = useSelector(state => state.home.chattingWith);

  //States
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [userContacts, setUserContacts] = useState([]);
  const [session, setSession] = useState('');

  //Functions
  const sendMessage = (e) => {
    e.preventDefault();
    socket.emit('send_message', newMessage);
    setMessages([...messages, {fromUser: true, content: newMessage, id: uuid()}]);
    setNewMessage('');
  }

  //Effects
  //Grab session on load and auth change
  useEffect(() => {
    const { data: listener } = supabaseAuth.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth event:", event, session);

        setSession(session);

        //Load contacts
        if (session) {
          fetchContacts()
          .then((res) => {
            console.log('Res: ', res);
            if(res.success) {
              setUserContacts(res.contacts);
            }
            dispatch(setIsAuthorized(true));
          });
        } else {
          dispatch(setIsAuthorized(false));
        }
      }
    );

    // Load initial session on first render
    supabaseAuth.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session) dispatch(setIsAuthorized(true));
    });

    // Cleanup listener
    return () => listener.subscription.unsubscribe();
  }, []);

  //Update message log when new message is received
  useEffect(() => {
    socket.on('received_message', (msg) => {
      console.log('Socket Message: ', msg);
      setMessages([...messages, {fromUser: false, id: uuid(), content: msg}]);
    });

    return () => socket.off();
  }, []);

  //Load contacts
  useEffect(() => {
    const res = fetchContacts();
    if(res.success) {
      console.log()
    }
  }, []);

  return (
    <div className={styles.page}>
      {isAuthorized ? 
        <main className={styles['authorized-main']}>
          <div className={styles['contacts-section']}>
            <h2>Contacts</h2>
            <ul className={styles['contact-list']}>
              {userContacts.map(contact => (
                <li key={contact.id}>
                  <ContactCard 
                    username={contact.username} 
                    latestMessage={'This is our lastest message'} 
                  />
                </li>
              ))}
            </ul>
          </div>
          <div className={styles['messaging-section']}>
            <div className={styles['messaging-section-contact-banner']}>
              <h2>{chattingWith}</h2>
            </div>
            <div className={styles['messaging-section-texts-section']}>
              <ul className={styles['message-thread']}>
                {messages.map(message =>(
                  <li key={message.id}>
                    <Message fromUser={message.fromUser} content={message.content} />
                  </li>
                ))}
              </ul>
            </div>
            <form className={styles['messaging-section-text-bar']} onSubmit={sendMessage}>
              <input
                type="text"
                name="pending-message"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
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
