import { useContext, useEffect, useRef, useState } from "react";
import "./chat.css";
import Emoji from "emoji-picker-react";
import { useAdd } from "../../context/AddContext.js";
import {
  doc,
  onSnapshot,
  updateDoc,
  arrayUnion,
  getDoc,
} from "firebase/firestore";
import { db } from "../../lib/firebase.js";
import { useChat } from "../../context/chatContext.js";
import { userContext } from "../../App.js";
import upload from "../../lib/upload.js";

export const Chat = () => {
  const [chat, setChat] = useState(null);
  const endRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState("");
  const { AddMode } = useAdd();
  const { chatUser, msgId, receiverBlocked ,userBlocked} = useChat();
  const { user } = useContext(userContext);
  const [img, setImg] = useState({ file: null, url: "" });

  useEffect(() => {
    endRef.current?.scrollIntoView();
  }, [img]);

  useEffect(() => {
    if (msgId) {
      const unSub = onSnapshot(doc(db, "chats", msgId), (res) => {
        setChat(res.data());
      });
      return () => {
        unSub();
      };
    }
  }, [msgId]);

  const handleEmojiClick = (e) => {
    setMsg((prev) => prev + e.emoji);
    setOpen(!open);
  };

  const handleChange = (e) => {
    setMsg(e.target.value);
  };

  const handleImg = (e) => {
    if (e.target.files[0]) {
      setImg({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
      console.log("setImg", img.url);
    }
  };

  const handleSend = async () => {
    if (!msg.trim() && !img.file) return;

    let imgUrl = null;

    try {
      if (img.file) {
        imgUrl = await upload(img.file);
      }
      const message = {
        text: msg,
        createdAt: Date.now(),
        sendId: user.id,
        ...(imgUrl && { img: imgUrl }),
      };

      await updateDoc(doc(db, "chats", msgId), {
        messages: arrayUnion(message),
      });

      setMsg("");
      const userIds = [user.id, chatUser.id];

      userIds.forEach(async (id) => {
        const userChatRef = doc(db, "userchats", id);
        const userChatsSnapshot = await getDoc(userChatRef);

        if (userChatsSnapshot.exists()) {
          const UserChatData = userChatsSnapshot.data();

          const chatIndex = UserChatData.chats.findIndex(
            (c) => c.chatId === msgId
          );

          if (chatIndex !== -1) {
            UserChatData.chats[chatIndex].lastMessage = msg;
            UserChatData.chats[chatIndex].isSeen =
              id === user.id ? true : false;
            UserChatData.chats[chatIndex].updatedAt = Date.now();

            await updateDoc(userChatRef, {
              chats: UserChatData.chats,
            });
          }
        }
      });
    } catch (error) {
      console.error("Error sending message: ", error);
    }
    setImg({
      file: null,
      url: "",
    });

    setMsg("");
  };

  if (!chatUser) {
    return <div className="chat" style={{ borderRight: "none" }}>
    <div className="blocked" style={{ margin : "auto" , color:"red",fontSize:"2rem"}}>

      {userBlocked && " You are blocked"}
    </div>
    </div>;
  }

  return (
    <div className="chat">
      <div className="top">
        <div className="user">
          <img src={chatUser?.avatar || "/assets/girl.jpg"} alt="" />
          <div className="texts">
            <span>{chatUser?.username}</span>
            <p>A Beautiful Lady of My Dreams</p>
          </div>
        </div>
        <div className="icon">
          <img src="assets/phone.png" alt="" />
          <img src="assets/video.png" alt="" />
          <img src="assets/info.png" alt="" />
        </div>
      </div>
      <div className={`center ${AddMode ? "change" : ""}`}>
        {chat?.messages?.map((msg, index) => (
          <>
            {msg.img && (
              <img
                src={msg.img || img.url}
                alt=""
                className={msg.sendId === user?.id ? "own" : ""}
                width={40}
                height={200}
              />
            )}
            {msg.text && (
              <div
                className={msg.sendId === user?.id ? "msg own" : "msg"}
                key={index}
              >
                <div>
                  <p>{msg.text}</p>
                </div>
              </div>
            )}
          </>
        ))}
        <div ref={endRef}></div>
      </div>
      <div className="bottom" >
        <div className="icon">
          <label htmlFor="uploadImg">
            <img src={img.url || "assets/img.png"} alt="" />
          </label>
          <input
            type="file"
            id="uploadImg"
            style={{ display: "none" }}
            onChange={handleImg}
          />
          <img src="assets/camera.png" alt="" />
          <img src="assets/mic.png" alt="" />
        </div>
        <input
          type="text"
          placeholder="Type a Message"
          value={msg}
          onChange={handleChange}
          disabled={receiverBlocked || userBlocked}
        />
        <div className="emoji-container">
          <img
            className="emoji"
            src="assets/emoji.png"
            alt=""
            onClick={() => {
              setOpen(!open);
            }}
          />
          {open && (
            <div className="picker">
              <Emoji
                onEmojiClick={handleEmojiClick}
                pickerStyle={{ width: "350px", height: "400px" }}
              />
            </div>
          )}
        </div>
        <button
          className="send"
          onClick={handleSend}
          disabled={receiverBlocked || userBlocked}
        >
          Send
        </button>
      </div>
    </div>
  );
};
