import React from "react";
import {
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import app, { auth, db } from "../firebase";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { ImSpoonKnife } from "react-icons/im";
import { AiFillStar } from "react-icons/ai";
import { FcGoogle } from "react-icons/fc";
import Images from "../assets/image";

const provider = new GoogleAuthProvider();

const otherDishes = [
  {
    dishName: "Cơm 76",
    stars: 4,
    price: "28",
    img: Images.com76,
  },
  {
    dishName: "Bún trộn",
    stars: 4,
    price: "35",
    img: Images.bunTron,
  },
  {
    dishName: "Guu Chicken",
    stars: 4,
    price: "40",
    img: Images.guuChicken,
  },
];

const SignIn = () => {
  //   const [user, setUser] = useState();
  const [user] = useAuthState(auth);
  const handleSignIn = async () => {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const userDocRef = doc(db, "users", user.uid);
    const userDocSnapshot = await getDoc(userDocRef);

    if (!userDocSnapshot.exists()) {
      // If the user document doesn't exist, create it
      await setDoc(userDocRef, {
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        status: "online",
        uid: user.uid,
        groupIds: []
        // Add any other user-related data here
      });
    }
  };

  return (
    <div className="container mx-auto p-12 min-h-screen flex flex-col gap-16">
      <header className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <ImSpoonKnife className="text-accent" size={35} />
          <div className="flex flex-col text-center font-bold uppercase">
            <span className="text-[#ff4117] text-xs">Trưa nay</span>
            <span className="text-2xl text-[#f9bd0f] ">Ăn gì</span>
          </div>
        </div>
        <div className="flex items-center gap-5">
          <p className="opacity-20 font-bold">@Copyright by Kris.Nguyen</p>
          <div
            onClick={handleSignIn}
            className="bg-accent py-3 px-5 text-white text-xs hover:opacity-75 cursor-pointer font-bold uppercase rounded-md"
          >
            Đăng nhập
          </div>
        </div>
      </header>
      <section className="flex items-start justify-center gap-20">
        <div className="mt-10">
          <p className="font-semibold mb-2">Chào mừng bạn đến với</p>
          <p className="font-bold text-[42px] -mb-14 uppercase text-[#ff4117] drop-shadow-md">
            Trưa nay
          </p>
          <p className="font-bold text-7xl uppercase text-[#f9bd0f] mb-12">
            Ăn gì đấy{" "}
            <span className="text-accent text-9xl drop-shadow-md">?</span>
          </p>
          <div
            onClick={handleSignIn}
            className="flex gap-3 items-center text-center justify-center py-2 px-4 text-accent font-bold border-accent border-2 rounded-md group hover:bg-accent transition-all cursor-pointer mb-24"
          >
            <FcGoogle
              size={25}
              className="group-hover:rotate-[360deg] transition-all"
            />
            <span className="transition-all font-semibold group-hover:text-white">
              Đăng nhập bằng Google
            </span>
          </div>
          <div className="flex gap-5">
            {otherDishes.map((dish) => (
              <div
                key={dish.dishName}
                className="relative shadow-lg rounded-lg w-32 p-3 group hover:shadow-[#0000003e] hover:scale-105 transition-all"
              >
                <div className="flex items-center justify-center absolute left-1/2 -translate-x-1/2 w-3/5 aspect-square bg-accent rounded-full z-20 -top-1/2 translate-y-1/2 transition-all group-hover:bg-opacity-50">
                  <img src={dish.img} alt="" className="w-4/5 group-hover:scale-[2] group-hover:-translate-y-4 transition-all" />
                </div>
                <p className="mt-12 font-semibold text-sm mb-1 transition-all">
                  {dish.dishName}
                </p>
                <div className="flex items-center gap-1 mb-2">
                  {Array(4)
                    .fill(null)
                    .map((_star, index) => (
                      <AiFillStar className="text-yellow-500" key={index} />
                    ))}
                  <AiFillStar className="text-yellow-500 opacity-30" />
                </div>
                <p className="font-semibold text-xs opacity-60">
                  <span>{dish.price}k</span>
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="w-[40%] flex justify-end">
          <img
            src={Images.homeDish}
            alt=""
            className="drop-shadow-lg hover:drop-shadow-2xl transition-all hover:rotate-45 duration-300"
          />
        </div>
      </section>
    </div>
  );
};

export default SignIn;
