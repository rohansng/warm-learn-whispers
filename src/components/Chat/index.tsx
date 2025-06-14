
import React, { useState } from 'react';
import ChatButton from './ChatButton';
import ChatWindow from './ChatWindow';

interface ChatSystemProps {
  userId: string;
}

const ChatSystem: React.FC<ChatSystemProps> = ({ userId }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <ChatButton 
        onClick={() => setIsOpen(true)} 
        isOpen={isOpen}
      />
      {isOpen && (
        <ChatWindow 
          onClose={() => setIsOpen(false)}
          userId={userId}
        />
      )}
    </>
  );
};

export default ChatSystem;
