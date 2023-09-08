import React, { useState } from "react";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import app, { auth } from "../firebase";

const provider = new GoogleAuthProvider();

const SignIn = () => {
  //   const [user, setUser] = useState();
  const [user] = useAuthState(auth);
  const handleSignin = () => {
    signInWithPopup(auth, provider)
      .then((result) => {
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential.accessToken;
        const user = result.user;
        console.log(user);
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        const email = error.customData.email;
        const credential = GoogleAuthProvider.credentialFromError(error);
      });
  };

  console.log(auth.currentUser);
  return !user ? <div onClick={handleSignin}>SignIn</div> : <div>Logout</div>;
};

export default SignIn;
