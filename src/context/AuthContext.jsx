import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { listAvatar } from "../utils/data";

const AuthContext = createContext();

export function AuthContextProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function signUp(email, password, name) {
    const avatar = listAvatar[Math.floor(Math.random() * listAvatar.length)];
    const newUser = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(newUser.user, { displayName: name, photoURL: avatar });
    setUser({ ...newUser.user, displayName: name, photoURL: avatar });
    return newUser;
  }

  async function signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    if (!listAvatar.includes(result.user.photoURL)) {
      const avatar = listAvatar[Math.floor(Math.random() * listAvatar.length)];
      await updateProfile(result.user, { photoURL: avatar });
      setUser({ ...result.user, photoURL: avatar });
    } else {
      setUser(result.user);
    }
    return result;
  }

  async function signIn(email, password) {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    setUser(userCredential.user);
    return userCredential;
  }

  async function updateUserProfile(profileData) {
    await updateProfile(auth.currentUser, profileData);
    setUser({ ...auth.currentUser });
  }

  function logOut() {
    return signOut(auth).then(() => setUser(null));
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => {
      unsubscribe();
    };
  });

  return (
    <AuthContext.Provider
      value={{
        signUp,
        signIn,
        logOut,
        signInWithGoogle,
        updateUserProfile,
        user,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function UserAuth() {
  return useContext(AuthContext);
}
