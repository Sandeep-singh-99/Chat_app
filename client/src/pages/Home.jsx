import React, { useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { ChevronLeft } from "lucide-react";
import ChatContainer from "../components/ChatContainer";
import NoChatSelected from "../components/NoChatSelected";
import SideBar from "../components/SideBar";

export default function Home() {
  const { selectedUser, setSelectedUser } = useChatStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleBack = () => {
    setIsSidebarOpen(true);
    setSelectedUser(null);
  };

  const isUserChat = selectedUser != null;

  return (
    <div className="h-screen bg-base-200">
      <div className="flex items-center justify-center pt-20 lg:px-4 px-2">
        <div className="bg-base-100 rounded-lg shadow-lg w-full max-w-8xl lg:h-[calc(100vh-8rem)] h-[calc(100vh-5rem)]">
          <div className="flex h-full rounded-lg overflow-hidden">
            {/* Sidebar */}
            <div
              className={`${
                isSidebarOpen && !isUserChat
                  ? "w-full lg:w-96"
                  : isUserChat
                  ? "hidden lg:block lg:w-96"
                  : ""
              } transition-all duration-200 border-r border-base-300`}
            >
              <SideBar />
            </div>

            {/* Chat Area */}
            <div
              className={`${
                isUserChat ? "w-full lg:flex-1" : "hidden lg:flex lg:flex-1"
              } flex flex-col transition-all duration-200`}
            >
              {isUserChat && (
                <button
                  onClick={handleBack}
                  className="lg:hidden p-4 text-left font-medium flex items-center gap-2 bg-base-100 border-b border-base-300"
                >
                  <ChevronLeft size={25} />
                  Back
                </button>
              )}

              {isUserChat ? (
                <ChatContainer />
              ) : (
                <div className="flex w-full h-full justify-center items-center">
                  <NoChatSelected />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
