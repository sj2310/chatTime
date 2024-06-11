import "./details.css";
import { auth, db } from "../../lib/firebase";
import { useChat } from "../../context/chatContext";
import { arrayRemove, arrayUnion, doc, updateDoc } from "firebase/firestore";
import { useContext } from "react";
import { userContext } from "../../App";

export const Details = () => {
  const { chatUser, dispatch, receiverBlocked } = useChat();
  const { user } = useContext(userContext);


  const handleBLock = async () => {
    if (!chatUser) return;

    const userRef = doc(db, "users", user.id);

    try {
      await updateDoc(userRef, {
        blocked: receiverBlocked
          ? arrayRemove(chatUser.id)
          : arrayUnion(chatUser.id),
      });
      await dispatch({ type: "CHANGE_BLOCK" });
    } catch (error) {
      console.log("Error in Blocking User", error);
    }
  };

  const handleLogout = () => {
    try {
      auth.signOut();
    } catch (err) {
      console.log(err);
    }
  };

  if (!chatUser) {
    return <div className="details">
    </div>;
  }

  return (
    <div className="details">
      <div className="friend-info">
        <img src="/assets/logo1.png" alt="" />
      </div>
      <div className="setting">
        <div className="option">
          <div className="title">
            <span>Chat Settings</span>
            <img src="/assets/arrowDown.png" alt="" />
          </div>
        </div>
        <div className="option">
          <div className="title">
            <span>Privacy & Help</span>
            <img src="/assets/arrowDown.png" alt="" />
          </div>
        </div>
        <div className="option">
          <div className="title">
            <span>Shared Photo</span>
            <img src="/assets/arrowUp.png" alt="" />
          </div>
          <div className="sharedImages">
            <div className="sharedImg">
              <div className="imgDetails">
                <img src="/assets/avatar.png" alt="" className="Image" />
                <span>photo-3wed</span>
              </div>
              <div>
                <img src="/assets/download.png" alt="" className="download" />
              </div>
            </div>
            <div className="sharedImg">
              <div className="imgDetails">
                <img src="/assets/bg-old.jpg" alt="" className="Image" />
                <span>photo-3wed</span>
              </div>
              <div>
                <img src="/assets/download.png" alt="" className="download" />
              </div>
            </div>
            <div className="sharedImg">
              <div className="imgDetails">
                <img src="/assets/girl.jpg" alt="" className="Image" />
                <span>photo-3wed</span>
              </div>
              <div>
                <img src="/assets/download.png" alt="" className="download" />
              </div>
            </div>
            <div className="sharedImg">
              <div className="imgDetails">
                <img src="/assets/avatar.png" alt="" className="Image" />
                <span>photo-3wed</span>
              </div>
              <div>
                <img src="/assets/download.png" alt="" className="download" />
              </div>
            </div>
          </div>
        </div>
        <div className="option">
          <div className="title">
            <span>Shared File</span>
            <img src="/assets/arrowDown.png" alt="" />
          </div>
        </div>
        <div className="buttons">
          <button className="blockUser" onClick={handleBLock}>
            <b>{ receiverBlocked
            ? "User blocked"
            : "Block User"}</b>
          </button>
          <button className="logOut" onClick={handleLogout}>
            <b>LOG OUT</b>
          </button>
        </div>
      </div>
    </div>
  );
};
