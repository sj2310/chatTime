import "./addUser.css";
import {
  arrayUnion,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { useContext, useRef, useState } from "react";
import { userContext } from "../../../App";
import { db } from "../../../lib/firebase";


const AddUser = () => {
  const [searchUser, setSearchUser] = useState(null);
  const [userState, setUserState] = useState(false);
  const { user: currentUser } = useContext(userContext);
  const searchInputRef = useRef(null);
  
  
  const handleSearch = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const username = formData.get("username");

    try {
      const userRef = collection(db, "users");
      const q = query(userRef, where("username", "==", username));
      const querySnapShot = await getDocs(q);

      if (!querySnapShot.empty) {
        setSearchUser(querySnapShot.docs[0].data());
        setUserState(false);
        searchInputRef.current.value = "";
      } else {
        setSearchUser(null);
        setUserState(true);
      }
    } catch (err) {
      console.error("Error searching for user:", err);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    const chatRef = collection(db, "chats");
    const userChatsRef = collection(db, "userchats");
  
    try {
      const newChatRef = doc(chatRef); 
      await setDoc(newChatRef, {
        createdAt: serverTimestamp(),
        messages: [],
      });

      await updateDoc(doc(userChatsRef, searchUser.id), {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "",
          receiverId: currentUser.id,
          updatedAt: Date.now(),
        }),
      });

      await updateDoc(doc(userChatsRef, currentUser.id), {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "",
          receiverId: searchUser.id,
          updatedAt: Date.now(),
        }),
      });

      searchUser(null); // Clear the user state after addition
      setUserState(false);
    } catch (err) {
      console.error("Error adding user to chat:", err);
    }
  };


  return (
    <div className="addUser">
      <form onSubmit={handleSearch}>
        <div className="searchAddUser">
          <input type="text" placeholder="Search" name="username" required ref={searchInputRef}/>
          <button type="submit">Search</button>
        </div>
      </form>
      {searchUser && (
        <form onSubmit={handleAdd}>
          <div className="addPerson">
            <div className="temp">
              <img src={searchUser.avatar || "/assets/avatar.png"} alt={searchUser.username} />
              <span>{searchUser.username}</span>
            </div>
            <button type="submit">Add</button>
          </div>
        </form>
      )}
      {userState && <p>No user with this username</p>}
    </div>
  );
};

export default AddUser;
