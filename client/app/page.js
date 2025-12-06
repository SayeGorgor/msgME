'use client';

import { io } from 'socket.io-client';
import { supabaseAuth, fetchContacts, fetchUsername } from '../lib/client-actions';
import { v4 as uuid } from 'uuid';

import { useState, useEffect, useContext } from "react";
import styles from "./page.module.css";

import { useDispatch, useSelector } from "react-redux";
import { setIsAuthorized, setMessage, setSession, setUser } from "@/lib/redux/slices/authSlice";

import MessageCard from '../components/message-card';
import ContactCard from '../components/contact-card';
import { addMessage, clearMessageLog, insertNewMessage, loadFriendRequests, setChattingWith, setMessageLog } from '@/lib/redux/slices/homeSlice';
import { SocketContext } from '@/lib/socket/socket';

export default function Home() {
  const socket = useContext(SocketContext);
  
  //Redux
  const dispatch = useDispatch();

  const isAuthorized = useSelector(state => state.auth.isAuthorized);
  const user = useSelector(state => state.auth.user);
  const session = useSelector(state => state.auth.session);

  const chattingWith = useSelector(state => state.home.chattingWith);
  const currentConversationID = useSelector(state => state.home.currentConversationID);
  const messageLog = useSelector(state => state.home.messageLog);

  //States
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [userContacts, setUserContacts] = useState([]);

  //Functions
  const sendMessage = (e) => {
    e.preventDefault();
    const id = uuid();
    const message = {
      id,
      conversationID: currentConversationID,
      senderID: session?.user?.id,
      content: newMessage
    }
    dispatch(insertNewMessage(message));
    socket.emit('send_message', message);
    setNewMessage('');
  }

  //Effects
  //Grab session on load and auth change
  useEffect(() => {
    const { data:listener } = supabaseAuth.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth event:", event, session);

        dispatch(setSession(session));

        //Load user info if valid session
        if (session) {
          //Fetch username
          fetchUsername(session.user.email)
          .then(res => {
            if(res.success) dispatch(setUser(res.username));
          });
          //Fetch contacts
          fetchContacts(session.user.id)
          .then((res) => {
            if(res.success) {
              setUserContacts(res.contacts);
            }
            dispatch(setIsAuthorized(true));
          });
          //Fetch friend requests
          dispatch(loadFriendRequests(session.user.id));
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
    socket.on('received_message', (messageData) => {
      console.log('Socket Message: ', messageData);
      dispatch(addMessage(messageData));
    });

    return () => {
      socket.off();
    }
  }, []);

  //Load contacts
  useEffect(() => {
    const res = fetchContacts();
  }, []);

  //Clear Chatting With On Logout
  useEffect(() => {
    if(!user) {
      dispatch(setChattingWith(''));
      dispatch(clearMessageLog());
    }
  }, [user]);

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
                    conversationID={contact.conversationID} 
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
                {messageLog.map(message =>(
                  <li key={message.id}>
                    <MessageCard 
                      senderID={message['sender_id']} 
                      content={message.content} 
                      id={message.id} 
                    />
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
