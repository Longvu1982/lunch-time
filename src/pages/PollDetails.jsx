import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { twMerge } from "tailwind-merge";
import SelectSearch from "react-select-search";
import Modal from "react-modal";
import { BiCopy } from "react-icons/bi";
import { bankList } from "../constants";
import { AiFillCloseCircle } from "react-icons/ai";
import { toast } from "react-toastify";

const PollOptionAfterVote = ({ width, text, loading, data, option }) => {
    const [currentWidth, setCurrentWidth] = useState(0);
    const users = data.users;

    useEffect(() => {
        setTimeout(() => {
            setCurrentWidth(width);
        }, 200);
    }, [width, text]);

    return (
        <div className="border-2 border-accent px-4 py-1 pb-2 rounded-md">
            <div className="flex items-center mb-2 justify-between">
                <div className="/flex items-center gap-2">
                    <span className="text-[#666] font-semibold text-base">{text}</span>
                    <div className="flex items-center">
                        {users
                            .filter((user) => option.selectedUsers.includes(user.uid))
                            .map((voted, index) => (
                                <img
                                    key={voted.uid}
                                    className="w-6 rounded-full border-[1px] border-white"
                                    style={{ marginLeft: -6 * index }}
                                    src={voted.photoURL}
                                />
                            ))}
                    </div>
                </div>
                <span>{`${Math.floor(currentWidth)}%`}</span>
            </div>
            <div key={text} className="bg-accent bg-opacity-20 h-2 rounded-md relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 bg-accent transition-all duration-[500ms]" style={{ width: `${currentWidth}%` }}></div>
            </div>
        </div>
    );
};

const PollOptionBeforeVote = ({ text, setSelectedOption }) => {
    return (
        <label htmlFor={text} className="border-accent border-2 rounded-md p-3 max-w-[300px] flex items-center gap-2 hover:opacity-75 cursor-pointer">
            <input id={text} type="radio" value={text} name="option" onChange={(e) => setSelectedOption(e.target.value)} />
            <span className="font-semibold text-base text-[#555]">{text}</span>
        </label>
    );
};

const customStyles = {
    content: {
        top: "50%",
        left: "50%",
        minHeight: "520px",
        transform: "translate(-50%, -50%)",
        padding: 0,
        border: 0,
        boxShadow: "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px",
    },
};

const PollDetails = () => {
    const [selectedOption, setSelectedOption] = useState("");
    const [newOption, setNewOption] = useState("");
    const [isOpen, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [searchUserToAdd, setSearchUserToAdd] = useState("");
    const [bankSearch, setBankSearch] = useState("");
    const [bankInfo, setBankInfo] = useState("");
    const [amount, setAmount] = useState("");
    const { groupId, pollId } = useParams();
    const [selectedUser, setSelectedUser] = useState("");
    const [selectedUserToAdd, setSelectedUserToAdd] = useState([]);
    const pollsCollectionRef = doc(db, "groups", groupId);
    const [data, loading, error, snapshot] = useDocumentData(pollsCollectionRef);
    console.log(selectedOption);
    const [user] = useAuthState(auth);

    const handleAddNewOption = async () => {
        if (!newOption.trim()) return;
        const groupRef = doc(db, "groups", groupId);
        try {
            const groupSnapshot = await getDoc(groupRef);
            if (groupSnapshot.exists()) {
                const groupData = groupSnapshot.data();
                const poll = groupData.polls?.find((poll) => poll.id.toString() === pollId);
                if (poll) {
                    const options = poll.options;
                    const newOptions = structuredClone(options);
                    newOptions.push({
                        optionText: newOption,
                        votes: 0,
                        selectedUsers: [],
                    });
                    const newPoll = { ...poll, options: newOptions };
                    const updatedPolls = groupData.polls.map((p) => (p.id.toString() === pollId ? newPoll : p));
                    await updateDoc(groupRef, { polls: updatedPolls });
                    setNewOption("");
                    console.log("User added to the poll successfully");
                } else {
                    console.log("Poll not found in the group");
                }
            } else {
                console.log("Group document not found");
            }
        } catch (error) {
            console.error("Error updating options:", error);
        }
    };

    const handleAddNewPayPerson = async () => {
        if (!selectedUser.trim() || !bankSearch || !bankInfo || !amount) return;
        const groupRef = doc(db, "groups", groupId);
        try {
            const groupSnapshot = await getDoc(groupRef);
            if (groupSnapshot.exists()) {
                const groupData = groupSnapshot.data();
                const poll = groupData.polls?.find((poll) => poll.id.toString() === pollId);
                if (poll) {
                    let payPeople = poll.payPeople;
                    const newPayPerson = {
                        user: groupData.users.find((user) => user.email === selectedUser),
                        bank: bankSearch,
                        bankInfo: bankInfo,
                        amount: amount,
                    };
                    if (Array.isArray(payPeople)) {
                        payPeople.push(newPayPerson);
                    } else payPeople = [newPayPerson];
                    const newPoll = { ...poll, payPeople: payPeople };
                    const updatedPolls = groupData.polls.map((p) => (p.id.toString() === pollId ? newPoll : p));
                    await updateDoc(groupRef, { polls: updatedPolls });
                    console.log("User added to the poll successfully");
                    setOpen(false);
                } else {
                    console.log("Poll not found in the group");
                }
            } else {
                console.log("Group document not found");
            }
        } catch (error) {
            console.error("Error updating options:", error);
        }
    };

    const handleVote = async () => {
        const groupRef = doc(db, "groups", groupId);
        try {
            const groupSnapshot = await getDoc(groupRef);
            if (groupSnapshot.exists()) {
                const groupData = groupSnapshot.data();
                const poll = groupData.polls?.find((poll) => poll.id.toString() === pollId);
                if (poll) {
                    const options = poll.options;
                    const optionIndex = options.findIndex((option) => option.optionText === selectedOption);
                    const newOptions = structuredClone(options);
                    newOptions[optionIndex].votes += 1;
                    newOptions[optionIndex].selectedUsers.push(user.uid);
                    const newPoll = { ...poll, options: newOptions };
                    const updatedPolls = groupData.polls.map((p) => (p.id.toString() === pollId ? newPoll : p));
                    await updateDoc(groupRef, { polls: updatedPolls });

                    console.log("User added to the poll successfully");
                } else {
                    console.log("Poll not found in the group");
                }
            } else {
                console.log("Group document not found");
            }
        } catch (error) {
            console.error("Error updating options:", error);
        }
    };

    const handleAddUserToUnPaidList = async (users) => {
        const groupRef = doc(db, "groups", groupId);
        try {
            const groupSnapshot = await getDoc(groupRef);
            if (groupSnapshot.exists()) {
                const groupData = groupSnapshot.data();
                const poll = groupData.polls?.find((poll) => poll.id.toString() === pollId);
                if (poll) {
                    let unPaidPeople = poll.unPaidPeople;
                    let paidPeople = poll.paidPeople;
                    const newUnPaidPeople = groupData.users?.filter((user) => users.includes(user.email));
                    if (Array.isArray(unPaidPeople)) {
                        if (unPaidPeople.some((user) => newUnPaidPeople.some((item) => item.email === user.email))) {
                            toast.warning("Đã có người dùng tồn tại!");
                            return;
                        } else unPaidPeople.push(...newUnPaidPeople);
                    } else unPaidPeople = newUnPaidPeople;

                    if (Array.isArray(paidPeople)) {
                        const clone = structuredClone(paidPeople);
                        newUnPaidPeople.forEach((user) => {
                            const index = clone.findIndex((item) => item.email === user.email);
                            if (index > -1) {
                                clone.splice(index, index + 1);
                            }
                        });
                        paidPeople = clone;
                    }

                    const newPoll = { ...poll, unPaidPeople: unPaidPeople, paidPeople: paidPeople ?? [] };
                    const updatedPolls = groupData.polls.map((p) => (p.id.toString() === pollId ? newPoll : p));
                    await updateDoc(groupRef, { polls: updatedPolls });
                    setSelectedUserToAdd([]);
                    console.log("User added to the poll successfully");
                } else {
                    console.log("Poll not found in the group");
                }
            } else {
                console.log("Group document not found");
            }
        } catch (error) {
            console.error("Error updating options:", error);
        }
    };

    const handleAddUserToPaidList = async (users) => {
        const groupRef = doc(db, "groups", groupId);
        try {
            const groupSnapshot = await getDoc(groupRef);
            if (groupSnapshot.exists()) {
                const groupData = groupSnapshot.data();
                const poll = groupData.polls?.find((poll) => poll.id.toString() === pollId);
                if (poll) {
                    let paidPeople = poll.paidPeople;
                    let unPaidPeople = poll.unPaidPeople;
                    const newPaidPeople = groupData.users?.filter((user) => users.includes(user.email));
                    if (Array.isArray(paidPeople)) {
                        if (paidPeople.some((user) => newPaidPeople.some((item) => item.email === user.email))) {
                            toast.warning("Đã có người dùng tồn tại!");
                            return;
                        } else paidPeople.push(...newPaidPeople);
                    } else paidPeople = newPaidPeople;

                    if (Array.isArray(unPaidPeople)) {
                        const clone = structuredClone(unPaidPeople);
                        newPaidPeople.forEach((user) => {
                            const index = clone.findIndex((item) => item.email === user.email);
                            if (index > -1) {
                                clone.splice(index, index + 1);
                            }
                        });
                        unPaidPeople = clone;
                    }

                    const newPoll = { ...poll, paidPeople: paidPeople, unPaidPeople: unPaidPeople ?? [] };
                    const updatedPolls = groupData.polls.map((p) => (p.id.toString() === pollId ? newPoll : p));
                    await updateDoc(groupRef, { polls: updatedPolls });
                    setSelectedUserToAdd([]);
                    console.log("User added to the poll successfully");
                } else {
                    console.log("Poll not found in the group");
                }
            } else {
                console.log("Group document not found");
            }
        } catch (error) {
            console.error("Error updating options:", error);
        }
    };

    const renderPaidPeople = () => {
        if (loading) return <>Đang tải...</>;
        const poll = data.polls.find((poll) => poll.id.toString() === pollId);
        const unPaidPeople = poll.unPaidPeople;
        const paidPeople = poll.paidPeople;
        const payPeople = poll.payPeople;
        const totalAmount = payPeople?.reduce((sum, item) => sum + Number(item.amount), 0);
        console.log(totalAmount);
        const eachAmount = (totalAmount / (unPaidPeople?.length + (paidPeople?.length ?? 0)) ?? 0).toFixed(1);
        console.log(poll);
        return paidPeople && paidPeople.length > 0 ? (
            <div>
                {paidPeople.map((person) => (
                    <div
                        key={person.uid}
                        className="flex items-center justify-between gap-6 py-3 px-2 overflow-x-hidden overflow-y-visible text-ellipsis cursor-pointer hover:opacity-60 bg-[#fff] border-0"
                    >
                        <div className="flex gap-2">
                            <div className="relative shrink-0">
                                <img src={person.photoURL} className="w-8 rounded-full shrink-0" alt="" />
                            </div>
                            <div className="w-full text-black">
                                <p className="overflow-hidden w-full text-xs font-semibold">{person.displayName}</p>
                                <p className="text-xs opacity-75">{person.email}</p>
                            </div>
                        </div>
                        <div className="font-bold text-accent">{eachAmount}k</div>
                        <div onClick={() => handleAddUserToUnPaidList([person.email])} className="h-7 w-7 rounded-md flex items-center justify-center bg-red-400 text-white font-semibold">
                            <span>-</span>
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            <></>
        );
    };

    const renderUnPaidPeople = () => {
        if (loading) return <>Đang tải...</>;
        const poll = data.polls.find((poll) => poll.id.toString() === pollId);
        const unPaidPeople = poll.unPaidPeople;
        const paidPeople = poll.paidPeople;
        const payPeople = poll.payPeople;
        const totalAmount = payPeople?.reduce((sum, item) => sum + Number(item.amount), 0);
        console.log(totalAmount);
        const eachAmount = (totalAmount / (unPaidPeople?.length + (paidPeople?.length ?? 0)) ?? 0).toFixed(1);
        console.log(poll);
        return unPaidPeople && unPaidPeople.length > 0 ? (
            <div className="flex flex-col gap-3">
                {unPaidPeople.map((person) => (
                    <div
                        key={person.uid}
                        className="flex items-center justify-between gap-6 py-3 px-2 overflow-x-hidden overflow-y-visible text-ellipsis cursor-pointer hover:opacity-60 bg-[#fff] border-0"
                    >
                        <div className="flex gap-2">
                            <div className="relative shrink-0">
                                <img src={person.photoURL} className="w-8 rounded-full shrink-0" alt="" />
                            </div>
                            <div className="w-full text-black">
                                <p className="overflow-hidden w-full text-xs font-semibold">{person.displayName}</p>
                                <p className="text-xs opacity-75">{person.email}</p>
                            </div>
                        </div>
                        <div className="font-bold text-red-400">{eachAmount}k</div>
                        <div
                            onClick={() => handleAddUserToPaidList([person.email])}
                            className="h-7 w-7 rounded-md flex items-center justify-center bg-accent text-white font-semibold"
                        >
                            <span>+</span>
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            <></>
        );
    };

    const renderVoteSection = () => {
        if (loading) return <>Đang tải...</>;
        const numberOfUsers = data.users.length;
        const poll = data.polls.find((poll) => poll.id.toString() === pollId);
        const options = poll.options;
        const isVoted = options.some((option) => option.selectedUsers.includes(user.uid));
        if (!isVoted) {
            return (
                <div className="w-[300px] mx-auto">
                    <div className="flex flex-col gap-2 mb-4">
                        {options.map((option) => (
                            <PollOptionBeforeVote key={option.optionText} text={option.optionText} setSelectedOption={setSelectedOption} />
                        ))}
                        <div className="flex items-center gap-2 w-full">
                            <input
                                value={newOption}
                                onChange={(e) => setNewOption(e.target.value)}
                                type="text"
                                className="flex-1 h-10 border-accent border-2 p-2 py-1 rounded-md bg-transparent"
                            />
                            <div
                                onClick={handleAddNewOption}
                                className="bg-accent flex items-center justify-center p-3 rounded-md cursor-pointer hover:opacity-75"
                            >
                                <span className="text-xs text-white">Thêm</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center justify-center">
                        <button
                            disabled={!selectedOption}
                            className={twMerge(
                                "text-white bg-accent py-2 px-3 text-sm rounded-md hover:opacity-75",
                                !selectedOption && "opacity-20 hover:opacity-20"
                            )}
                            onClick={handleVote}
                        >
                            Lưu lựa chọn
                        </button>
                    </div>
                </div>
            );
        }
        return (
            <div className="flex flex-col gap-2 max-w-[300px] mx-auto">
                {options.map((option) => (
                    <PollOptionAfterVote
                        text={option.optionText}
                        key={option.optionText}
                        width={(option.votes / numberOfUsers) * 100}
                        loading={loading}
                        option={option}
                        data={data}
                    />
                ))}
            </div>
        );
    };

    const renderPayPerson = () => {
        if (loading) return <>Đang tải...</>;
        const poll = data.polls.find((poll) => poll.id.toString() === pollId);
        const payPeople = poll.payPeople;
        return payPeople?.map((user) => {
            const bankName = user.bank;
            const bank = bankList.find((bank) => bank.name === bankName);
            return (
                <div key={user?.user?.uid}>
                    <h3 className="mb-2 text-lg font-semibold">Người trả tiền</h3>
                    <div className="flex items-center gap-2 py-3 overflow-x-hidden overflow-y-visible text-ellipsis cursor-pointer hover:opacity-60 mb-4">
                        <div className="relative shrink-0">
                            <img src={user.user.photoURL} className="w-8 rounded-full shrink-0" alt="" />
                        </div>
                        <div className="w-full text-black">
                            <p className="overflow-hidden w-full text-xs font-semibold">{user.user.displayName}</p>
                            <p className="text-xs opacity-75">{user.user.email}</p>
                        </div>
                    </div>
                    <h3 className="mb-2 text-lg font-semibold">Thông tin ngân hàng</h3>
                    <div className="mb-4 py-1">
                        <img src={bank.photoURL} alt="" />
                        <p>{bank.name}</p>
                        <p>{user.bankInfo}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold">Số tiền đã trả</h3>
                        <p className="p-3 font-bold text-accent">{user.amount}K</p>
                    </div>
                </div>
            );
        });
    };

    const shouldRenderAddButton = () => {
        if (loading) return false;
        const poll = data.polls.find((poll) => poll.id.toString() === pollId);
        const payPeople = poll.payPeople;
        return payPeople?.length !== 3;
    };

    const shouldRenderPayPeople = () => {
        if (loading) return false;
        const poll = data.polls.find((poll) => poll.id.toString() === pollId);
        const payPeople = poll.payPeople;
        return payPeople && payPeople.length > 0;
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
                        <span>Thêm người trả tiền</span>
                    </header>
                    <div className="p-4">
                        <h3 className="font-semibold mb-2">Chọn thông tin</h3>
                        <SelectSearch
                            renderValue={(valueProps) => {
                                return (
                                    <input
                                        {...valueProps}
                                        value={search}
                                        className="w-full p-2 border-[1px] bg-transparent rounded-md text-black text-sm"
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
                                            setSelectedUser(option.email);
                                            setSearch(option.name);
                                        }}
                                        key={option.uid}
                                        className="flex items-center gap-2 py-3 px-2 overflow-x-hidden overflow-y-visible text-ellipsis cursor-pointer hover:opacity-60 bg-[#fff] border-0"
                                    >
                                        <div className="relative shrink-0">
                                            <img src={option.photoURL} className="w-8 rounded-full shrink-0" alt="" />
                                        </div>
                                        <div className="w-full text-black">
                                            <p className="overflow-hidden w-full text-xs font-semibold">{option.displayName}</p>
                                            <p className="text-xs opacity-75">{option.email}</p>
                                        </div>
                                    </div>
                                );
                            }}
                            debounce={500}
                            search
                            options={data?.users
                                ?.map((user) => ({
                                    ...user,
                                    name: user.email,
                                    value: user.uid,
                                }))
                                ?.filter((item) => {
                                    return item.email.includes(search);
                                })}
                            onSe
                            name="language"
                            placeholder="Tìm kiếm"
                        />
                    </div>
                    <div className="p-4">
                        <h3 className="font-semibold mb-2">Chọn ngân hàng</h3>
                        <SelectSearch
                            renderValue={(valueProps) => {
                                return (
                                    <input
                                        {...valueProps}
                                        value={bankSearch}
                                        className="w-full p-2 border-[1px] bg-transparent rounded-md text-black text-sm"
                                        onChange={(e) => setBankSearch(e.target.value)}
                                    />
                                );
                            }}
                            isDropdownOpen
                            closeOnSelect
                            renderOption={(domProps, option, snapshot, className) => {
                                return (
                                    <div
                                        onClick={() => {
                                            setBankSearch(option.name);
                                        }}
                                        key={option.value}
                                        className="flex items-center gap-2 py-3 px-2 overflow-x-hidden overflow-y-visible text-ellipsis cursor-pointer hover:opacity-60 bg-[#fff] border-0"
                                    >
                                        <div className="relative shrink-0">
                                            <img src={option.photoURL} className="w-8 rounded-full shrink-0" alt="" />
                                        </div>
                                        <div className="w-full text-black">
                                            <p className="overflow-hidden w-full text-xs font-normal">{option.name}</p>
                                        </div>
                                    </div>
                                );
                            }}
                            debounce={500}
                            search
                            options={bankList.filter((item) => {
                                return item.value.includes(bankSearch);
                            })}
                            onSe
                            name="language"
                            placeholder="Tìm kiếm"
                        />
                    </div>
                    <div className="p-4">
                        <h3 className="font-semibold mb-2">SĐT/STK</h3>
                        <input
                            value={bankInfo}
                            className="w-full p-2 border-[1px] bg-transparent rounded-md text-black text-sm"
                            onChange={(e) => setBankInfo(e.target.value)}
                        />
                    </div>
                    <div className="p-4">
                        <h3 className="font-semibold mb-2">Tổng tiền (nghìn đồng)</h3>
                        <input
                            value={amount}
                            className="w-full p-2 border-[1px] bg-transparent rounded-md text-black text-sm"
                            onChange={(e) => setAmount(e.target.value)}
                        />
                    </div>
                    <div onClick={handleAddNewPayPerson} className="hover:opacity-75 cursor-pointer flex justify-center p-4">
                        <button className="p-2 h-fit bg-accent rounded-md text-white font-semibold">Lưu lựa chọn</button>
                    </div>
                </div>
            </Modal>
            <div className="flex">
                <div className="w-2/5 max-w-[400px] shrink-0 flex flex-col items-center">
                    <h3 className="font-semibold mb-4">Danh sách bình chọn</h3>
                    <div className="w-full">{renderVoteSection()}</div>
                </div>
                <div className="flex-1 h-full px-4 justify-center">
                    {shouldRenderPayPeople() && <div className="grid grid-cols-3 gap-4 justify-center px-20 py-10 bg-white">{renderPayPerson()}</div>}
                    <div
                        onClick={() => setOpen(true)}
                        className={`hover:opacity-75 cursor-pointer flex justify-center p-4 ${shouldRenderAddButton() ? "block" : "hidden"}`}
                    >
                        <button className={`p-2 mt-3 h-fit bg-accent rounded-md text-white font-semibold`}>Thêm người trả tiền</button>
                    </div>
                </div>
            </div>
            <div className="py-20 flex">
                <div className="w-2/5 max-w-[400px] shrink-0 flex flex-col items-center">
                    <div className="px-12 w-full">
                        <h3 className="font-semibold mb-4">Thêm người đặt món</h3>
                        <SelectSearch
                            renderValue={(valueProps) => {
                                return (
                                    <input
                                        {...valueProps}
                                        value={searchUserToAdd}
                                        className="w-full p-2 border-[1px] bg-transparent rounded-md text-black text-sm"
                                        onChange={(e) => setSearchUserToAdd(e.target.value)}
                                    />
                                );
                            }}
                            isDropdownOpen
                            closeOnSelect
                            renderOption={(domProps, option, snapshot, className) => {
                                return (
                                    <div
                                        onClick={() => {
                                            setSelectedUserToAdd((prev) => {
                                                const setFromUsers = new Set(prev);
                                                setFromUsers.add(option.email);
                                                return Array.from(setFromUsers);
                                            });
                                            setSearchUserToAdd(option.name);
                                        }}
                                        key={option.uid}
                                        className="flex items-center gap-2 py-3 px-2 overflow-x-hidden overflow-y-visible text-ellipsis cursor-pointer hover:opacity-60 bg-[#fff] border-0"
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
                                        <div className="w-full text-black">
                                            <p className="overflow-hidden w-full text-xs font-semibold">{option.displayName}</p>
                                            <p className="text-xs opacity-75">{option.email}</p>
                                        </div>
                                    </div>
                                );
                            }}
                            debounce={500}
                            search
                            options={data?.users
                                ?.map((user) => ({
                                    ...user,
                                    name: user.email,
                                    value: user.uid,
                                }))
                                ?.filter((item) => {
                                    return item.email.includes(searchUserToAdd);
                                })}
                            onSe
                            name="language"
                            placeholder="Tìm kiếm"
                        />
                        <div
                            className={twMerge(
                                "shadow-lg flex flex-wrap w-full p-3 content-start gap-3 min-h-[300px]",
                                !selectedUser || (selectedUser.length === 0 && "hidden")
                            )}
                        >
                            {selectedUserToAdd.map((user) => (
                                <div key={user} className="flex items-center gap-2 bg-gray-300 px-2 py-1 rounded-lg">
                                    <AiFillCloseCircle
                                        onClick={() => {
                                            setSelectedUserToAdd((prev) => {
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
                            <button
                                onClick={() => handleAddUserToUnPaidList(selectedUserToAdd)}
                                className="text-center mx-auto px-3 py-2 rounded-md text-xs bg-accent text-white"
                            >
                                Thêm
                            </button>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-2 flex-1 items-start gap-10 justify-center">
                    <div className="max-w-[80%] mx-auto">
                        <h3 className="text-center font font-semibold mb-6">Danh sách chưa trả tiền</h3>
                        {renderUnPaidPeople()}
                    </div>
                    <div className="max-w-[80%] mx-auto">
                        <h3 className="text-center font font-semibold mb-6">Danh sách đã trả tiền</h3>
                        {renderPaidPeople()}
                    </div>
                </div>
            </div>
        </>
    );
};

export default PollDetails;
