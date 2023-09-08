import {
  addDoc,
  collection,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import React, { useState } from "react";
import { db } from "../firebase";

const Groups = () => {
  const [groupName, setGroupName] = useState("");
  const createGroup = async () => {
    try {
      // Add the group to Firestore with a server-generated timestamp
      const groupRef = await addDoc(collection(db, "groups"), {
        groupName: groupName,
        createdAt: serverTimestamp(), // Firestore server timestamp
        code: generateCodeFromTimestamp(),
      });

      const groupSnapshot = await getDoc(groupRef);
    } catch (error) {
      console.error("Error creating group:", error);
    }
  };

  const generateCodeFromTimestamp = () => {
    const unixTimestamp = Date.now();

    const groupCode = unixTimestamp.toString();

    return groupCode;
  };

  return (
    <div className="w-[250px] h-[300px] shadow-lg rounded-md p-4 flex flex-col hover:shadow-xl transition-all bg-[#fafafa]">
      <h1 className="text-center font-semibold mb-3">Tạo nhóm mới</h1>
      <div className="flex flex-col justify-between flex-1">
        <div>
          <div className="mb-4">
            <label htmlFor="" className="text-sm mb-2 inline-block">
              Nhập tên nhóm
            </label>
            <input
              type="text"
              className="border-[1px] rounded-md w-full p-2 bg-transparent"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="" className="text-sm mb-2 inline-block">
              Chọn người dùng
            </label>
          </div>
        </div>
        <div className="flex items-center justify-center">
          <button
            className="text-white bg-accent py-1 px-2 text-sm rounded-md"
            onClick={createGroup}
          >
            Tạo nhóm
          </button>
        </div>
      </div>
    </div>
  );
};

export default Groups;
