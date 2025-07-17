import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle, faExclamationCircle, faInfoCircle, faTimes } from "@fortawesome/free-solid-svg-icons";

const Notification = ({ notification, onClose }) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    setVisible(true);
    return () => setVisible(false);
  }, [notification]);

  let icon, bgColor;
  if (notification.type === "success") {
    icon = faCheckCircle;
    bgColor = "bg-green-500";
  } else if (notification.type === "error") {
    icon = faExclamationCircle;
    bgColor = "bg-red-500";
  } else {
    icon = faInfoCircle;
    bgColor = "bg-blue-500";
  }

  return (
    <div
      className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${bgColor} text-white flex items-center min-w-[250px] transition-all duration-300 ease-in-out
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
      role="alert"
    >
      <FontAwesomeIcon icon={icon} className="mr-2 text-xl" />
      <span className="flex-1">{notification.message}</span>
      <button
        className="ml-4 text-white hover:text-gray-200 focus:outline-none"
        onClick={() => {
          setVisible(false);
          setTimeout(onClose, 300);
        }}
        aria-label="Close notification"
      >
        <FontAwesomeIcon icon={faTimes} />
      </button>
    </div>
  );
};

export default Notification; 