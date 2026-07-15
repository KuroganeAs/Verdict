import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Trophy, Timer, Check, AlertCircle, ArrowRight, RefreshCw, Star } from 'lucide-react';
import { RoomState, Player } from '../types/game';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/Avatar';
import { DragRanker } from '../components/DragRanker';

interface GamePageProps {
  roomState: RoomState;
  playerId: string;
  onSubmitRanking: (orderedIds: string[]) => void;
  onSubmitGuess: (guess: string) => void;
  onNextRound: () => void;
  onPlayAgain: () => void;
}

export const GamePage: React.FC<GamePageProps> = ({
  roomState,
  playerId,
  onSubmitRanking,
  onSubmitGuess,
  onNextRound,
  onPlayAgain
}) => {
  const {
    phase,
    players,
    hostId,
    currentRound,
    maxRounds,
    rankerId,
    prompt,
    rankingList,
    choices,
    guesses,
    roundWinnerId
  } = roomState;

  const localPlayer = players.find(p => p.id === playerId);
  const isHost = localPlayer?.isHost || false;
  const isRanker = rankerId === playerId;
  const rankerPlayer = players.find(p => p.id === rankerId);

  // --- Guessing State Hook ---
  const [selectedGuess, setSelectedGuess] = useState<string | null>(null);
  const [guessSubmitted, setGuessSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(45);

  // Reset local guessing state on phase change
  useEffect(() => {
    if (phase === 'GUESSING') {
      setSelectedGuess(null);
      setGuessSubmitted(false);
      setTimeLeft(45);
    }
  }, [phase]);

  // Guessing timer countdown (client visual sync)
  useEffect(() => {
    if (phase !== 'GUESSING' || guessSubmitted) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [phase, guessSubmitted]);

  const handleGuessSubmit = () => {
    if (selectedGuess && !guessSubmitted) {
      onSubmitGuess(selectedGuess);
      setGuessSubmitted(true);
    }
  };

  // Helper to map ordered ID array to player objects
  const getOrderedPlayers = (): Player[] => {
    if (!rankingList) return [];
    return rankingList
      .map(id => players.find(p => p.id === id))
      .filter((p): p is Player => !!p);
  };

  // --- RENDER PHASE: RANKING ---
  if (phase === 'RANKING') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 relative z-10 text-white max-w-2xl mx-auto w-full">
        <div className="w-full flex flex-col gap-6">
          {/* Round Header */}
          <div className="flex justify-between items-center text-sm font-bold text-gray-400 border-b border-[#222230] pb-2 select-none">
            <span>ROUND {currentRound} / {maxRounds}</span>
            <span className="bg-[#9f7aea]/20 text-[#9f7aea] px-3 py-1 rounded-full uppercase tracking-wider text-[10px]">
              {isRanker ? 'Your Turn' : `${rankerPlayer?.name}'s Turn`}
            </span>
          </div>

          {isRanker ? (
            <div className="flex flex-col gap-6">
              {/* Prompt Card */}
              <Card className="text-center p-8 flex flex-col gap-2" glow="purple">
                <span className="text-xs text-[#9f7aea] font-extrabold uppercase tracking-widest select-none">
                  Secret Prompt ({prompt?.category})
                </span>
                <h2 className="text-3xl md:text-4xl font-extrabold text-white select-text">
                  {prompt?.text}
                </h2>
                <p className="text-xs text-gray-400 mt-2 font-semibold select-none">
                  Rank everyone from top (#1) to bottom. Be honest so others can guess!
                </p>
              </Card>

              {/* Drag and Drop list */}
              <DragRanker
                players={players.filter(p => !p.isDisconnected)}
                onSubmit={onSubmitRanking}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 gap-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-4 border-[#9f7aea]/20 border-t-[#9f7aea] animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center text-3xl select-none">
                  🤫
                </div>
              </div>
              <div className="text-center max-w-sm">
                <h2 className="text-2xl font-bold text-white mb-2">
                  {rankerPlayer?.name} is Ranking...
                </h2>
                <p className="text-gray-400 text-sm font-semibold">
                  They are secretly ordering the lobby based on a hidden prompt. Prepare your guesses!
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- RENDER PHASE: GUESSING ---
  if (phase === 'GUESSING') {
    const ordered = getOrderedPlayers();
    const activeGuessers = players.filter(p => p.id !== rankerId && !p.isDisconnected);
    const guessCount = activeGuessers.filter(p => guesses[p.id] !== undefined).length;

    return (
      <div className="min-h-screen flex flex-col md:flex-row items-stretch justify-center p-4 gap-6 relative z-10 text-white max-w-5xl mx-auto w-full">
        {/* Left Column: The Rankings */}
        <div className="w-full md:w-1/2 flex flex-col gap-4">
          <div className="flex justify-between items-center text-sm font-bold text-gray-400 border-b border-[#222230] pb-2 select-none">
            <span>ROUND {currentRound} / {maxRounds}</span>
            <span className="text-[#ed64a6] uppercase tracking-wider text-xs">The Rankings</span>
          </div>

          <Card className="flex flex-col gap-4 p-5 flex-1 max-h-[75vh] overflow-y-auto no-scrollbar" glow="pink">
            <div className="text-center border-b border-[#222230] pb-2">
              <h3 className="text-gray-400 text-xs font-extrabold uppercase tracking-widest">Ranked by {rankerPlayer?.name}</h3>
            </div>
            
            <div className="flex flex-col gap-2.5">
              {ordered.map((player, idx) => (
                <div
                  key={player.id}
                  className={`flex items-center gap-3 border px-4 py-3 rounded-2xl bg-[#0a0a0c]/40
                    ${idx === 0 ? 'border-yellow-500/50 bg-yellow-500/5 text-yellow-500' : idx === 1 ? 'border-gray-400/30' : idx === 2 ? 'border-amber-600/30' : 'border-[#222230] text-gray-400'}`}
                >
                  <span className="font-extrabold text-lg w-7 text-center">#{idx + 1}</span>
                  <Avatar emoji={player.avatar} color={player.color} size="sm" />
                  <span className="font-bold text-base truncate text-white">{player.name}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column: Choices or Wait screen */}
        <div className="w-full md:w-1/2 flex flex-col gap-4">
          <div className="flex justify-between items-center text-sm font-bold text-gray-400 border-b border-[#222230] pb-2 select-none">
            <span className="flex items-center gap-1.5">
              <Timer size={16} className={timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-gray-400'} />
              <span className={timeLeft < 10 ? 'text-red-500 font-extrabold' : ''}>{timeLeft}s</span>
            </span>
            <span className="text-[#319795] uppercase tracking-wider text-xs">
              Guesses: {guessCount} / {activeGuessers.length}
            </span>
          </div>

          {isRanker ? (
            <Card className="flex flex-col items-center justify-center p-8 gap-6 flex-1" glow="purple">
              <div className="text-6xl animate-pulse">🤔</div>
              <div className="text-center max-w-sm">
                <h3 className="text-2xl font-bold text-white mb-2">Everyone is Guessing!</h3>
                <p className="text-gray-400 text-sm font-semibold mb-4">
                  They are trying to guess your secret prompt based on how you ranked everyone.
                </p>
                <div className="bg-[#0a0a0c] border border-[#222230] p-4 rounded-2xl flex flex-col gap-1 items-center justify-center">
                  <span className="text-[10px] text-gray-500 font-extrabold uppercase">Your Secret Prompt</span>
                  <span className="text-lg font-bold text-[#9f7aea]">{prompt?.text}</span>
                </div>
              </div>
            </Card>
          ) : guessSubmitted ? (
            <Card className="flex flex-col items-center justify-center p-8 gap-6 flex-1" glow="purple">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500 flex items-center justify-center text-emerald-500 shadow-lg shadow-emerald-500/10 select-none">
                <Check size={36} />
              </div>
              <div className="text-center max-w-sm">
                <h3 className="text-2xl font-bold text-white mb-2">Guess Submitted!</h3>
                <p className="text-gray-400 text-sm font-semibold">
                  Waiting for the other players to lock in their guesses.
                </p>
                <div className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#222230] text-gray-300 rounded-full text-xs font-bold border border-[#303045] select-none">
                  Locked In: {selectedGuess}
                </div>
              </div>
            </Card>
          ) : (
            <Card className="flex flex-col gap-5 p-6 flex-1" glow="purple">
              <div className="border-b border-[#222230] pb-2 text-center">
                <h3 className="text-base font-bold text-white">What was {rankerPlayer?.name}'s secret prompt?</h3>
                <span className="text-xs text-gray-400 font-bold block mt-1">Prompt Category: {prompt?.category}</span>
              </div>

              {/* Multiple choice list */}
              <div className="flex-1 flex flex-col gap-3 justify-center">
                {choices?.map((choice) => (
                  <button
                    key={choice}
                    onClick={() => setSelectedGuess(choice)}
                    className={`text-left px-5 py-4 rounded-2xl border font-bold text-base transition-all duration-200 select-text
                      ${selectedGuess === choice
                        ? 'border-[#9f7aea] bg-[#9f7aea]/10 text-white shadow-md shadow-[#9f7aea]/5'
                        : 'border-[#222230] bg-[#0a0a0c]/40 hover:bg-[#1a1a24]/50 hover:border-gray-500 text-gray-300'
                      }`}
                  >
                    {choice}
                  </button>
                ))}
              </div>

              <Button
                variant="primary"
                size="lg"
                onClick={handleGuessSubmit}
                disabled={!selectedGuess}
                className="w-full mt-2 animate-bounce-slow"
              >
                Submit Guess
              </Button>
            </Card>
          )}
        </div>
      </div>
    );
  }

  // --- RENDER PHASE: REVEAL ---
  if (phase === 'REVEAL') {
    const ordered = getOrderedPlayers();
    const correctText = prompt?.text || '';

    // Find the speed winner or correct guessers
    const correctGuessers = players.filter(p => p.id !== rankerId && guesses[p.id] === correctText);

    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 relative z-10 text-white max-w-4xl mx-auto w-full">
        <div className="w-full flex flex-col gap-6">
          {/* Header */}
          <div className="flex justify-between items-center text-sm font-bold text-gray-400 border-b border-[#222230] pb-2 select-none">
            <span>ROUND {currentRound} / {maxRounds}</span>
            <span className="text-[#319795] uppercase tracking-wider text-xs">Reveal Screen</span>
          </div>

          {/* Reveal Correct Answer Card */}
          <Card className="text-center p-8 flex flex-col gap-2 relative overflow-hidden" glow="purple">
            {/* Confetti-like ambient star background */}
            <div className="absolute top-2 left-4 text-2xl select-none animate-pulse">🎉</div>
            <div className="absolute bottom-2 right-4 text-2xl select-none animate-pulse">🎉</div>

            <span className="text-xs text-[#9f7aea] font-extrabold uppercase tracking-widest select-none">
              The Secret Prompt Was:
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white select-text">
              "{correctText}"
            </h2>
            <p className="text-xs text-gray-400 mt-2 font-semibold select-none">
              Ranked by {rankerPlayer?.name}
            </p>
          </Card>

          {/* Detailed results grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            {/* Left: Final order */}
            <Card className="flex flex-col gap-4 p-5 max-h-[50vh] overflow-y-auto no-scrollbar" glow="none">
              <h3 className="text-gray-400 text-xs font-extrabold uppercase tracking-widest text-center border-b border-[#222230] pb-2 select-none">
                The Ranking Order
              </h3>
              <div className="flex flex-col gap-2.5">
                {ordered.map((player, idx) => (
                  <div
                    key={player.id}
                    className="flex items-center gap-3 bg-[#0a0a0c]/40 border border-[#222230] px-4 py-3 rounded-2xl"
                  >
                    <span className="font-extrabold text-lg text-gray-500 w-6">#{idx + 1}</span>
                    <Avatar emoji={player.avatar} color={player.color} size="sm" />
                    <span className="font-bold text-base truncate text-white">{player.name}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Right: Guesser list with their decisions */}
            <Card className="flex flex-col gap-4 p-5 max-h-[50vh] overflow-y-auto no-scrollbar" glow="none">
              <h3 className="text-gray-400 text-xs font-extrabold uppercase tracking-widest text-center border-b border-[#222230] pb-2 select-none">
                Who Guessed What?
              </h3>
              
              <div className="flex flex-col gap-3">
                {/* Show Ranker first */}
                {rankerPlayer && (
                  <div className="flex items-center gap-3 bg-[#121217]/50 border border-[#9f7aea]/30 px-4 py-3 rounded-2xl">
                    <Avatar emoji={rankerPlayer.avatar} color={rankerPlayer.color} size="sm" isHost={rankerPlayer.isHost} />
                    <div className="flex-1 overflow-hidden">
                      <div className="font-bold text-sm text-gray-300 flex items-center gap-1 leading-tight">
                        {rankerPlayer.name} <span className="text-[10px] bg-[#9f7aea]/20 text-[#9f7aea] px-2 py-0.5 rounded-full uppercase">Ranker</span>
                      </div>
                      <span className="text-xs text-gray-400 font-semibold truncate block mt-0.5">Created the list</span>
                    </div>
                    <span className="text-emerald-400 font-extrabold text-sm select-none">+{rankerPlayer.roundScore}</span>
                  </div>
                )}

                {/* Show Guessers */}
                {players
                  .filter(p => p.id !== rankerId && !p.isDisconnected)
                  .map((player) => {
                    const guess = guesses[player.id];
                    const isCorrect = guess === correctText;
                    const isWinner = player.id === roundWinnerId;

                    return (
                      <div
                        key={player.id}
                        className={`flex items-center gap-3 border px-4 py-3 rounded-2xl bg-[#0a0a0c]/40
                          ${isCorrect ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-red-500/30 bg-red-500/5'}`}
                      >
                        <Avatar emoji={player.avatar} color={player.color} size="sm" isHost={player.isHost} />
                        
                        <div className="flex-1 overflow-hidden">
                          <div className="font-bold text-sm text-white flex items-center gap-1.5 leading-tight">
                            {player.name}
                            {isWinner && (
                              <span className="text-[9px] bg-yellow-500 text-black px-1.5 py-0.5 rounded-md font-extrabold uppercase flex items-center gap-0.5 select-none animate-pulse">
                                <Star size={8} fill="black" /> Fastest
                              </span>
                            )}
                          </div>
                          <span className={`text-xs truncate block mt-0.5 font-semibold ${isCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
                            {guess ? `"${guess}"` : 'No Guess'}
                          </span>
                        </div>

                        <span className={`font-extrabold text-sm select-none ${isCorrect ? 'text-emerald-400' : 'text-gray-500'}`}>
                          +{player.roundScore}
                        </span>
                      </div>
                    );
                  })}
              </div>
            </Card>
          </div>

          {/* Host Next button */}
          {isHost && (
            <Button
              variant="primary"
              size="lg"
              onClick={onNextRound}
              className="w-full mt-4 flex items-center justify-center gap-2 shadow-lg hover:scale-102"
            >
              Go to Standings <ArrowRight size={20} />
            </Button>
          )}
          {!isHost && (
            <p className="text-xs text-center text-gray-500 font-bold select-none py-2">
              Waiting for the host to advance to standings...
            </p>
          )}
        </div>
      </div>
    );
  }

  // --- RENDER PHASE: LEADERBOARD ---
  if (phase === 'LEADERBOARD') {
    // Sort players by score
    const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 relative z-10 text-white max-w-2xl mx-auto w-full">
        <div className="w-full flex flex-col gap-6">
          {/* Header */}
          <div className="flex justify-between items-center text-sm font-bold text-gray-400 border-b border-[#222230] pb-2 select-none">
            <span>ROUND {currentRound} / {maxRounds}</span>
            <span className="text-yellow-500 uppercase tracking-wider text-xs">Current Standings</span>
          </div>

          <Card className="p-6 flex flex-col gap-4" glow="purple">
            <h2 className="text-2xl font-extrabold text-center uppercase tracking-wide flex items-center justify-center gap-2">
              <Award className="text-yellow-500" /> Scoreboard
            </h2>

            {/* Standings list */}
            <div className="flex flex-col gap-3 my-2 max-h-[50vh] overflow-y-auto no-scrollbar">
              {sortedPlayers.map((player, idx) => (
                <div
                  key={player.id}
                  className={`flex items-center justify-between bg-[#0a0a0c]/50 border px-5 py-3.5 rounded-2xl transition-all duration-200
                    ${idx === 0 ? 'border-yellow-500/40 shadow-md shadow-yellow-500/5 bg-yellow-500/5' : idx === 1 ? 'border-gray-400/20' : idx === 2 ? 'border-amber-600/20' : 'border-[#222230]'}
                    ${player.isDisconnected ? 'opacity-40 border-dashed' : ''}
                  `}
                >
                  <div className="flex items-center gap-4 overflow-hidden">
                    <span className={`font-extrabold text-lg w-6 text-center select-none
                      ${idx === 0 ? 'text-yellow-500' : idx === 1 ? 'text-gray-300' : idx === 2 ? 'text-amber-600' : 'text-gray-500'}`}>
                      {idx + 1}
                    </span>
                    <Avatar emoji={player.avatar} color={player.color} size="sm" isHost={player.isHost} isDisconnected={player.isDisconnected} />
                    <span className="font-bold text-base truncate text-white leading-none">
                      {player.name} {player.id === playerId && <span className="text-xs font-semibold text-gray-500 font-sans ml-1">(You)</span>}
                    </span>
                  </div>

                  <span className={`font-extrabold text-lg select-none ${idx === 0 ? 'text-yellow-500' : 'text-white'}`}>
                    {player.score} pts
                  </span>
                </div>
              ))}
            </div>

            {/* Next Round Trigger */}
            {isHost ? (
              <Button
                variant="primary"
                size="lg"
                onClick={onNextRound}
                className="w-full mt-4 flex items-center justify-center gap-2"
              >
                {currentRound >= maxRounds ? 'Finish Game' : 'Start Next Round'} <ArrowRight size={20} />
              </Button>
            ) : (
              <p className="text-xs text-center text-gray-500 font-bold select-none py-2">
                Waiting for the host to continue...
              </p>
            )}
          </Card>
        </div>
      </div>
    );
  }

  // --- RENDER PHASE: GAME_OVER ---
  if (phase === 'GAME_OVER') {
    const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
    const winner = sortedPlayers[0];

    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 relative z-10 text-white max-w-2xl mx-auto w-full">
        <div className="w-full flex flex-col gap-6 text-center">
          
          {/* Trophy Header */}
          <div className="flex flex-col items-center justify-center gap-3">
            <motion.div
              initial={{ scale: 0.5, rotate: -20 }}
              animate={{ scale: 1.1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 12 }}
              className="w-24 h-24 rounded-full bg-yellow-500/10 border-2 border-yellow-500 flex items-center justify-center text-yellow-500 shadow-2xl shadow-yellow-500/10"
            >
              <Trophy size={48} />
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-extrabold uppercase bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 tracking-wider">
              Game Over!
            </h1>
            <p className="text-gray-400 text-sm font-semibold select-none">
              All rounds are complete. Here are the final rankings.
            </p>
          </div>

          {/* Winner announcement */}
          {winner && (
            <Card className="p-6 flex flex-col items-center gap-3 relative overflow-hidden max-w-sm w-full mx-auto" glow="purple">
              <div className="absolute top-2 left-3 text-xl select-none animate-bounce">👑</div>
              <div className="absolute top-2 right-3 text-xl select-none animate-bounce">👑</div>
              
              <span className="text-[10px] text-yellow-500 font-extrabold tracking-widest uppercase">The Grand Winner</span>
              <Avatar emoji={winner.avatar} color={winner.color} size="lg" />
              <h2 className="text-2xl font-black text-white">{winner.name}</h2>
              <span className="text-lg font-extrabold text-yellow-500 select-none">{winner.score} Total Points</span>
            </Card>
          )}

          {/* Score details */}
          <Card className="p-5 flex flex-col gap-3 text-left" glow="none">
            <h3 className="text-xs text-gray-500 font-extrabold uppercase tracking-wider text-center border-b border-[#222230] pb-2 select-none">
              Final Scoreboard
            </h3>
            
            <div className="flex flex-col gap-2.5 max-h-[30vh] overflow-y-auto no-scrollbar">
              {sortedPlayers.map((player, idx) => (
                <div
                  key={player.id}
                  className={`flex items-center justify-between bg-[#0a0a0c]/30 border px-4 py-3 rounded-2xl
                    ${idx === 0 ? 'border-yellow-500/30' : 'border-[#222230]'}`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <span className="font-extrabold text-sm w-5 text-center text-gray-500">{idx + 1}</span>
                    <Avatar emoji={player.avatar} color={player.color} size="sm" />
                    <span className="font-bold text-sm text-white truncate">{player.name}</span>
                  </div>
                  <span className="font-extrabold text-sm select-none text-gray-300">{player.score} pts</span>
                </div>
              ))}
            </div>

            {/* Restart options */}
            {isHost ? (
              <Button
                variant="primary"
                size="lg"
                onClick={onPlayAgain}
                className="w-full mt-4 flex items-center justify-center gap-2"
              >
                Play Again <RefreshCw size={18} />
              </Button>
            ) : (
              <p className="text-xs text-center text-gray-500 font-bold select-none py-2 mt-2">
                Waiting for the host to start a new game...
              </p>
            )}
          </Card>

        </div>
      </div>
    );
  }

  return null;
};
