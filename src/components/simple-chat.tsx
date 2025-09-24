"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import submit from "../../public/images/submit.png";
import Navbar from "./Navbar";
import Footer from "./Footer";
import CalendarPopup from "./Calendar";
import previous from "../../public/images/previous.png";
import globe from "../../public/images/globe.png";
import axios from "axios";
import time from "../../public/images/time.png";
import slot from "../../public/images/slot.png";
import think from "../../public/images/think.png";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  type?: "text" | "meeting-card" | "calendar";
  meetingData?: {
    summary: string;
    duration: string;
    datetime: string;
    guests: string;
    location: string;
  };
}

interface BookingData {
  date: string;
  time: string;
  user_email: string;
  summary: string;
  description: string;
  guest_emails: string[];
}

type Step =
  | "idle"
  | "name"
  | "email"
  | "date"
  | "time"
  | "services"
  | "summary"
  | "done";

export default function SimpleChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userId] = useState(() => crypto.randomUUID());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [showServices, setShowServices] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isClosed, setIsClosed] = useState(false);

  const [booking, setBooking] = useState<BookingData>({
    date: "",
    time: "",
    user_email: "",
    summary: "",
    description: "",
    guest_emails: [],
  });

  const [step, setStep] = useState<Step>("idle");
  const [showCalendar, setShowCalendar] = useState(false);
  const [showTimes, setShowTimes] = useState(false);

  const handleMinimize = () => {
    console.log("Minimize clicked");
    setIsMinimized((prev) => !prev);
  };

  const handleClose = () => {
    console.log("Close clicked");
    setIsMinimized(true);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // --- Helper functions ---
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getEndTime = (startTime: string) => {
    // Assuming 30-minute meetings by default
    const [time, period] = startTime.split(" ");
    const [hours, minutes] = time.split(":").map(Number);

    let endHours = hours;
    let endMinutes = minutes + 30;

    if (endMinutes >= 60) {
      endHours += 1;
      endMinutes -= 60;
    }

    const endTime = `${endHours}:${endMinutes
      .toString()
      .padStart(2, "0")} ${period}`;
    return endTime;
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

  // --- Reset booking flow ---
  const resetBookingFlow = () => {
    setBooking({
      date: "",
      time: "",
      user_email: "",
      summary: "",
      description: "",
      guest_emails: [],
    });
    setStep("idle");
    setShowCalendar(false);
    setShowTimes(false);
    setShowServices(false);
    setSelectedServices([]);
    setSelectedTime("");
  };

  // --- Finalize booking ---
  const finalizeBooking = async (payload: BookingData) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/google-calendar/schedule`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error("Failed to book meeting");

      const data = await res.json();
      console.log(data);

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data.message || "✅ Meeting scheduled successfully!",
        },
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "",
          type: "meeting-card",
          meetingData: {
            summary: "30 Minute Complimentary Discovery Call",
            duration: "30 min",
            datetime: `${booking.time} - ${getEndTime(
              booking.time
            )}, ${formatDate(booking.date)}`,
            guests: "0 Guests",
            location: getCurrentDhakaTime(),
          },
        },
      ]);

      // ✅ Reset to idle instead of done to allow continued conversation
      if (payload.summary && payload.description) {
        resetBookingFlow();
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "❌ Something went wrong while booking. Please try again.",
        },
      ]);
      // Reset to idle on error too
      resetBookingFlow();
    }
  };

  // --- Handle text submissions ---
  const handleSubmit = async (e: React.FormEvent) => {
    // Made async to await fetch
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput(""); // Clear input immediately after adding user message
    setIsLoading(true); // Set loading state

    // Flow logic
    if (step === "idle" && /schedule a meeting/i.test(userMessage.content)) {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "Great! What's your name?",
        },
      ]);
      setStep("name");
    } else if (step === "name") {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "Thanks! What's your email address?",
        },
      ]);
      setStep("email");
    } else if (step === "email") {
      setBooking((prev) => ({ ...prev, user_email: userMessage.content }));
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "Please select a date for your meeting.",
        },
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "",
          type: "calendar",
        },
      ]);
      // setShowCalendar(true);
      setStep("date");
    } else if (step === "summary") {
      // Construct payload for backend
      const payload: BookingData = {
        date: booking.date,
        time: booking.time,
        user_email: booking.user_email,
        summary: userMessage.content,
        description: userMessage.content,
        guest_emails: [booking.user_email],
        // userId, // Assuming userId is part of BookingData or passed separately if needed by your API
        // messages, // Assuming messages is not part of BookingData directly but rather context for the AI
      };

      // Log payload and userId
      console.log("User ID:", userId);
      console.log("Final Booking Payload:", payload);

      // Send to backend
      await finalizeBooking(payload);

      // No need to clear input here, it's done at the beginning
    } else if (step === "idle") {
      // This is the new block for idle state asking
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/ask`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: userId, // Pass userId for context
            query: userMessage.content,
            // messages: messages.map((m) => ({
            //   role: m.role,
            //   content: m.content,
            // })),
          }),
        });

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        console.log(data);

        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: data.answer || "I received your message!",
          },
        ]);
      } catch (error) {
        console.error("Error sending message to /ask endpoint:", error);
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: "Sorry, I couldn't process that request at the moment.",
          },
        ]);
      }
    }
    setIsLoading(false); // Reset loading state
  };

  // --- Handle date selection ---
  // const handleDateSelect = (date: Date) => {
  //   const formattedDate = date.toISOString().split("T")[0]; // YYYY-MM-DD
  //   setBooking((prev) => ({ ...prev, date: formattedDate }));
  //   setShowCalendar(false);
  //   setMessages((prev) => [
  //     ...prev,
  //     {
  //       id: crypto.randomUUID(),
  //       role: "assistant",
  //       content: "Now please pick a time.",
  //     },
  //   ]);
  //   setShowTimes(true);
  //   setStep("time");
  // };
  const handleDateSelect = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const formattedDate = `${year}-${month}-${day}`; // YYYY-MM-DD

    setBooking((prev) => ({ ...prev, date: formattedDate }));
    setShowCalendar(false);
    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Now please pick a time.",
      },
    ]);
    setShowTimes(true);
    setStep("time");
  };

  // Update the time selection handler
  const handleTimeClick = (time: string) => {
    setSelectedTime(time);
  };

  // --- Handle time selection ---
  // const handleTimeSelect = (time: string) => {
  //   setBooking((prev) => ({ ...prev, time }));
  //   setShowTimes(false);
  //   setMessages((prev) => [
  //     ...prev,
  //     {
  //       id: crypto.randomUUID(),
  //       role: "assistant",
  //       content: "What's the meeting about? (summary)",
  //     },
  //   ]);
  //   setStep("summary");
  // };

  const handleTimeNext = () => {
    if (selectedTime) {
      setBooking((prev) => ({ ...prev, time: selectedTime }));
      setShowTimes(false);
      // Reset for next use
      setShowServices(true);
      setStep("services");
    }
  };

  const handleServiceToggle = (service: string) => {
    setSelectedServices((prev) => {
      if (prev.includes(service)) {
        return prev.filter((s) => s !== service);
      } else {
        return [...prev, service];
      }
    });
  };

  const handleServicesConfirm = () => {
    if (selectedServices.length === 0) return; // Don't proceed if no services selected

    // Create summary from selected services
    const summary = selectedServices.join(", ");

    // Construct payload for backend
    const payload: BookingData = {
      date: booking.date,
      time: selectedTime, // Use selectedTime since booking.time might not be set yet
      user_email: booking.user_email,
      summary: summary,
      description: `Meeting to discuss: ${summary}`,
      guest_emails: [booking.user_email],
    };

    // Log payload and userId
    console.log("User ID:", userId);
    console.log("Final Booking Payload:", payload);

    setShowServices(false);
    finalizeBooking(payload);

    // setStep("summary");
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[600px] max-w-[600px] ">
      {/* Calendar UI */}
      {/* <CalendarPopup
        isOpen={showCalendar}
        onClose={() => setShowCalendar(false)}
        onDateSelect={handleDateSelect}
      /> */}

      {isMinimized ? (
        <button
          onClick={() => setIsMinimized(false)}
          className="w-14 h-14 rounded-full flex items-center justify-center "
          aria-label="Open Chat"
        >
          <Image src={think} alt="chat icon" className="w-14 h-14" />
        </button>
      ) : (
        <div className="max-w-[600px] h-[60vh] bg-white shadow-xl rounded-xl border flex flex-col overflow-hidden">
          <Navbar onMinimize={handleMinimize} onClose={handleClose} />

          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 p-5">
            {messages.map((m) =>
              m.role === "user" ? (
                <div
                  key={m.id}
                  className="px-[16px] py-[9px] rounded-[10px] rounded-br-none bg-black text-white ml-auto max-w-xs"
                >
                  {m.content}
                </div>
              ) : m.type === "meeting-card" ? (
                <div key={m.id} className=" max-w-md">
                  <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <h3 className="font-semibold text-gray-900 text-lg mb-3">
                      {m.meetingData?.summary}
                    </h3>

                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-gray-400 flex items-center justify-center">
                          <span className="text-white text-xs">⏱</span>
                        </div>
                        <span>{m.meetingData?.duration}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-gray-400 flex items-center justify-center">
                          <span className="text-white text-xs">📅</span>
                        </div>
                        <span>{m.meetingData?.datetime}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-gray-400 flex items-center justify-center">
                          <span className="text-white text-xs">👥</span>
                        </div>
                        <span>{m.meetingData?.guests}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-gray-400 flex items-center justify-center">
                          <span className="text-white text-xs">🌍</span>
                        </div>
                        <span>{m.meetingData?.location}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : m.type === "calendar" ? (
                // calendar message
                <div key={m.id} className="mr-auto">
                  <CalendarPopup
                    isOpen={true}
                    onClose={() => {}}
                    onDateSelect={handleDateSelect}
                  />
                </div>
              ) : (
                <div className="flex items-end gap-5">
                  <Image src={think} alt="icon" className="w-9 h-9" />
                  <div
                    key={m.id}
                    className=" px-[16px] py-[9px] rounded-[10px] rounded-bl-none bg-[#F0F6FF] text-black mr-auto max-w-md whitespace-pre-wrap"
                  >
                    {m.content}
                  </div>
                </div>
              )
            )}

            {/* Time slot UI inside messages area */}
            {showTimes && (
              <div className="p-6 bg-[#F2F2F2] rounded-[20px] max-w-[560px] mx-auto">
                {/* Header with back arrow */}
                <div className="flex items-center mb-4">
                  <button
                    onClick={() => {
                      setShowTimes(false);
                      setShowCalendar(true);
                      setStep("date");
                    }}
                    className="mr-3 text-gray-600 hover:text-gray-800"
                  >
                    <Image alt="back logo" src={previous} />
                  </button>
                </div>

                {/* Date and timezone info */}
                <div className="mb-5">
                  <h3 className="text-2xl font-medium leading-[34px] tracking-[-0.02em] text-black mb-2">
                    {new Date(booking.date).toLocaleDateString("en-US", {
                      weekday: "long",
                    })}
                  </h3>
                  <p className="text-sm text-[#4D4D4D] leading-[22px] tracking-0 mb-5">
                    {new Date(booking.date).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>

                  <div className="mb-5">
                    <p className="text-base text-black leading-[26px] tracking-0 font-bold mb-[6px]">
                      Time zone
                    </p>
                    <div className="flex items-center gap-3 text-sm leading-[22px] tracking-0 text-black">
                      {/* <span className="mr-3">🌍</span> */}
                      <Image alt="globe" src={globe} />
                      <span>{getCurrentDhakaTime()}</span>
                    </div>
                  </div>
                </div>

                {/* Time selection */}
                <div className="">
                  <h4 className="text-2xl leading-[34px] tracking-[-0.02em] text-black mb-2">
                    Select a Time
                  </h4>
                  <p className="text-sm leading-[22px] tracking-0 text-black mb-8">
                    Duration: 30 min
                  </p>
                </div>

                <div className="space-y-2">
                  {[
                    "3:00 pm",
                    "3:30 pm",
                    "4:00 pm",
                    "4:30 pm",
                    "5:00 pm",
                    "5:30 pm",
                    "6:00 pm",
                  ].map((t) => (
                    <button
                      key={t}
                      onClick={() => handleTimeClick(t)}
                      className={`block w-full text-center px-[18px] py-[7px] text-[#1158E5] hover:bg-[#4D4D4D] hover:text-[#FFFFFF] rounded-[44px] border border-black/10 ${
                        selectedTime === t
                          ? "bg-[#4D4D4D] text-white"
                          : "bg-[#F2F2F2] text-[#1158E5]"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleTimeNext}
                  disabled={!selectedTime}
                  className={
                    "w-full px-[28px] py-[12px] rounded-[44px] text-sm leading-[22px] font-medium tracking-0 bg-[#1158E5] text-white mt-5"
                  }
                >
                  Next
                </button>
              </div>
            )}

            {/* services */}
            {showServices && (
              <div className="p-5 bg-[#F2F2F2] rounded-[20px] max-w-[560px] mx-auto">
                {/* Header with back arrow */}
                <div className="flex items-center mb-5">
                  <button
                    onClick={() => {
                      setShowServices(false);
                      setShowTimes(true);
                      setStep("time");
                    }}
                    className="mr-3 text-gray-600 hover:text-gray-800"
                  >
                    <Image alt="back logo" src={previous} />
                  </button>
                </div>

                {/* Meeting details header */}
                <div className="mb-6 border-b">
                  <h3 className="text-2xl font-medium leading-[34px] tracking-[0.02em] text-black max-w-[350px] mb-2">
                    30 Minute Complimentary Discovery Call
                  </h3>

                  <div className="space-y-2 ">
                    <div className="flex items-center gap-3">
                      {/* <span>⏱</span> */}
                      <Image alt="time" src={time} />
                      <span className="text-sm text-[#4D4D4D] leading-[22px] tracking-0">
                        30 min
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* <span>📅</span> */}

                      <Image alt="slot" src={slot} />
                      <span className="text-sm leading-[22px] tracking-0 text-[#4D4D4D]">
                        {booking.time} - {getEndTime(booking.time)},{" "}
                        {new Date(booking.date).toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* <span>🌍</span> */}
                      <Image src={globe} alt="globe" />
                      <span className="text-sm leading-[22px] tracking-0 text-[#4D4D4D]">
                        {getCurrentDhakaTime()}
                      </span>
                    </div>
                  </div>

                  <button className="text-[#1158E5] px-[18px] py-[7px] rounded-[44px] border border-black/10 text-[18px] leading-[30px] tracking-0 mt-8 font-medium mb-5">
                    Add Guest
                  </button>
                  {/* <hr className="w-full" /> */}
                </div>

                {/* Services selection */}
                <div className="mb-6">
                  <h4 className="text-base font-medium text-black leading-[24px] tracking-0 mb-5">
                    Which of our services are you most interested in?
                  </h4>

                  <div className="space-y-3">
                    {[
                      { icon: "⚡", name: "Web & App Development" },
                      { icon: "🎨", name: "User experience design" },
                      { icon: "📊", name: "Strategy & digital marketing" },
                      { icon: "📹", name: "Video production & photography" },
                      { icon: "💬", name: "Branding & communication" },
                      { icon: "🔍", name: "Search engine optimization" },
                      { icon: "📈", name: "Resource augmentation" },
                    ].map((service) => (
                      <button
                        key={service.name}
                        onClick={() => handleServiceToggle(service.name)}
                        className={` text-left px-[18px] py-[7px] rounded-[44px] border border-black/10 ${
                          selectedServices.includes(service.name)
                            ? "bg-[#4D4D4D] border-black/10 text-white"
                            : " border-black/10 text-[#1158E5]"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span>{service.icon}</span>
                          <span className="font-medium">{service.name}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Confirm button */}
                <button
                  onClick={handleServicesConfirm}
                  className="w-full py-3 rounded-[44px] font-medium bg-[#1158E5] text-white hover:bg-[#0E47C7] transition-colors"
                >
                  Confirm
                </button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input - Always show unless calendar or time picker is open */}
          {!showCalendar && !showTimes && !showServices && (
            <form
              onSubmit={handleSubmit}
              className="flex gap-5 mb-5 px-5 border-t border-t-black/10 pt-5"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your response..."
                className="flex-1 px-[16px] py-[9px] bg-[#F2F2F2] rounded-[60px]"
                disabled={isLoading}
              />
              <button type="submit" disabled={isLoading}>
                <Image src={submit} alt="submit" />
              </button>
            </form>
          )}

          <Footer />
        </div>
      )}
    </div>
  );
}
