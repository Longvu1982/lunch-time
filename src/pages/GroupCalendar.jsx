import React, { useEffect, useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import moment from "moment";
import { twMerge } from "tailwind-merge";
import Modal from "react-modal";
import { useNavigate } from "react-router";
import { useParams } from "react-router-dom";
import { IoIosAddCircleOutline } from "react-icons/io";
import { BsFillGearFill } from "react-icons/bs";
import { toast } from "react-toastify";
import { doc, updateDoc, arrayUnion, query, where, collection, getDocs, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useDocument } from "react-firebase-hooks/firestore";
import { BiCopy } from "react-icons/bi";

const localizer = momentLocalizer(moment);

const mockEvents = [
    {
        id: 1,
        title: "Đặt cơm 76",
        start: new Date(2023, 1, 1, 10, 0), // Year, Month (0-based), Day, Hour, Minute
        end: new Date(2023, 1, 1, 12, 0),
    },
    {
        id: 2,
        title: "Đặt bún trộn",
        start: new Date(2023, 8, 5, 14, 0),
        end: new Date(2023, 8, 5, 16, 0),
    },
    {
        id: 3,
        title: "Đặt cơm",
        start: new Date(2023, 8, 10, 9, 30),
        end: new Date(2023, 8, 10, 11, 0),
    },
    // Add more events as needed
];

const customStyles = {
    content: {
        top: "50%",
        left: "50%",
        minHeight: "300px",
        transform: "translate(-50%, -50%)",
        padding: 0,
        border: 0,
        zIndex: 100000,
        width: "450px",
        boxShadow: "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px",
        overlay: { zIndex: 1000000 },
    },
};

const customMessages = {
    today: "Hôm nay", // Change "Today" text here
    next: ">", // Change "Next" text here
    previous: "<", // Change "Previous" text here
    month: "Tháng", // Change "Month" text here
    week: "Tuần", // Change "Week" text here
    day: "Ngày", // Change "Day" text here
};

const GroupCalendar = () => {
    const [isOpen, setOpen] = useState(false);
    const [isOpenCodeModal, setOpenCodeModal] = useState(false);
    const [eventName, setEventName] = useState("");
    const [events, setEvents] = useState([]);
    const [newOption, setNewOption] = useState("");
    const [options, setOptions] = useState([]);
    const { groupId } = useParams();
    const pollsCollectionRef = doc(db, "groups", groupId);
    const [docSnapshot, loading, error] = useDocument(pollsCollectionRef);
    const navigate = useNavigate();

    console.log(events?.[0]?.timestamp?.toDate());

    const fetchGroupPolls = async () => {
        if (error) {
            toast.error("Có lỗi xảy ra khi lấy dữ liệu");
            console.log(error);
        } else if (!loading && docSnapshot && docSnapshot.exists) {
            const pollsData = docSnapshot.data().polls;
            if (pollsData) {
                setEvents(pollsData);
            } else {
                toast.warning("Chưa có sự kiện!");
            }
        }
    };

    const createPoll = async () => {
        try {
            // Reference the group document in Firestore
            const groupDocRef = doc(db, "groups", groupId);
            const newPoll = {
                id: Date.now(),
                pollName: eventName,
                timestamp: new Date(),
                options: options.map((optionText) => ({
                    optionText,
                    votes: 0,
                    selectedUsers: []
                })),
            };
            // Update the 'polls' array by adding a new poll object
            await updateDoc(groupDocRef, {
                polls: arrayUnion(newPoll),
            });
            toast.success("Tạo sự kiện thành công!");
            setOpen(false);
        } catch (error) {
            console.log(error);
            toast.error("Có lỗi xảy ra!");
        }
    };

    useEffect(() => {
        fetchGroupPolls();
    }, [docSnapshot, loading, error]);

    return (
        <>
            <div>
                <div className="flex items-center justify-between  mb-6">
                    <h2 className="font-semibold text-lg">Lịch sử hoạt động</h2>
                    <div className="flex items-center gap-3">
                        <BsFillGearFill
                            className="text-accent hover:opacity-75 cursor-pointer"
                            onClick={() => {
                                setOpenCodeModal(true);
                            }}
                        />
                        <button
                            className={twMerge("text-white bg-accent py-1 px-2 text-sm rounded-md hover:opacity-75 flex items-center gap-1")}
                            onClick={() => setOpen(true)}
                        >
                            <IoIosAddCircleOutline color="white" className="text-white" />
                            <span>Tạo sự kiện mới</span>
                        </button>
                    </div>
                </div>
                <Calendar
                    localizer={localizer}
                    events={events?.map((event) => ({
                        id: event.id,
                        title: event.pollName,
                        start: event.timestamp.toDate(),
                        // start: ,
                        end: event.timestamp.toDate(),
                    }))}
                    eventPropGetter={(event) => ({
                        onClick: () => console.log("hi"),
                    })}
                    onSelectEvent={(e) => {
                        console.log(`/group/${groupId}/poll/${e.id}`);
                        // return;
                        navigate(`/group/${groupId}/poll/${e.id}`);
                    }}
                    startAccessor="start"
                    endAccessor="end"
                    messages={customMessages}
                    style={{ height: 650 }}
                    views={["month", "week", "day"]}
                />
            </div>
            <Modal
                isOpen={isOpen}
                // className="h-fit"
                style={customStyles}
                onRequestClose={() => setOpen(false)}
                contentLabel="Tạo sự kiện mới"
                appElement={document.getElementById("app")}
            >
                <div className="bg-white z-[1000]">
                    <header className="p-2 px-3 text-sm bg-accent text-white font-semibold flex items-center justify-between">
                        <span>Tạo sự kiện mới</span>
                    </header>
                    <div className="p-4">
                        <div className="flex flex-col gap-2 mb-4">
                            <label htmlFor="" className="text-sm mb-2 inline-block">
                                Tên sự kiện
                            </label>
                            <input
                                type="text"
                                className="border-[1px] rounded-md p-2 bg-transparent w-full"
                                value={eventName}
                                onChange={(e) => setEventName(e.target.value)}
                            />
                        </div>
                        <div>
                            <p className="text-sm mb-2">Lựa chọn</p>
                            <div className="flex flex-col gap-3 my-3">
                                {options.map((option) => (
                                    <div key={option} className="bg-gray-200 rounded-sm p-2 flex items-center justify-between">
                                        <span>{option}</span>
                                        <span
                                            onClick={() =>
                                                setOptions((prev) => {
                                                    const clone = [...prev];
                                                    const index = clone.findIndex((prevOp) => prevOp === option);
                                                    clone.splice(index, index + 1);
                                                    return clone;
                                                })
                                            }
                                            className="text-lg text-white rounded-md px-2 bg-rose-500 cursor-pointer hover:opacity-75 inline-block"
                                        >
                                            x
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-2 items-center mb-12">
                                <input
                                    type="text"
                                    className="border-[1px] rounded-md p-2 bg-transparent flex-1"
                                    value={newOption}
                                    onChange={(e) => setNewOption(e.target.value)}
                                />
                                <p
                                    onClick={() => {
                                        setOptions((prev) => {
                                            const optionsSet = new Set([...prev]);
                                            optionsSet.add(newOption.trim());
                                            return Array.from(optionsSet);
                                        });
                                    }}
                                    className="bg-accent text-white font-semibold px-3 py-2 rounded-md hover:opacity-75 cursor-pointer"
                                >
                                    +
                                </p>
                            </div>
                            <div className="flex justify-center flex-1 items-end">
                                <button
                                    disabled={!eventName}
                                    className={twMerge(
                                        "text-white bg-accent py-2 px-3 text-sm rounded-md hover:opacity-75",
                                        !eventName && "opacity-20 hover:opacity-20"
                                    )}
                                    onClick={createPoll}
                                >
                                    Tạo sự kiện
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>
            <Modal
                isOpen={isOpenCodeModal}
                // className="h-fit"
                style={{ ...customStyles, content: { ...customStyles.content, minHeight: 0, height: "150px" } }}
                onRequestClose={() => setOpenCodeModal(false)}
                contentLabel="Copy mã sau để mời bạn bè"
            >
                <div>
                    <header className="p-2 px-3 text-sm bg-accent text-white font-semibold flex items-center justify-between">
                        <span>Copy mã để chia sẻ</span>
                        <BiCopy
                            className="text-white hover:opacity-75 cursor-pointer"
                            onClick={() => {
                                toast.success("Đã copy!");
                                navigator.clipboard.writeText(docSnapshot?.data()?.code);
                            }}
                        />
                    </header>
                    <p className="text-3xl font-semibold text-center text-[#333] mt-6">{docSnapshot?.data()?.code}</p>
                </div>
            </Modal>
        </>
    );
};

export default GroupCalendar;
