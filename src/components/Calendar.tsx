"use client";

import { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import globe from "../../public/images/globe.png";
import Image from "next/image";
import down from "../../public/images/down-arrow.png";

interface CalendarPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onDateSelect: (date: Date) => void;
  detectedDate?: Date;
}

const CalendarPopup: React.FC<CalendarPopupProps> = ({
  isOpen,
  onClose,
  onDateSelect,
  detectedDate,
}) => {
  if (!isOpen) return null;

  const handleDateChange = (value: Date | Date[]) => {
    let selectedDate: Date;

    if (Array.isArray(value)) {
      selectedDate = value[0]; // take the first date if it's a range
    } else {
      selectedDate = value;
    }

    onDateSelect(selectedDate);
    onClose();
  };

  const getCurrentDhakaTime = () => {
    const now = new Date();
    const dhakaTime = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Dhaka",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(now);
    return `Asia/Dhaka (${dhakaTime.toLowerCase()})`;
  };

  return (
    <div className="bg-[#F2F2F2]  rounded-[20px]  max-w-[448px] mx-auto  z-20">
      <div className="p-4 text-center">
        <h3 className="text-2xl font-medium text-black leading-[34px] tracking-[0.02em]">
          Select a Date & Time
        </h3>
      </div>

      <div className="p-4">
        <Calendar
          onChange={handleDateChange}
          className="custom-calendar"
          prev2Label={null}
          next2Label={null}
        />

        <div className="mt-8 ">
          <h4 className="text-base leading-[26px] tracking-0 font-bold text-black mb-[6px]">
            Time zone
          </h4>
          <div className="flex items-center  gap-3 text-gray-600">
            {/* <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span> */}
            <Image alt="globe" src={globe} />
            <div className="flex items-center gap-1">
              <p className="text-sm leading-[22px] tracking-0 text-black">
                {getCurrentDhakaTime()}
              </p>
              <Image alt="down arrow" src={down} />
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        :global(.custom-calendar) {
          max-width: 448px;
          margin: auto;
          border: none;
          background: #f2f2f2;
          font-family: inherit;
        }

        /* Navigation */
        :global(.custom-calendar .react-calendar__navigation) {
          display: flex;
          justify-content: space-between;
          align-items: center;
          height: 44px;
          margin-bottom: 1rem;
        }

        :global(.custom-calendar .react-calendar__navigation__label) {
          font-weight: 600;
          font-size: 16px;
          color: #111827;
          background: none;
          border: none;
        }

        /* Weekdays */
        :global(.custom-calendar .react-calendar__month-view__weekdays) {
          margin-bottom: 0.5rem;
          text-align: center;
        }

        :global(
            .custom-calendar .react-calendar__month-view__weekdays__weekday
          ) {
          text-transform: uppercase;
          font-weight: 500;
          font-size: 11px;
          color: #6b7280;
          padding: 6px 0;
        }

        :global(.custom-calendar .react-calendar__tile:hover) {
          background-color: #e5e7eb;
        }

        :global(.custom-calendar .react-calendar__tile--active) {
          background-color: #2563eb !important;
          color: white !important;
          font-weight: 500;
        }

        :global(.custom-calendar .react-calendar__tile--now) {
          background-color: #dbeafe !important;
          color: #1d4ed8 !important;
          font-weight: 500;
        }

        :global(.custom-calendar .react-calendar__tile--neighboringMonth) {
          visibility: hidden; /* hide other months' days */
        }
      `}</style>
    </div>
  );
};

export default CalendarPopup;
