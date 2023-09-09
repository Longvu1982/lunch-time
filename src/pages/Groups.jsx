import { addDoc, collection, getDoc, serverTimestamp } from "firebase/firestore";
import React, { useState } from "react";
import { db } from "../firebase";
import SelectSearch from "react-select-search";
import "react-select-search/style.css";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { twMerge } from "tailwind-merge";

const options = [
    { name: "Swedish", value: "sv" },
    { name: "English", value: "en" },
    {
        type: "group",
        name: "Group name",
        items: [{ name: "Spanish", value: "es" }],
    },
];

const Groups = () => {
    const [groupName, setGroupName] = useState("");
    const usersRef = collection(db, "users");
    const [users, loading, error, snapshot] = useCollectionData(usersRef);
    const [selectedUser, setSelectedUser] = useState([]);
    const [search, setSearch] = useState("");
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

    const getUsers = () => {};

    const generateCodeFromTimestamp = () => {
        const unixTimestamp = Date.now();

        const groupCode = unixTimestamp.toString();

        return groupCode;
    };

    return (
        <div className="flex gap-3">
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
                            <SelectSearch
                                renderValue={(valueProps) => {
                                    return (
                                        <input
                                            {...valueProps}
                                            value={search}
                                            className="w-full p-2 border-[1px] bg-transparent rounded-md"
                                            onChange={(e) => setSearch(e.target.value)}
                                        />
                                    );
                                }}
                                isDropdownOpen
                                closeOnSelect
                                renderOption={(domProps, option, snapshot, className) => {
                                    return (
                                        <div
                                            onClick={() => {
                                                setSelectedUser((prev) => {
                                                    const setFromUsers = new Set(prev);
                                                    setFromUsers.add(option.email);
                                                    console.log("set", setFromUsers);
                                                    console.log(Array.from(setFromUsers))
                                                    return Array.from(setFromUsers);
                                                });
                                                setSearch(option.name);
                                            }}
                                            key={option.uid}
                                            className="flex items-center gap-2 py-3 px-2 overflow-x-hidden overflow-y-visible text-ellipsis cursor-pointer hover:opacity-60"
                                        >
                                            <div className="relative shrink-0">
                                                <img src={option.photoUrl} className="w-8 rounded-full shrink-0" alt="" />
                                                <div
                                                    className={twMerge(
                                                        "absolute -right-1 -bottom-1 rounded-full w-3 h-3",
                                                        option.status === "online" ? "bg-accent" : "bg-gray-300"
                                                    )}
                                                ></div>
                                            </div>
                                            <div className="w-full">
                                                <p className="overflow-hidden w-full text-xs font-semibold">{option.displayName}</p>
                                                <p className="text-xs opacity-75">{option.email}</p>
                                            </div>
                                        </div>
                                    );
                                }}
                                debounce={500}
                                search
                                options={users?.map((user) => ({ ...user, name: user.email, value: user.uid }))?.filter((item) => item.email.includes(search))}
                                onSe
                                name="language"
                                placeholder="Tìm kiếm"
                            />
                        </div>
                    </div>
                    <div className="flex items-center justify-center">
                        <button className="text-white bg-accent py-1 px-2 text-sm rounded-md" onClick={createGroup}>
                            Tạo nhóm
                        </button>
                    </div>
                </div>
            </div>
            <div name="" id="" className="shadow-lg flex flex-wrap w-[550px] p-3 content-start gap-3">
                {selectedUser.map((user) => (
                    <span key={user}>{user}</span>
                ))}
            </div>
        </div>
    );
};

export default Groups;
