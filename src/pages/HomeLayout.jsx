import React, { useRef, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { ImSpoonKnife } from "react-icons/im";
import { auth, db } from "../firebase";
import { IoIosLogOut } from "react-icons/io";
import { useClickOutside } from "../hooks/useClickOutside";
import { signOut } from "firebase/auth";
import {
  useCollection,
  useCollectionData,
} from "react-firebase-hooks/firestore";
import { Outlet, useNavigate } from "react-router-dom";
import { collection } from "firebase/firestore";
import { twMerge } from "tailwind-merge";

const HomeLayout = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentUser] = useAuthState(auth);
  const ref = useRef();
  const navigate = useNavigate();
  const usersRef = collection(db, "users");
  const [users, loading, error, snapshot] = useCollectionData(usersRef);
  console.log(users);
  useClickOutside(ref, () => setIsOpen(false));

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        // Sign-out successful.
        navigate("/sign-in");
      })
      .catch((error) => {
        // An error happened.
      });
  };

  return (
    <div className="h-screen flex">
      <nav className="w-[260px] h-full p-3 bg-gray-100 nav-shadow">
        <div className="flex gap-2 mb-6">
          <div className="flex items-center justify-center border-2 border-accent w-fit h-fit p-2">
            <ImSpoonKnife className="text-accent" size={16} />
          </div>
          <div className="flex flex-col text-left font-bold uppercase">
            <span className="text-[#ff4117] text-xs">Trưa nay</span>
            <span className="text-base text-[#f9bd0f] ">Ăn gì</span>
          </div>
        </div>
        <div className="bg-accent rounded-md p-2 px-3 text-sm text-white">
          Nhóm của bạn
        </div>
        <p className="pt-10 font-semibold mb-2 text-[#555]">Danh sách tài khoản</p>
        <div className="flex flex-col gap-4">
          {users?.filter(item => item.uid !== currentUser.uid)?.map((user) => (
            <div key={user.id} className="flex items-center gap-2">
              <div className="relative">
                <img src={user.photoUrl} className="w-8 rounded-full" alt="" />
                <div
                  className={twMerge(
                    "absolute -right-1 -bottom-1 rounded-full w-3 h-3",
                    user.status === "online" ? "bg-accent" : "bg-gray-300"
                  )}
                ></div>
              </div>
              <div className="w-full">
                <p className="overflow-hidden w-full text-xs font-semibold">
                  {user.displayName}
                </p>
                <p className="text-xs opacity-75">{user.email}</p>
              </div>
            </div>
          ))}
        </div>
      </nav>
      <div className="flex-1">
        <header className="flex justify-end h-14 items-center px-4 bg-gray-100">
          <div className="relative">
            <div
              onClick={() => {
                setIsOpen(!isOpen);
              }}
              className="w-8 h-8 rounded-full overflow-hidden cursor-pointer hover:opacity-75 transition-all"
            >
              <img src={currentUser?.photoURL} alt="" />
            </div>
            <div
              hidden={!isOpen}
              ref={ref}
              className="absolute right-0 -bottom-full translate-y-[90px] shadow-md rounded-md p-2"
            >
              <p className="text-sm font-semibold">{currentUser.displayName}</p>
              <p className="text-xs opacity-50 mb-4">{currentUser.email}</p>
              <div className="w-full h-[1px] bg-slate-100 mb-4" />
              <div
                onClick={handleLogout}
                className="flex items-center gap-1 cursor-pointer hover:opacity-75 transition-all"
              >
                <IoIosLogOut />
                <span className="text-xs">Đăng xuất</span>
              </div>
            </div>
          </div>
        </header>
        <div className="h-[calc(100vh-56px)] overflow-y-auto p-5 bg-gray-100 body-shadow">
            <Outlet />
        </div>
      </div>
    </div>
  );
};

export default HomeLayout;
