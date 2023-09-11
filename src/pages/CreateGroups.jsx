import { addDoc, arrayUnion, collection, doc, getDoc, getDocs, query, serverTimestamp, updateDoc, where, writeBatch } from "firebase/firestore";
import React, { useState } from "react";
import { auth, db } from "../firebase";
import SelectSearch from "react-select-search";
import "react-select-search/style.css";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { AiFillCloseCircle } from "react-icons/ai";
import { TbArrowsJoin2 } from "react-icons/tb";
import { BiCopy, BiGroup } from "react-icons/bi";
import { twMerge } from "tailwind-merge";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";
import Modal from "react-modal";
import { useAuthState } from "react-firebase-hooks/auth";
import { getRandomHexColor } from "../utils";

const options = [
    { name: "Swedish", value: "sv" },
    { name: "English", value: "en" },
    {
        type: "group",
        name: "Group name",
        items: [{ name: "Spanish", value: "es" }],
    },
];

const customStyles = {
    content: {
        top: "50%",
        left: "50%",
        height: "150px",
        transform: "translate(-50%, -50%)",
        padding: 0,
        border: 0,
        boxShadow: "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px",
    },
};

const CreateGroup = () => {
    const [groupName, setGroupName] = useState("");
    const [groupCode, setGroupCode] = useState("");
    const [isOpen, setOpen] = useState(false);
    const [successCode, setSuccessCode] = useState("1165040606456");
    const usersRef = collection(db, "users");
    const [users, _loading, _error, _snapshot] = useCollectionData(usersRef);
    const [selectedUser, setSelectedUser] = useState([]);
    const [search, setSearch] = useState("");
    const [user] = useAuthState(auth);

    const navigate = useNavigate();

    console.log(user, users);

    const checkGroupNameExists = async (groupName) => {
        try {
            const groupsCollectionRef = collection(db, "groups");
            const q = query(groupsCollectionRef, where("groupName", "==", groupName));
            const querySnapshot = await getDocs(q);
            return querySnapshot.size > 0;
        } catch (error) {
            console.error("Error checking group name:", error);
        }
    };

    const createGroup = async () => {
        try {
            const usersToSave = [user, ...users.filter((item) => selectedUser.includes(item.email))].map((newUser) => ({
                uid: newUser.uid,
                photoURL: newUser.photoURL,
                displayName: newUser.displayName,
                email: newUser.email,
            }));

            const isExist = await checkGroupNameExists(groupName);
            if (isExist) {
                toast.error("Tên nhóm đã tồn tại!");
                return;
            }
            const code = generateCodeFromTimestamp();
            const groupRef = await addDoc(collection(db, "groups"), {
                groupName: groupName,
                createdAt: serverTimestamp(), // Firestore server timestamp
                code: code,
                bgColor: getRandomHexColor(70),
                users: usersToSave,
            });

            const groupId = groupRef.id;
            const batch = writeBatch(db);

            const usersToUpdate = structuredClone(users)
                .filter((item) => selectedUser.includes(item.email))
                .map((user) => user.uid);

            [user.uid, ...usersToUpdate].forEach((userId) => {
                const userRef = doc(db, "users", userId);
                batch.update(userRef, { groupIds: arrayUnion(groupId) });
            });

            await batch.commit();
            toast.success("Tạo nhóm thành công!");
            setOpen(true);
            setSuccessCode(code);
        } catch (error) {
            toast.error("Có lỗi xảy ra!");
            console.error("Error creating group:", error);
        }
    };

    const joinGroup = async () => {
        const groupsCollectionRef = collection(db, "groups");
        const q = query(groupsCollectionRef, where("code", "==", groupCode.trim()));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const groupDoc = querySnapshot.docs[0];
            const groupId = groupDoc.id;
            const userDocRef = doc(db, "users", user.uid);
            const userDocSnapshot = await getDoc(userDocRef);
            const userGroupIds = userDocSnapshot.data().groupIds;
            if (userGroupIds.includes(groupId)) {
                toast.warning("Bạn đã ở trong nhóm này!");
            } else {
                await updateDoc(userDocRef, { groupIds: arrayUnion(groupId) });
                const groupDocRef = doc(db, "groups", groupId);
                await updateDoc(groupDocRef, {
                    users: arrayUnion({ uid: user.uid, photoURL: user.photoURL, displayName: user.displayName, email: user.email }),
                });
                toast.success("Tham gia nhóm thành công!");
            }
        } else {
            toast.error("Không tìm thấy nhóm!");
        }
    };

    const generateCodeFromTimestamp = () => {
        const unixTimestamp = Date.now();

        const groupCode = unixTimestamp.toString();

        return groupCode;
    };

    return (
        <>
            <Modal
                isOpen={isOpen}
                // className="h-fit"
                style={customStyles}
                onRequestClose={() => setOpen(false)}
                contentLabel="Copy mã sau để mời bạn bè"
            >
                <div>
                    <header className="p-2 px-3 text-sm bg-accent text-white font-semibold flex items-center justify-between">
                        <span>Copy mã để chia sẻ</span>
                        <BiCopy
                            className="text-white hover:opacity-75 cursor-pointer"
                            onClick={() => {
                                toast.success("Đã copy!");
                                navigator.clipboard.writeText(successCode);
                            }}
                        />
                    </header>
                    <p className="text-3xl font-semibold text-center text-[#333] mt-6">{successCode}</p>
                </div>
            </Modal>
            <div className="flex items-center justify-between mb-6">
                <h2 className="font-semibold text-lg">Tạo hoặc tham gia nhóm</h2>
                <div>
                    <button
                        className={twMerge("text-white bg-accent py-1 px-2 text-sm rounded-md hover:opacity-75 flex items-center gap-1")}
                        onClick={() => navigate("/")}
                    >
                        <BiGroup color="white" className="text-white" />
                        <span>Nhóm của bạn</span>
                    </button>
                </div>
            </div>
            <div className="flex gap-3 flex-wrap">
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
                                                className="w-full p-2 border-[1px] bg-transparent rounded-md text-black"
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
                                                        return Array.from(setFromUsers);
                                                    });
                                                    setSearch(option.name);
                                                }}
                                                key={option.uid}
                                                className="flex items-center gap-2 py-3 px-2 overflow-x-hidden overflow-y-visible text-ellipsis cursor-pointer hover:opacity-60 bg-[#aaa] border-0"
                                            >
                                                <div className="relative shrink-0">
                                                    <img src={option.photoURL} className="w-8 rounded-full shrink-0" alt="" />
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
                                    options={users
                                        ?.map((user) => ({
                                            ...user,
                                            name: user.email,
                                            value: user.uid,
                                        }))
                                        ?.filter((item) => {
                                            return item.email.includes(search) && item.uid !== user.uid;
                                        })}
                                    onSe
                                    name="language"
                                    placeholder="Tìm kiếm"
                                />
                            </div>
                        </div>
                        <div className="flex items-center justify-center">
                            <button
                                disabled={!groupName}
                                className={twMerge(
                                    "text-white bg-accent py-1 px-2 text-sm rounded-md hover:opacity-75",
                                    !groupName && "opacity-20 hover:opacity-20"
                                )}
                                onClick={createGroup}
                            >
                                Tạo nhóm
                            </button>
                        </div>
                    </div>
                </div>
                <div
                    className={twMerge(
                        "shadow-lg flex flex-wrap w-[550px] p-3 content-start gap-3 min-h-[300px]",
                        !selectedUser || (selectedUser.length === 0 && "hidden")
                    )}
                >
                    {selectedUser.map((user) => (
                        <div key={user} className="flex items-center gap-2 bg-gray-300 px-2 py-1 rounded-lg">
                            <AiFillCloseCircle
                                onClick={() => {
                                    setSelectedUser((prev) => {
                                        const clone = structuredClone(prev);
                                        const userIndex = clone.findIndex((item) => item === user);
                                        if (userIndex > -1) {
                                            clone.splice(userIndex, userIndex + 1);
                                            return clone;
                                        }
                                    });
                                }}
                                className="text-[#555] hover:opacity-75 cursor-pointer"
                            />
                            <span>{user}</span>
                        </div>
                    ))}
                </div>
                <div className="w-[250px] h-[300px] shadow-lg rounded-md p-4 flex flex-col hover:shadow-xl transition-all bg-[#fafafa]">
                    <h1 className="text-center font-semibold mb-3">Tham gia nhóm</h1>
                    <div className="w-20 h-20 rounded-md bg-accent flex items-center justify-center bg-opacity-70 mx-auto mb-2">
                        <TbArrowsJoin2 size={50} className="text-white font-bold" />
                    </div>
                    <div>
                        <label htmlFor="" className="text-sm mb-2 inline-block">
                            Nhập mã nhóm
                        </label>
                        <input
                            type="text"
                            className="border-[1px] rounded-md w-full p-2 bg-transparent"
                            value={groupCode}
                            onChange={(e) => setGroupCode(e.target.value)}
                        />
                    </div>
                    <div className="flex items-end justify-center flex-1">
                        <button
                            disabled={!groupCode}
                            className={twMerge(
                                "text-white bg-accent py-1 px-2 text-sm rounded-md hover:opacity-75",
                                !groupCode && "opacity-20 hover:opacity-20"
                            )}
                            onClick={joinGroup}
                        >
                            Tham gia Nhóm
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CreateGroup;
