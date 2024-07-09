import React, { useState } from "react";
import Link from "next/link";

const FeedbackBanner = ({ onClose }: { onClose: () => void }) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = () => {
    setIsVisible(false);
  };

  return (
    <div
      className={`fixed top-[70px] left-0 z-50 right-0 bg-clouddark font-custombold text-lg w-full text-center py-4 flex justify-center items-center transition-all duration-500 ease-in-out transform ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="flex justify-center items-center">
        <span className="mr-2">ℹ️</span>
          <span>IllinEats is powered by students like you. We'd love if you could fill out this
        <Link
          href="https://forms.gle/4YrhMhBimhmBjuUG7"
          className="text-uiucblue underline ml-2"
          target="_blank"
          rel="noopener noreferrer"
        >
          feedback form!
        </Link>
        </span>
      </div>
      <button
        onClick={() => {
          handleClose();
          onClose();
        }}
        className="absolute right-4"
      >
        X
      </button>{" "}
    </div>
  );
};

export default FeedbackBanner;
