'use client';

import { SocketContext } from '@/lib/socket/socket';
import { supabaseAuth, fetchContacts, fetchUsername } from '../lib/client-actions';
import { v4 as uuid } from 'uuid';

import { useState, useEffect, useContext, useRef } from "react";
import styles from "./page.module.css";

import { useDispatch, useSelector } from "react-redux";
import { loadAccountData } from '@/lib/redux/slices/accountSlice';
import { 
  addMessage, 
  clearMessageLog, 
  insertNewMessage, 
  loadContacts, 
  loadFriendRequests, 
  setChattingWith, 
  setMessageLog 
} from '@/lib/redux/slices/homeSlice';
import { 
  setIsAuthorized, 
  setMessage, 
  setSession, 
  setUser 
} from "@/lib/redux/slices/authSlice";

import MessageCard from '../components/message-card';
import ContactCard from '../components/contact-card';
import ImageIcon from '@/app/(icons)/image_icon.svg';
import CloseWindowIcon from '@/app/(icons)/close_window_icon.svg';

export default function Home() {
  const socket = useContext(SocketContext);

  //Refs
  const fileInputRef = useRef(null);
  const pendingMessageRef = useRef(null);
  const threadRef = useRef(null);
  
  //Redux
  const dispatch = useDispatch();

  const isAuthorized = useSelector(state => state.auth.isAuthorized);
  const user = useSelector(state => state.auth.user);
  const session = useSelector(state => state.auth.session);

  const chattingWith = useSelector(state => state.home.chattingWith);
  const contacts = useSelector(state => state.home.contacts);
  const currentConversationID = useSelector(state => state.home.currentConversationID);
  const messageLog = useSelector(state => state.home.messageLog);

  //States
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [mediaPath, setMediaPath] = useState('');
  const [preview, setPreview] = useState('');

  //Functions
  const sendMessage = (e) => {
    e.preventDefault();
    if(newMessage) {
      const id = uuid();
      const message = {
        id,
        conversationID: currentConversationID,
        senderID: session?.user?.id,
        content: newMessage,
        timestamp: new Date().toISOString(),
        mediaPath
      }
      dispatch(insertNewMessage(message));
      socket.emit('send_message', message);
      setNewMessage('');
      setPreview('');
      setMediaPath('');
    }
  }

  const uploadImage = (e) => {
    const file = e.target.files[0];
    if(file?.type === 'image/jpeg' || 
       file?.type === 'image/png' ||
       file?.type === 'image/webp') {
      setMediaPath(file);
      setPreview(URL.createObjectURL(file));
    }
  }

  const scrollMessageThreadToBottom = () => {
    if(!threadRef.current) return;    
    console.log(threadRef.current.scrollHeight)
    threadRef.current.scrollTo({top: threadRef.current.scrollHeight, behavior: 'auto'});
  }

  const displayImage = async() => {
    // if(threadRef.current.scrollTop <= (threadRef.current.scrollHeight - 20)) {
    //   setMediaPath('val');
    //   setTimeout(scrollMessageThreadToBottom, 100);
    // } else {
    //   setMediaPath('val');
    // }
    await setMediaPath('val');
    setTimeout(() => {
      threadRef.current.scrollTo({top: threadRef.current.scrollHeight, behavior: 'smooth'})
    }, 0);
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
          //Fetch Contacts
          dispatch(loadContacts(session.user.id));
          //Fetch friend requests
          dispatch(loadFriendRequests(session.user.id));
          //Fetch account data
          dispatch(loadAccountData(session.user.id));
          dispatch(setIsAuthorized(true));
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

  //Scroll Message Log to Bottom on Mount(handles refreshes)
  useEffect(() => {
    scrollMessageThreadToBottom();
  }, []);

  //Clear Chatting With On Logout
  useEffect(() => {
    if(!user) {
      dispatch(setChattingWith(''));
      dispatch(clearMessageLog());
    }
  }, [user]);

  //Dynamically resize pending message text area
  useEffect(() => {
    if(!pendingMessageRef.current) return;

    pendingMessageRef.current.style.height = 'auto';
    pendingMessageRef.current.style.height = `${pendingMessageRef.current.scrollHeight}px`;
  }, [newMessage]);

  useEffect(() => {
  if (messageLog.length > 0) {
      scrollMessageThreadToBottom();
    }
  }, [messageLog]);

  return (
    <div className={styles.page}>
      {isAuthorized ? 
        <main className={styles['authorized-main']}>
          <div className={styles['contacts-section']}>
            <h2 onClick={scrollMessageThreadToBottom}>Contacts</h2>
            <ul className={styles['contact-list']}>
              {contacts.map(contact => (
                <li key={contact.id}>
                  <ContactCard 
                    username={contact.username} 
                    lastMessage={contact['last_message'] || 'Send them a message!'}
                    conversationID={contact.conversationID} 
                    scrollMessageThreadToBottom={scrollMessageThreadToBottom}
                  />
                </li>
              ))}
            </ul>
          </div>
          <div className={styles['messaging-section']}>
            {chattingWith ? (
              <>
                <div className={styles['messaging-section-contact-banner']}>
                  <h2>{chattingWith}</h2>
                </div>
                <div className={styles['messaging-section-texts-section']} ref={threadRef}>
                  <ul className={`
                    ${styles['message-thread']}
                    ${preview ? styles['image-view'] : ''}
                  `}>
                    {messageLog.map(message =>(
                      <li key={message.id}>
                        <MessageCard 
                          messageObj={message}
                          senderID={message['sender_id']} 
                          content={message.content} 
                          id={message.id} 
                          timestamp={message['created_at']}
                          ref={threadRef}
                          mediaPath={message['media_path']}
                        />
                      </li>
                    ))}
                  </ul>
                  <div className={styles['message-buffer']}></div>
                </div>
                <form className={styles['messaging-section-text-bar']} onSubmit={sendMessage}>
                  <div className={styles['content-section']}>
                    <div 
                      className={`
                        ${styles['image-section']} 
                        ${preview ? styles['visible'] : ''}
                      `}>
                      <div 
                        className={`
                        ${styles['image-container']} 
                        ${preview ? styles['visible'] : ''}
                      `}>
                        <div className={styles['close-window-icon']} onClick={() => setPreview('')}>
                          <CloseWindowIcon className={styles['close-window-icon-image']} />
                        </div>
                        <img src={preview || null} alt='uploaded-image' />
                      </div>
                    </div>
                    <textarea
                      type="text"
                      name="pending-message"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      ref={pendingMessageRef}
                      rows={1}
                      placeholder="Type Message..."
                      className={preview ? styles['image-view'] : ''}
                    />
                  </div>
                  <div 
                    className={styles['image-icon-wrapper']} 
                    onClick={() => fileInputRef.current.click()}
                  >
                    <input type='file' ref={fileInputRef} onChange={(e) => uploadImage(e)}/>
                    <ImageIcon className={[styles['image-icon']]} />
                  </div>
                  <button type="submit">Send</button>
                </form>
              </>
            )
            :
            <div className={styles['welcome-text']}>
              <h2>Welcome to msgME!</h2>
              <p>Add friends or click on a friend to start messaging!</p>
            </div>
          }
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
