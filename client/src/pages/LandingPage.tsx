import React, { useState, useEffect } from 'react';
import { HelpCircle, ChevronRight, Play } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { AVATAR_COLORS, AVATAR_EMOJIS, Avatar } from '../components/Avatar';

interface LandingPageProps {
  prefilledRoomId?: string;
  onCreateRoom: (name: string, avatar: string, color: string) => void;
  onJoinRoom: (roomId: string, name: string, avatar: string, color: string) => void;
  error?: string | null;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  prefilledRoomId = '',
  onCreateRoom,
  onJoinRoom,
  error
}) => {
  const [name, setName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState(AVATAR_EMOJIS[0]);
  const [selectedColor, setSelectedColor] = useState(AVATAR_COLORS[0]);
  const [roomId, setRoomId] = useState(prefilledRoomId);
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  // Sync state if URL code changes
  useEffect(() => {
    if (prefilledRoomId) {
      setRoomId(prefilledRoomId);
    }
  }, [prefilledRoomId]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreateRoom(name.trim(), selectedEmoji, selectedColor);
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !roomId.trim()) return;
    onJoinRoom(roomId.toUpperCase().trim(), name.trim(), selectedEmoji, selectedColor);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative z-10 text-white">
      {/* Title Header */}
      <div className="text-center mb-6 flex flex-col items-center">
        <img
          src="/logo.png"
          alt="Verdict Logo"
          className="w-24 h-24 md:w-28 md:h-28 rounded-3xl mb-4 shadow-2xl shadow-red-600/10 border border-red-500/10 animate-pulse-slow select-none"
        />
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-rose-500 to-[#ed64a6] select-none uppercase leading-none">
          Verdict
        </h1>
        <p className="text-gray-400 mt-3 text-sm md:text-base font-semibold max-w-sm mx-auto">
          Secretly rank your friends. Let them guess the prompt. Prepare for chaos.
        </p>
      </div>

      <div className="w-full max-w-md flex flex-col gap-4">
        {/* Main Customization Card */}
        <Card className="flex flex-col gap-5 p-6" glow="purple">
          <h2 className="text-xl font-bold border-b border-[#222230] pb-2">Create Your Profile</h2>
          
          {error && (
            <div className="bg-red-950/60 border border-red-500/50 text-red-300 text-sm px-4 py-2.5 rounded-2xl font-bold">
              {error}
            </div>
          )}

          {/* Name Input */}
          <div className="flex flex-col gap-2">
            <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Nickname</label>
            <input
              type="text"
              maxLength={12}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter name..."
              className="bg-[#0a0a0c] border border-[#222230] text-white px-4 py-3 rounded-2xl focus:outline-none focus:border-[#9f7aea] focus:ring-1 focus:ring-[#9f7aea] font-bold"
            />
          </div>

          {/* Avatar Preview */}
          <div className="flex justify-center py-2">
            <Avatar emoji={selectedEmoji} color={selectedColor} size="lg" />
          </div>

          {/* Emoji Selection Grid */}
          <div className="flex flex-col gap-2">
            <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Select Emoji</label>
            <div className="grid grid-cols-8 gap-2 max-h-24 overflow-y-auto bg-[#0a0a0c] p-2.5 rounded-2xl border border-[#222230] no-scrollbar">
              {AVATAR_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setSelectedEmoji(emoji)}
                  className={`text-2xl hover:scale-110 transition-transform p-1 rounded-lg ${selectedEmoji === emoji ? 'bg-[#222230]' : ''}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Color Selection List */}
          <div className="flex flex-col gap-2">
            <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Select Border Color</label>
            <div className="flex items-center gap-2 justify-between bg-[#0a0a0c] p-3 rounded-2xl border border-[#222230] overflow-x-auto no-scrollbar">
              {AVATAR_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className="w-7 h-7 rounded-full shrink-0 border-2 transition-transform hover:scale-110"
                  style={{
                    backgroundColor: color,
                    borderColor: selectedColor === color ? '#ffffff' : 'transparent',
                    boxShadow: selectedColor === color ? `0 0 10px ${color}` : 'none'
                  }}
                />
              ))}
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex flex-col gap-3 mt-2">
            {prefilledRoomId ? (
              <Button
                variant="primary"
                size="lg"
                onClick={handleJoin}
                disabled={!name.trim()}
                className="w-full"
              >
                Join Room <ChevronRight className="ml-1" size={18} />
              </Button>
            ) : (
              <>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleCreate}
                  disabled={!name.trim()}
                  className="w-full"
                >
                  Create Room <Play className="ml-2" size={18} />
                </Button>

                <div className="flex items-center gap-2 my-1">
                  <div className="flex-1 h-px bg-[#222230]" />
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">or</span>
                  <div className="flex-1 h-px bg-[#222230]" />
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter Code..."
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                    className="flex-1 bg-[#0a0a0c] border border-[#222230] text-center text-white px-4 py-3 rounded-2xl focus:outline-none focus:border-[#9f7aea] font-bold uppercase tracking-widest"
                  />
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={handleJoin}
                    disabled={!name.trim() || !roomId.trim()}
                    className="whitespace-nowrap"
                  >
                    Join Room
                  </Button>
                </div>
              </>
            )}
          </div>
        </Card>

        {/* How to Play Trigger */}
        <button
          onClick={() => setShowHowToPlay(true)}
          className="flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-white transition-colors py-2 font-semibold"
        >
          <HelpCircle size={16} /> How to Play
        </button>
      </div>

      {/* Rules Modal */}
      {showHowToPlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <Card className="max-w-md w-full p-6 flex flex-col gap-4 border-[#9f7aea]/40" glow="purple">
            <h2 className="text-2xl font-extrabold text-[#9f7aea] border-b border-[#222230] pb-2 uppercase tracking-wide">
              How To Play
            </h2>
            <div className="flex flex-col gap-3.5 text-sm text-gray-300">
              <div className="flex gap-3">
                <span className="flex items-center justify-center shrink-0 w-6 h-6 rounded-full bg-[#9f7aea] text-black font-extrabold">1</span>
                <p>One player is selected as the <strong>Ranker</strong> and receives a secret prompt (e.g. <em>"Worst driver"</em>).</p>
              </div>
              <div className="flex gap-3">
                <span className="flex items-center justify-center shrink-0 w-6 h-6 rounded-full bg-[#ed64a6] text-black font-extrabold">2</span>
                <p>The Ranker orders all players from <strong>#1 to last</strong> using drag-and-drop based on that prompt.</p>
              </div>
              <div className="flex gap-3">
                <span className="flex items-center justify-center shrink-0 w-6 h-6 rounded-full bg-[#319795] text-black font-extrabold">3</span>
                <p>The completed ranking is shown to everyone else, but the prompt remains hidden!</p>
              </div>
              <div className="flex gap-3">
                <span className="flex items-center justify-center shrink-0 w-6 h-6 rounded-full bg-indigo-500 text-black font-extrabold">4</span>
                <p>Guessers choose the correct prompt from 4 multiple-choice options. You get points for speed and accuracy!</p>
              </div>
              <div className="flex gap-3">
                <span className="flex items-center justify-center shrink-0 w-6 h-6 rounded-full bg-yellow-500 text-black font-extrabold">5</span>
                <p>Rankers score +100 points for each player who guessed correctly. Rank honestly so your friends can guess it!</p>
              </div>
            </div>
            <Button
              variant="primary"
              size="md"
              onClick={() => setShowHowToPlay(false)}
              className="mt-2"
            >
              Let's Play
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
};
