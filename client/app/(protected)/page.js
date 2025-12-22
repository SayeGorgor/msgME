'use client';

import { SocketContext } from '@/lib/socket/socket';
import { supabaseAuth, fetchContacts, fetchUsername } from '@/lib/client-actions';
import { useRouter } from 'next/navigation';
import { v4 as uuid } from 'uuid';

import { useState, useEffect, useContext, useRef } from "react";
import styles from "./page.module.css";

import { useDispatch, useSelector } from "react-redux";
import { loadAccountData } from '@/lib/redux/slices/accountSlice';
import { loadFriendRequests } from '@/lib/redux/slices/friendRequestsSlice';
import { 
  addMessage, 
  clearHomeData, 
  clearMessageLog, 
  insertNewMessage, 
  loadContacts,  
  loadMessages, 
  setChattingWith, 
  setCurrentConversationID, 
  setMessageLog, 
  setShowNewMessagesPopUp
} from '@/lib/redux/slices/messagesSlice';
import { 
  logout,
  setIsAuthorized, 
  setMessage, 
  setSession, 
  setUser 
} from "@/lib/redux/slices/authSlice";

import MessageCard from '@/components/message-card';
import ContactCard from '@/components/contact-card';
import ContactsSection from '@/components/contacts-section';
import NewMessagePopUp from '@/components/new-message-popup';
import ImageIcon from '@/app/(icons)/image_icon.svg';
import CloseWindowIcon from '@/app/(icons)/close_window_icon.svg';
import ShowContactsIcon from '@/app/(icons)/back_arrow_icon.svg';
import { setShowLoginWindow } from '@/lib/redux/slices/headerSlice';

export default function Home() {
  const socket = useContext(SocketContext);
  const router = useRouter();

  //Refs
  const fileInputRef = useRef(null);
  const pendingMessageRef = useRef(null);
  const threadRef = useRef(null);
  const threadSentinelRef = useRef(null)
  
  //Redux
  const dispatch = useDispatch();

  const isAuthorized = useSelector(state => state.auth.isAuthorized);
  const user = useSelector(state => state.auth.user);
  const session = useSelector(state => state.auth.session);

  const chattingWith = useSelector(state => state.messages.chattingWith);
  const contacts = useSelector(state => state.messages.contacts);
  const currentConversationID = useSelector(state => state.messages.currentConversationID);
  const messageLog = useSelector(state => state.messages.messageLog);
  const isLoading = useSelector(state => state.messages.isLoading);
  const hasMoreMessages = useSelector(state => state.messages.hasMoreMessages);
  const oldestLoadedMessageDate = useSelector(state => state.messages.oldestLoadedMessageDate);

  //States
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [mediaPath, setMediaPath] = useState('');
  const [preview, setPreview] = useState('');
  const [initialMount, setInitialMount] = useState(true);

  //Functions
  const sendMessage = async(e) => {
    e.preventDefault();
    if(newMessage || mediaPath) {
      const id = uuid();
      const message = {
        id,
        conversationID: currentConversationID,
        senderID: session?.user?.id,
        content: newMessage,
        timestamp: new Date().toISOString(),
        mediaPath
      }
      await dispatch(insertNewMessage(message));
      socket.emit('send_message', message);
      scrollMessageThreadToBottom();
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

  const closeNewMessagePopUp = (e) => {
    e.stopPropagation();
    dispatch(setShowNewMessagesPopUp(false));
  }

  const closeOutConversation = () => {
    dispatch(setChattingWith(''));
    dispatch(setCurrentConversationID(''));
    dispatch(clearMessageLog());
  }

  //Effects
  //Grab session on load and auth change
  useEffect(() => {
    //Close login window on successful login
    dispatch(setShowLoginWindow(false));

    // const { data:listener } = supabaseAuth.auth.onAuthStateChange(
    //   (event, session) => {
    //     console.log("Auth event:", event, session);

    //     dispatch(setSession(session));

    //     //Load user info if valid session
    //     if (session) {
    //       //Fetch username
    //       fetchUsername(session.user.email)
    //       .then(res => {
    //         if(res.success) dispatch(setUser(res.username));
    //       });
    //       //Fetch Contacts
    //       dispatch(loadContacts(session.user.id));
    //       //Fetch friend requests
    //       dispatch(loadFriendRequests(session.user.id));
    //       //Fetch account data
    //       dispatch(loadAccountData(session.user.id));
    //       dispatch(setIsAuthorized(true));
    //     } else {
    //       router.push('/auth');
    //       router.refresh();
    //     }
    //   }
    // );

    // Load initial session on first render
    supabaseAuth.auth.getSession().then(({ data, error }) => {
      if(error) {
        dispatch(logout());
        dispatch(clearHomeData());
        router.push('/auth');
        router.refresh();
      }

      const session = data.session;
      dispatch(setSession(session));
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
    });

    // Cleanup listener
    // return () => listener.subscription.unsubscribe();
  }, []);

  //Update message log when new message is received
  useEffect(() => {
    const handler = (messageData) => {
      console.log('Socket Message: ', messageData);
      dispatch(addMessage(messageData));
    }

    socket.on('received_message', handler);

    return () => {
      socket.off('received_message', handler);
    }
  }, [dispatch]);

  //Scroll Message Log to Bottom on Mount(handles refreshes)
  useEffect(() => {
    scrollMessageThreadToBottom();
  }, []);

  //Scroll Message Log to Bottom on Message Received If Near Bottom,
  //Otherwise Show New Messages Pop Up
  useEffect(() => {
    //Do nothing on first mount
    if(initialMount) {
      setInitialMount(false);
      return;
    }

    const thread = threadRef.current;
    if(!thread) return;

    const distanceToBottom = 
      thread.scrollHeight - thread.scrollTop - thread.clientHeight;
    if(distanceToBottom < 400) {
      scrollMessageThreadToBottom();
    } else {
      dispatch(setShowNewMessagesPopUp(true));
    }
  }, [messageLog]);

  //Clear Chatting With On Logout
  useEffect(() => {
    if(!user) {
      dispatch(setChattingWith(''));
      dispatch(clearMessageLog());
    }
  }, [user]);

  //Scroll thread to bottom when new conversation is loaded
  useEffect(() => {
    if(!currentConversationID) return;
    
    scrollMessageThreadToBottom();
  }, [currentConversationID])

  //Dynamically resize pending message text area
  useEffect(() => {
    if(!pendingMessageRef.current) return;

    pendingMessageRef.current.style.height = 'auto';
    pendingMessageRef.current.style.height = `${pendingMessageRef.current.scrollHeight}px`;
  }, [newMessage]);

  //Load older messages when near top of message thread
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if(entry.isIntersecting) {
          console.log('Intersection Conditions Status: ', isLoading, hasMoreMessages);
        }
        if(entry.isIntersecting && !isLoading && hasMoreMessages) {
          console.log('Intersection Conditions Found');
          console.log('Current Conversation ID: ', currentConversationID);
          dispatch(loadMessages({
            conversationID: currentConversationID, 
            oldestMessageDate: oldestLoadedMessageDate
          }));
        }
      },
      {
        root: threadRef.current,
        rootMargin: '50px',
        threshold: 0
      }
    )

    if(threadSentinelRef.current) {
      observer.observe(threadSentinelRef.current);
    }

    return () => observer.disconnect();
  }, [hasMoreMessages, isLoading, currentConversationID]);

  return (
    <div className={styles.page}>
      <main className={styles['authorized-main']}>
          <div className={styles['contacts-section-larger-view-wrapper']}>
            <ContactsSection scrollMessageThreadToBottom={scrollMessageThreadToBottom} />
          </div>
          <div className={styles['messaging-section']}>
            {chattingWith ? (
              <>
                <div className={styles['messaging-section-contact-banner']}>
                  <button 
                    className={`
                      ${styles['show-contacts-button']}
                      ${styles['mobile-view']}
                    `}
                    onClick={closeOutConversation}
                  >
                    <ShowContactsIcon className={styles['show-contacts-icon']}/>
                  </button>
                  <h2>{chattingWith}</h2>
                </div>
                <div 
                  className={styles['messaging-section-texts-section']} 
                  onScroll={closeNewMessagePopUp}
                  ref={threadRef}
                >
                  <div ref={threadSentinelRef}></div>
                  <ul className={`
                    ${styles['message-thread']}
                    ${preview ? styles['image-view'] : ''}
                  `}>
                    {messageLog.slice().reverse().map(message =>(
                      <li key={message.id}>
                        <MessageCard 
                          messageObj={message}
                          senderID={message['sender_id']} 
                          content={message.content} 
                          id={message.id} 
                          timestamp={message['created_at'] || message.timestamp}
                          mediaPath={message['media_path']}
                        />
                      </li>
                    ))}
                  </ul>
                  <div className={styles['message-buffer']}></div>
                </div>
                <form 
                  className={styles['messaging-section-text-bar']} 
                  onSubmit={sendMessage}
                >
                  <NewMessagePopUp />
                  <div className={styles['content-section']}>
                    <div 
                      className={`
                        ${styles['image-section']} 
                        ${preview ? styles['visible'] : ''}
                      `}
                    >
                      <div 
                        className={`
                          ${styles['image-container']} 
                          ${preview ? styles['visible'] : ''}
                        `}
                      >
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
                      className={`
                        ${styles['content-input']}
                        ${preview ? styles['image-view'] : ''}
                        ${styles['mobile-view']}
                      `}
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
            contacts ? (
              <>
                <div className={styles['contacts-section-smaller-view-wrapper']}>
                  <ContactsSection />
                </div>
                <div className={`
                  ${styles['welcome-text']}
                  ${styles['welcome-text-larger-view-wrapper']}
                `}>
                  <h2>Welcome to msgME!</h2>
                  <p>Add friends or click on a friend to start messaging!</p>
                </div>
              </>
            ) : (
              <div className={styles['welcome-text']}>
                <h2>Welcome to msgME!</h2>
                <p>Add friends or click on a friend to start messaging!</p>
              </div>
            )
          }
          </div>
        </main>
    </div>
  );
}
