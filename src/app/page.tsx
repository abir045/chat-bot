"use client";
import SimpleChat from "@/components/simple-chat";
import Image from "next/image";
import think from "../../public/images/think.png";
import { useState } from "react";

export default function Home() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  return (
    <>
      <div className="relative">
        {/* Floating chat toggle button */}
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="fixed bottom-6 right-6 bg-black p-3 rounded-full shadow-lg"
        >
          <Image src={think} alt="Chat" width={30} height={30} />
        </button>

        {/* Chat box (only visible when open) */}
        {isOpen && (
          <div className="fixed bottom-20 right-6 max-w-[600px] h-auto bg-white shadow-xl rounded-xl border">
            <SimpleChat />
          </div>
        )}
      </div>
    </>
  );
}
