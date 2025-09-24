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
  type?: "text" | "meeting-card";
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
    setIsClosed(true);
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
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

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
      ]);
      setShowCalendar(true);
      setStep("date");
    } else if (step === "summary") {
      const payload: BookingData = {
        date: booking.date,
        time: booking.time,
        user_email: booking.user_email,
        summary: userMessage.content,
        description: userMessage.content,
        guest_emails: [booking.user_email],
      };

      console.log("User ID:", userId);
      console.log("Final Booking Payload:", payload);

      finalizeBooking(payload);
    } else if (step === "idle") {
      try {
        const res = await fetch(`/api/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            message: userMessage.content,
            messages: messages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
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
            content: data.message || "I received your message!",
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
    setIsLoading(false);
  };

  const handleDateSelect = (date: Date) => {
    const formattedDate = date.toISOString().split("T")[0];
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

  const handleTimeClick = (time: string) => {
    setSelectedTime(time);
  };

  const handleTimeNext = () => {
    if (selectedTime) {
      setBooking((prev) => ({ ...prev, time: selectedTime }));
      setShowTimes(false);
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
    if (selectedServices.length === 0) return;

    const summary = selectedServices.join(", ");

    const payload: BookingData = {
      date: booking.date,
      time: selectedTime,
      user_email: booking.user_email,
      summary: summary,
      description: `Meeting to discuss: ${summary}`,
      guest_emails: [booking.user_email],
    };

    console.log("User ID:", userId);
    console.log("Final Booking Payload:", payload);

    setShowServices(false);
    finalizeBooking(payload);
  };

  if (isClosed) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-[600px]">
      <CalendarPopup
        isOpen={showCalendar}
        onClose={() => setShowCalendar(false)}
        onDateSelect={handleDateSelect}
      />

      {/* ✅ Show only icon when minimized */}
      {isMinimized ? (
        <button
          onClick={() => setIsMinimized(false)}
          className="w-14 h-14 rounded-full  flex items-center justify-center shadow-lg"
          aria-label="Open Chat"
        >
          <Image src={think} alt="chat icon" className="w-8 h-8" />
        </button>
      ) : (
        <div className="max-w-[600px] h-[50vh] bg-white shadow-xl rounded-xl border flex flex-col overflow-hidden">
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
                <div key={m.id} className="mr-auto max-w-md">
                  <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <h3 className="font-semibold text-gray-900 text-lg mb-3">
                      {m.meetingData?.summary}
                    </h3>
                  </div>
                </div>
              ) : (
                <div
                  key={m.id}
                  className="px-[16px] py-[9px] rounded-[10px] rounded-bl-none bg-[#F0F6FF] text-black mr-auto max-w-md whitespace-pre-wrap"
                >
                  {m.content}
                </div>
              )
            )}

            <div ref={messagesEndRef} />
          </div>

          {!showCalendar && !showTimes && !showServices && (
            <form onSubmit={handleSubmit} className="flex gap-5 mb-5 px-5">
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
