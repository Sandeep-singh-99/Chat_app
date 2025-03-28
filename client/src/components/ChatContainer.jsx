import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef, useState, memo } from "react";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../utils/utils";
import { ImageModal } from "./ImageModal";
import { Download, File, Trash2, Copy } from "lucide-react";
import toast from "react-hot-toast";

const MessageItem = memo(
  ({
    message,
    authUser,
    selectedUser,
    onDelete,
    onDownload,
    onCopy,
    isDeleting,
  }) => {
    const isSender = message.senderId === authUser._id;

    return (
      <div
        className={`chat ${
          isSender ? "chat-end" : "chat-start"
        } group relative`}
      >
        <div className="chat-image avatar">
          <div className="size-10 rounded-full border">
            <img
              src={
                isSender
                  ? authUser.profilePic || "/avatar.png"
                  : selectedUser.profilePic || "/avatar.png"
              }
              alt="profile pic"
            />
          </div>
        </div>
        <div className="chat-header mb-1">
          <time className="text-xs opacity-50 ml-1">
            {formatMessageTime(message.createdAt)}
          </time>
        </div>
        <div className="chat-bubble flex flex-col relative">
          {message.image && (
            <div className="relative">
              <img
                src={message.image}
                alt="Attachment"
                className="sm:max-w-[200px] rounded-md mb-2 cursor-pointer"
                onClick={() => onDownload(message.image, true)} 
              />
            </div>
          )}
          {message.videos && (
            <div className="relative">
              <video
                src={message.videos}
                controls
                className="sm:max-w-[200px] rounded-md mb-2 cursor-pointer"
                onClick={
                  (e) =>
                    e.target.paused &&
                    onDownload(
                      message.videos,
                      false,
                      `chat-video-${message._id}`
                    ) // Direct download if paused
                }
              />
            </div>
          )}
          {message.file && (
            <div className="mb-2">
              <a
                href={message.file}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline flex items-center gap-1"
              >
                <File size={20} />
                View File
              </a>
            </div>
          )}
          {message.text && (
            <p className="break-words whitespace-pre-wrap overflow-hidden text-ellipsis">
              {message.text}
            </p>
          )}
        </div>

        <div
          className={`absolute top-0 ${
            isSender ? "right-0 mr-2" : "left-0 ml-2"
          } mt-[-20px] opacity-0 group-hover:opacity-100 transition-opacity duration-200`}
        >
          <div className="flex items-center gap-2 bg-gray-800 bg-opacity-90 rounded-lg p-1 shadow-lg">
            {/* Copy button - available to both sender and receiver for text-only messages */}
            {message.text && !message.image && !message.videos && (
              <button
                onClick={() => onCopy(message.text)}
                className="p-1 hover:bg-gray-700 rounded"
                title="Copy"
              >
                <Copy size={16} className="text-white" />
              </button>
            )}
            {/* Download/Preview button - available to both sender and receiver */}
            {(message.image || message.videos) && (
              <button
                onClick={() =>
                  onDownload(
                    message.image || message.videos,
                    message.image ? true : false, 
                    message.image
                      ? `chat-image-${message._id}`
                      : `chat-video-${message._id}`
                  )
                }
                className="p-1 hover:bg-gray-700 rounded"
                title={message.image ? "Preview" : "Download"}
              >
                <Download size={16} className="text-white" />
              </button>
            )}
            {/* Delete button - only for sender */}
            {isSender && (
              <button
                onClick={() => onDelete(message._id)}
                disabled={isDeleting}
                className={`p-1 hover:bg-red-700 rounded ${
                  isDeleting ? "opacity-50 cursor-not-allowed" : ""
                }`}
                title="Delete"
              >
                <Trash2 size={16} className="text-white" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }
);

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    deleteMessage,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [deletingMessageId, setDeletingMessageId] = useState(null);

  useEffect(() => {
    if (selectedUser?._id) {
      getMessages(selectedUser._id);
      subscribeToMessages();
    }
    return () => unsubscribeFromMessages();
  }, [
    selectedUser?._id,
    getMessages,
    subscribeToMessages,
    unsubscribeFromMessages,
  ]);

  useEffect(() => {
    if (messageEndRef.current && messages)
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleDownload = (mediaUrl, isImagePreview = false, fileName) => {
    if (isImagePreview) {
      setSelectedImage(mediaUrl); 
      return;
    }

    fetch(mediaUrl)
      .then((response) => {
        if (!response.ok) throw new Error("Network response was not ok");
        return response.blob();
      })
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = fileName || "video.mp4"; 
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        toast.success("Video download started");
      })
      .catch((error) => {
        console.error("Download failed:", error);
        toast.error("Failed to download video");
      });
  };

  const handleDeleteMessage = async (messageId) => {
    if (
      deletingMessageId ||
      !window.confirm("Are you sure you want to delete this message?")
    )
      return;

    setDeletingMessageId(messageId);
    try {
      await deleteMessage(messageId);
      toast.success("Message deleted");
    } catch (error) {
      toast.error("Failed to delete message");
    } finally {
      setDeletingMessageId(null);
    }
  };

  const handleCopyMessage = (text) => {
    if (!text) return toast.error("No text to copy");
    navigator.clipboard
      .writeText(text)
      .then(() => toast.success("Message copied to clipboard"))
      .catch((error) => {
        console.error("Copy failed:", error);
        toast.error("Failed to copy message");
      });
  };

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <MessageItem
            key={message._id}
            message={message}
            authUser={authUser}
            selectedUser={selectedUser}
            onDelete={handleDeleteMessage}
            onDownload={handleDownload}
            onCopy={handleCopyMessage}
            isDeleting={deletingMessageId === message._id}
          />
        ))}
        <div ref={messageEndRef} />
      </div>
      <MessageInput />
      <ImageModal
        imageUrl={selectedImage}
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
      />
    </div>
  );
};

export default ChatContainer;
