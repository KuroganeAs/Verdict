import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Card } from './ui/Card';

interface RoomInviteProps {
  roomId: string;
}

export const RoomInvite: React.FC<RoomInviteProps> = ({ roomId }) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const inviteLink = `${window.location.origin}/room/${roomId}`;

  const copyCode = () => {
    navigator.clipboard.writeText(roomId);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <Card className="flex flex-col gap-4 p-5 max-w-sm w-full mx-auto" glow="purple">
      <h3 className="text-center font-bold text-gray-400 text-sm tracking-wider uppercase">Invite Friends</h3>
      <div className="flex flex-col gap-3">
        {/* Room Code Box */}
        <div className="flex items-center justify-between bg-[#0a0a0c] border border-[#1a1a24] px-4 py-3 rounded-2xl">
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-500 font-semibold uppercase">Room Code</span>
            <span className="text-2xl font-extrabold tracking-widest text-white">{roomId}</span>
          </div>
          <button
            onClick={copyCode}
            className="p-2.5 rounded-xl bg-[#121217] hover:bg-[#1a1a24] transition-colors border border-[#1a1a24] text-[#9f7aea] hover:text-white"
          >
            {copiedCode ? <Check size={18} className="text-emerald-500" /> : <Copy size={18} />}
          </button>
        </div>

        {/* Share Link Box */}
        <div className="flex items-center justify-between bg-[#0a0a0c] border border-[#1a1a24] px-4 py-3 rounded-2xl">
          <div className="flex flex-col overflow-hidden mr-2">
            <span className="text-[10px] text-gray-500 font-semibold uppercase">Share Link</span>
            <span className="text-xs text-gray-300 font-mono truncate">{inviteLink}</span>
          </div>
          <button
            onClick={copyLink}
            className="p-2.5 rounded-xl bg-[#121217] hover:bg-[#1a1a24] transition-colors border border-[#1a1a24] text-[#9f7aea] hover:text-white"
          >
            {copiedLink ? <Check size={18} className="text-emerald-500" /> : <Copy size={18} />}
          </button>
        </div>
      </div>
    </Card>
  );
};
