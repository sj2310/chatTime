import "./App.css";
import { Details } from "./components/details/details.jsx";
import { Chat } from "./components/chat/chat.jsx";
import { List } from "./components/list/list.jsx";
import { Login } from "./components/login/login.jsx";
import Notification from "./components/notification/notification.jsx";
import { AddProvider } from "./context/AddContext.js";
import { createContext, useEffect, useState, useCallback, memo } from "react";
import { auth, db } from "./lib/firebase.js";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { ChatProvider } from "./context/chatContext.js";
const MList = memo(List);
const MChat = memo(Chat);
const MDetails = memo(Details);
export const userContext = createContext();

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = useCallback(async (userId) => {
    console.log("fetch");
    try {
      const userRef = doc(db, "users", userId);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        setUser((prevUser) => ({
          ...prevUser,
          name: userDoc.data().username,
          photoUrl: userDoc.data().avatar,
        }));
      } else {
        console.log("No such document!");
      }
    } catch (err) {
      console.log(err);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser({ id: currentUser.uid });
        fetchUserData(currentUser.uid).then(() => setLoading(false));
      } else {
        setUser(null);
        setLoading(false);
      }
    });
    return () => {
      unsubscribe();
    };
  }, [fetchUserData]);

  if (loading) return <div className="loader"></div>;

  return (
    <userContext.Provider value={{ user, setUser, fetchUserData }}>
      <div className="App">
        {user ? (
          <>
            <ChatProvider>
            <AddProvider>
            <MList />
            <MChat />
            </AddProvider>
            <MDetails />
            </ChatProvider>
          </>
        ) : (
          <Login />
        )}
        <Notification />
      </div>
    </userContext.Provider>
  );
}

export default App;
