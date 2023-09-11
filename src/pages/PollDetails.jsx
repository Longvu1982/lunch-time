import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc, arrayUnion, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useDocument, useDocumentData } from "react-firebase-hooks/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { twMerge } from "tailwind-merge";
import SelectSearch from "react-select-search";

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
      <div
        key={text}
        className="bg-accent bg-opacity-20 h-2 rounded-md relative overflow-hidden"
      >
        <div
          className="absolute left-0 top-0 bottom-0 bg-accent transition-all duration-[500ms]"
          style={{ width: `${currentWidth}%` }}
        ></div>
      </div>
    </div>
  );
};

const PollOptionBeforeVote = ({ text, setSelectedOption }) => {
  return (
    <label
      htmlFor={text}
      className="border-accent border-2 rounded-md p-3 max-w-[300px] flex items-center gap-2 hover:opacity-75 cursor-pointer"
    >
      <input
        id={text}
        type="radio"
        value={text}
        name="option"
        onChange={(e) => setSelectedOption(e.target.value)}
      />
      <span className="font-semibold text-base text-[#555]">{text}</span>
    </label>
  );
};

const PollDetails = () => {
  const [selectedOption, setSelectedOption] = useState("");
  const [newOption, setNewOption] = useState("");
  const [search, setSearch] = useState("");
  const { groupId, pollId } = useParams();
  const [selectedUser, setSelectedUser] = useState();
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
        const poll = groupData.polls?.find(
          (poll) => poll.id.toString() === pollId
        );
        if (poll) {
          const options = poll.options;
          const newOptions = structuredClone(options);
          newOptions.push({
            optionText: newOption,
            votes: 0,
            selectedUsers: [],
          });
          const newPoll = { ...poll, options: newOptions };
          const updatedPolls = groupData.polls.map((p) =>
            p.id.toString() === pollId ? newPoll : p
          );
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

  const handleVote = async () => {
    const groupRef = doc(db, "groups", groupId);
    try {
      const groupSnapshot = await getDoc(groupRef);
      if (groupSnapshot.exists()) {
        const groupData = groupSnapshot.data();
        console.log(groupData.polls);
        const poll = groupData.polls?.find(
          (poll) => poll.id.toString() === pollId
        );
        if (poll) {
          const options = poll.options;
          const optionIndex = options.findIndex(
            (option) => option.optionText === selectedOption
          );
          const newOptions = structuredClone(options);
          newOptions[optionIndex].votes += 1;
          newOptions[optionIndex].selectedUsers.push(user.uid);
          const newPoll = { ...poll, options: newOptions };
          const updatedPolls = groupData.polls.map((p) =>
            p.id.toString() === pollId ? newPoll : p
          );
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

  const renderVoteSection = () => {
    if (loading) return <>Đang tải...</>;
    const numberOfUsers = data.users.length;
    const poll = data.polls.find((poll) => poll.id.toString() === pollId);
    const options = poll.options;
    const isVoted = options.some((option) =>
      option.selectedUsers.includes(user.uid)
    );
    if (!isVoted) {
      return (
        <div className="w-[300px] mx-auto">
          <div className="flex flex-col gap-2 mb-4">
            {options.map((option) => (
              <PollOptionBeforeVote
                key={option.optionText}
                text={option.optionText}
                setSelectedOption={setSelectedOption}
              />
            ))}
            <div className="flex items-center gap-2 w-full">
              <input
                value={newOption}
                onChange={(e) => setNewOption(e.target.value)}
                type="text"
                className="flex-1 h-full border-accent border-2 p-2 py-1 rounded-md"
              />
              <div
                onClick={handleAddNewOption}
                className="bg-accent flex items-center justify-center p-2 rounded-md cursor-pointer hover:opacity-75"
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

  return (
    <div className="flex h-full">
      <div className="w-2/5 max-w-[400px] shrink-0 flex flex-col items-center">
        <h3 className="font-semibold mb-4">Danh sách bình chọn</h3>
        <div className="w-full">{renderVoteSection()}</div>
      </div>
      <div className="flex-1 bg-gray-200 h-full px-4">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <h3 className="font-semibold mb-4">Người trả tiền 1</h3>
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
                      <img
                        src={option.photoURL}
                        className="w-8 rounded-full shrink-0"
                        alt=""
                      />
                    </div>
                    <div className="w-full text-black">
                      <p className="overflow-hidden w-full text-xs font-semibold">
                        {option.displayName}
                      </p>
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
                  return item.email.includes(search) && item.uid !== user.uid;
                })}
              onSe
              name="language"
              placeholder="Tìm kiếm"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PollDetails;
