import "./chatList.css";

import { useAdd } from "../../../context/AddContext.js";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase.js";
import { useContext, useEffect, useState } from "react";
import { userContext } from "../../../App.js";
import AddUser from "../addUser/addUser.jsx";
import { useChat } from "../../../context/chatContext.js";

export const ChatList = () => {
  const { AddMode, setAddMode } = useAdd();
  const [chats, setChats] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const { user } = useContext(userContext);
  const { dispatch } = useChat();

  useEffect(() => {
    if (user && user.id) {
      const unSub = onSnapshot(doc(db, "userchats", user.id), async (res) => {
        const items = res.data().chats;

        const promises = items.map(async (item) => {
          const userDocRef = doc(db, "users", item.receiverId);
          const userDocSnap = await getDoc(userDocRef);
          const User = userDocSnap.data();
          return { ...item, User };
        });

        console.log("promise ", promises);

        const chatData = await Promise.all(promises);
        setChats(chatData.sort((a, b) => b.updatedAt - a.updatedAt));
      });
      return () => {
        unSub();
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id]);

  const handleChatClick = async (chat) => {
    const { chatId, User } = chat;
    dispatch({ type: "CHANGE_CHAT", payload: { id: chatId, User } });
    const userchats = chats.map((item) => {
      const { user, ...rest } = item;
      return rest;
    });

    const chatIndex = userchats.findIndex(
      (item) => item.chatId === chat.chatId
    );

    userchats[chatIndex].isSeen = true;

    const userCharRef = doc(db, "userchats", user.id);

    try {
      await updateDoc(userCharRef, {
        chats: userchats,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const filteredChats = chats.filter((c) => {
    const search = searchInput?.toLowerCase() || "";
    return c.User.username.toLowerCase().includes(search);
  });

  return (
    <div className="chatList">
      <div className="search">
        <div className="searchBar">
          <img src="/assets/search.png" alt="" />
          <input
            type="text"
            placeholder="search"
            onChange={(e) => {
              setSearchInput(e.target.value);
            }}
          />
        </div>
        <img
          src={AddMode ? "/assets/minus.png" : "/assets/plus.png"}
          alt=""
          className="add"
          onClick={() => {
            setAddMode((prev) => !prev);
          }}
        />
      </div>

      <div className="items">
        {filteredChats ? (
          filteredChats.map((chat) => (
            <div
              className="item"
              key={chat.chatId}
              onClick={() => {
                handleChatClick(chat);
              }}
              style={{
                backgroundImage: !chat.isSeen
                  ? "linear-gradient(to bottom, rgba(255,0,0,0), #59b8eb)"
                  : "",
              }}
            >
              <img src={chat.User.avatar || "/assets/avatar.png"} alt="" />
              <div className="texts">
                <span>
                  {" "}
                  {chat.User.blocked.includes(user.id)
                    ? "User"
                    : chat.User.username}
                </span>
                <p>
                  {" "}
                  {chat.User.blocked.includes(user.id)
                    ? "Your Are Blocked"
                    : chat.lastMessage}
                </p>
              </div>
            </div>
          ))
        ) : (
          <>loading chatsList</>
        )}
      </div>
      {AddMode && <AddUser />}
    </div>
  );
};
