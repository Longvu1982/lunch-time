import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc, arrayUnion, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useDocument, useDocumentData } from "react-firebase-hooks/firestore";
import { useAuthState } from "react-firebase-hooks/auth";

const PollDetails = () => {
    const [selectedOption, setSelectedOption] = useState("");
    const { groupId, pollId } = useParams();
    const pollsCollectionRef = doc(db, "groups", groupId);
    const [data, loading, error, snapshot] = useDocumentData(pollsCollectionRef);
    console.log(selectedOption);
    const [user] = useAuthState(auth);

    const handleVote = async () => {
        const groupRef = doc(db, "groups", groupId);
        console.log(pollId);
        try {
            const groupSnapshot = await getDoc(groupRef);
            if (groupSnapshot.exists()) {
                const groupData = groupSnapshot.data();
                console.log(groupData.polls);
                const poll = groupData.polls?.find((poll) => poll.id.toString() === pollId);
                if (poll) {
                    // Update the poll's "selectedUsers" field with the user ID
                    // const updatedPoll = {
                    //     ...poll,

                    //     selectedUsers: poll.selectedUsers,
                    // };

                    // console.log(updatedPoll)

                    // // Update the specific poll in the group's polls array
                    // const updatedPolls = groupData.polls.map((p) => (p.id.toString() === pollId ? updatedPoll : p));
                    // console.log('updatedPolls :', updatedPolls);

                    // // Update the group document with the modified polls data
                    // await updateDoc(groupRef, { polls: updatedPolls });
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

    const renderVoteSection = () => {
        if (loading) return <>Đang tải...</>;
        const numberOfUsers = data.users.length;
        const poll = data.polls.find((poll) => poll.id.toString() === pollId);
        const options = poll.options;
        const isVoted = options.some((option) => option.selectedUsers.includes(user.uid));
        if (!isVoted) {
            return (
                <div>
                    <div>
                        {options.map((option) => (
                            <div key={option.optionText}>
                                <input type="radio" value={option.optionText} name="option" onChange={(e) => setSelectedOption(e.target.value)} />
                                {option.optionText}
                            </div>
                        ))}
                    </div>
                    <button onClick={handleVote}>Lưu lựa chọn</button>
                </div>
            );
        }
        console.log(poll);
        return (
            <div className="flex flex-col gap-2 max-w-[300px]">
                {options.map((option) => (
                    <div key={option.optionText} className="bg-accent bg-opacity-20 h-9 rounded-md relative overflow-hidden">
                        <div className="absolute left-0 top-0 bottom-0 bg-accent" style={{ width: `${(option.votes / numberOfUsers) * 100}%` }}></div>
                        <div className="absolute inset-0 px-2 flex items-center">
                            <span className="text-white font-semibold text-base">{option.optionText}</span>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return <div>{renderVoteSection()}</div>;
};

export default PollDetails;
