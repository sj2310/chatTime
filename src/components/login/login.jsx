import { useContext, useState } from "react";
import "./login.css";
import { toast } from "react-toastify";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth, db } from "../../lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import upload from "../../lib/upload";
import { userContext } from "../../App";

export const Login = () => {
  const { setUser } = useContext(userContext);
  const [avatar, setAvatar] = useState({ file: null, url: "" });
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: "",
  });

  const handleAvatar = (e) => {
    if (e.target.files[0]) {
      setAvatar({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { email, password } = formData;
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userDoc.data();

      setUser({
        id: user.uid,
        email: user.email,
        name: userData.username,
        photoUrl: userData.avatar,
      });
      toast.success("Login successful");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { username, email, password } = formData;

    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      const user = res.user;
      toast.success("User registered successfully");

      const imgUrl = await upload(avatar.file);

      const userData = {
        username,
        email,
        avatar: imgUrl,
        id: user.uid,
        blocked: [],
      };

      await setDoc(doc(db, "users", user.uid), userData);
      await setDoc(doc(db, "userchats", user.uid), { chats: [] });

      setUser(userData);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login">
      <div className="item">
        <h2>Login to ChatTime</h2>
        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Email"
            name="email"
            onChange={handleInputChange}
            defaultValue="sample@gmail.com"
          />
          <input
            type="password"
            placeholder="Password"
            // defaultValue="sample"
            name="password"
            onChange={handleInputChange}
          />
          <button type="submit" disabled={loading}>
            Sign In
          </button>
        </form>
        <div className="sample" style={{fontSize:"0.8rem"}}>
          <p>Username - sample@gmail.com</p>
          <p>password - sample</p>
        </div>
      </div>
      <div className="separator"></div>
      <div className="item">
        <h2>New to ChatTime</h2>
        <form onSubmit={handleRegister}>
          <label htmlFor="file">
            <img src={avatar.url || "/assets/avatar.png"} alt="" />
            <span>Upload an image</span>
          </label>
          <input
            type="file"
            id="file"
            style={{ display: "none" }}
            onChange={handleAvatar}
          />
          <input
            type="text"
            placeholder="Name"
            name="username"
            onChange={handleInputChange}
          />
          <input
            type="text"
            placeholder="Email"
            name="email"
            onChange={handleInputChange}
          />
          <input
            type="password"
            placeholder="Password"
            name="password"
            onChange={handleInputChange}
          />
          <button type="submit" disabled={loading}>
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
};
