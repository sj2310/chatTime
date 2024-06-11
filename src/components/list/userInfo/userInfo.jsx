import { useContext } from "react";
import "./userInfo.css";
import { userContext } from "../../../App";

export const UserInfo = () => {
  const { user } = useContext(userContext);

  return (
    <div className="userInfo">
      {user && user.photoUrl && user.name ? (
        <>
          <div className="user">
            <img src={user.photoUrl} alt="User Avatar" />
            <h3>{user.name}</h3>
          </div>
          <div className="icon">
            <img src="/assets/more.png" alt="More Icon" />
            <img src="/assets/video.png" alt="Video Icon" />
            <img src="/assets/edit.png" alt="Edit Icon" />
          </div>
        </>
      ) : (
        <div>Loading user info...</div>
      )}
    </div>
  );
};
