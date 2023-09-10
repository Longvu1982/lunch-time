import React from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import moment from "moment";
import { twMerge } from "tailwind-merge";
import { useNavigate } from "react-router";
import { IoIosAddCircleOutline } from "react-icons/io";

const localizer = momentLocalizer(moment);

const events = [
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

const customMessages = {
  today: "Hôm nay", // Change "Today" text here
  next: ">", // Change "Next" text here
  previous: "<", // Change "Previous" text here
  month: "Tháng", // Change "Month" text here
  week: "Tuần", // Change "Week" text here
  day: "Ngày", // Change "Day" text here
};

const GroupDetails = () => {
  const navigate = useNavigate();
  return (
    <div>
      <div className="flex items-center justify-between  mb-6">
        <h2 className="font-semibold text-lg">Lịch sử hoạt động</h2>
        <div>
          <button
            className={twMerge(
              "text-white bg-accent py-1 px-2 text-sm rounded-md hover:opacity-75 flex items-center gap-1"
            )}
            onClick={() => navigate("/create-poll")}
          >
            <IoIosAddCircleOutline color="white" className="text-white" />
            <span>Tạo sự kiện mới</span>
          </button>
        </div>
      </div>
      <Calendar
        localizer={localizer}
        events={events}
        eventPropGetter={(event) => ({
          onClick: () => console.log("hi"),
        })}
        onSelectEvent={(e) => {
          console.log(e);
        }}
        startAccessor="start"
        endAccessor="end"
        messages={customMessages}
        style={{ height: 650 }}
        views={["month", "week", "day"]}
      />
    </div>
  );
};

export default GroupDetails;
