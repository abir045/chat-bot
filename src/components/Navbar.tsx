"use client";
import { Minus, X } from "lucide-react";
import minus from "../../public/images/minus.png";
import Image from "next/image";
import close from "../../public/images/close.png";

interface NavbarProps {
  onMinimize: () => void;
  onClose: () => void;
}

const Navbar = ({ onMinimize, onClose }: NavbarProps) => {
  //   const handleMinimize = () => {
  //     console.log("Minimize clicked");

  //   };

  //   const handleClose = () => {
  //     console.log("Close clicked");

  //   };

  return (
    <div className="bg-gray-900 text-white px-4 py-3 flex items-center justify-between rounded-t-lg">
      {/* Title */}
      <h1 className="text-2xl font-bold leading-[34px] tracking-[-0.02em]">
        Chating Bot
      </h1>

      {/* Control Buttons */}
      <div className="flex items-center gap-5">
        {/* Minimize Button */}
        <button
          onClick={onMinimize}
          className="w-6 h-6 flex items-center justify-center hover:bg-gray-700 rounded transition-colors duration-200"
          aria-label="Minimize"
        >
          {/* <Minus className="w-3 h-3" /> */}
          <Image src={minus} alt="minus" />
        </button>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-6 h-6 flex items-center justify-center hover:bg-red-600 rounded transition-colors duration-200"
          aria-label="Close"
        >
          <Image src={close} alt="close" />
          {/* <X className="w-3 h-3" /> */}
        </button>
      </div>
    </div>
  );
};

export default Navbar;
