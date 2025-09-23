"use client";

import { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

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

  return (
    <div className="absolute top-16 left-4 right-4 bg-white rounded-xl shadow-lg border z-20">
      <div className="p-4 text-center border-b">
        <h3 className="text-lg font-semibold text-gray-900">
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

        <div className="mt-4 pt-4 border-t">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Time zone</h4>
          <div className="flex items-center text-sm text-gray-600">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
            Asia/Dhaka (1:34pm)
          </div>
        </div>
      </div>

      <style jsx>{`
        :global(.custom-calendar) {
          width: 100%;
          border: none;
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

        :global(.custom-calendar .react-calendar__navigation__arrow) {
          background: none;
          border: none;
          color: #6b7280;
          font-size: 20px;
          min-width: 32px;
          height: 32px;
          border-radius: 50%;
          transition: background 0.2s;
        }

        :global(.custom-calendar .react-calendar__navigation__arrow:hover) {
          background-color: #f3f4f6;
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

        /* Days */
        :global(.custom-calendar .react-calendar__tile) {
          background: none;
          border: none;
          color: #111827;
          font-size: 14px;
          font-weight: 400;
          height: 38px;
          width: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          margin: 2px;
          transition: background 0.2s, color 0.2s;
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
