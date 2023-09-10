import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { BiGroup } from "react-icons/bi";
import { useNavigate } from "react-router";
import { twMerge } from "tailwind-merge";
import { auth, db } from "../firebase";
import { doc, getDoc } from "@firebase/firestore";
import { getRandomHexColor } from "../utils";

const Groups = () => {
  const [userGroups, setUserGroups] = useState([]);
  const navigate = useNavigate();
  const [user] = useAuthState(auth);
  console.log(userGroups);

  useEffect(() => {
    const fetchUserGroups = async () => {
      try {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnapshot = await getDoc(userDocRef);

        if (userDocSnapshot.exists()) {
          const userGroupIds = userDocSnapshot.data().groupIds;

          const groups = [];

          for (const groupId of userGroupIds) {
            const groupDocRef = doc(db, "groups", groupId);
            const groupDocSnapshot = await getDoc(groupDocRef);

            if (groupDocSnapshot.exists()) {
              groups.push({ ...groupDocSnapshot.data(), id: groupId });
            }
          }

          setUserGroups(groups);
        }
      } catch (error) {
        console.error("Error fetching user groups:", error);
      }
    };

    fetchUserGroups();
  }, []);

  return (
    <>
      <div className="flex items-center justify-between  mb-6">
        <h2 className="font-semibold text-lg">Danh sách nhóm của bạn</h2>
        <div>
          <button
            className={twMerge(
              "text-white bg-accent py-1 px-2 text-sm rounded-md hover:opacity-75 flex items-center gap-1"
            )}
            onClick={() => navigate("/create-group")}
          >
            <BiGroup color="white" className="text-white" />
            <span>Tạo hoặc tham gia nhóm</span>
          </button>
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        {userGroups.map((group) => (
          <div
            key={group.groupName}
            className="w-[200px] h-[220px] shadow-lg bg-[#fafafa] transition-shadow rounded-md hover:shadow-xl active:border-2 active:border-[#888] p-6 cursor-pointer"
            onClick={() => navigate(`/group/${group.id}`)}
          >
            <div
              className="w-20 h-20 rounded-md bg-accent bg-opacity-75 flex items-center justify-center text-3xl font-bold text-white mx-auto mb-5"
              style={{ backgroundColor: getRandomHexColor(75) }}
            >
              {group.groupName?.[0]?.toUpperCase()}
            </div>
            <p className="text-center text-base font-semibold mb-3">
              {group.groupName}
            </p>
            <p className="text-center text-xs font-semibold opacity-50">
              Ngày tạo: {group.createdAt?.toDate()?.toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </>
  );
};

export default Groups;
