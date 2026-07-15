import { Player, GamePhase, RoomState, Prompt } from '../types/game';
import { PROMPTS_DATABASE } from '../data/prompts';

export class Room {
  public roomId: string;
  public phase: GamePhase = 'LOBBY';
  public players: Player[] = [];
  public hostId: string = '';
  public currentRound: number = 0;
  public maxRounds: number = 0;
  public rankerId: string = '';
  public prompt?: Prompt;
  public rankingList?: string[];
  public choices?: string[];
  public guesses: Record<string, string> = {};
  public roundWinnerId?: string;
  
  // Game sequence state
  private rankerSequence: string[] = []; // Sequence of player IDs to be ranker
  private usedPrompts: Set<string> = new Set();
  private guessingStartTime: number = 0;
  private guessTimestamps: Record<string, number> = {};

  constructor(roomId: string) {
    this.roomId = roomId;
  }

  public addPlayer(id: string, name: string, avatar: string, color: string): Player {
    // If player already exists, return them
    const existing = this.players.find(p => p.id === id);
    if (existing) {
      existing.isDisconnected = false;
      return existing;
    }

    const isHost = this.players.length === 0;
    const player: Player = {
      id,
      name,
      avatar,
      color,
      score: 0,
      roundScore: 0,
      isReady: false,
      isHost,
      isDisconnected: false
    };

    this.players.push(player);
    if (isHost) {
      this.hostId = id;
    }

    return player;
  }

  public removePlayer(id: string): { isEmpty: boolean; hostChanged: boolean } {
    const player = this.players.find(p => p.id === id);
    if (!player) return { isEmpty: this.players.length === 0, hostChanged: false };

    // If game in progress, mark as disconnected, don't remove immediately
    let hostChanged = false;
    if (this.phase !== 'LOBBY') {
      player.isDisconnected = true;
      player.isReady = false;
      
      // If host disconnected, delegate new host
      if (player.isHost) {
        player.isHost = false;
        const activePlayer = this.players.find(p => !p.isDisconnected);
        if (activePlayer) {
          activePlayer.isHost = true;
          this.hostId = activePlayer.id;
          hostChanged = true;
        }
      }

      // If the current ranker disconnected during their turn, what happens?
      // In a real lobby, if they are the ranker, we can skip or trigger a reroll.
      // We will handle it by letting the host skip round or automatically move to next.
    } else {
      // Lobby phase: remove player immediately
      this.players = this.players.filter(p => p.id !== id);
      if (player.isHost && this.players.length > 0) {
        this.players[0].isHost = true;
        this.hostId = this.players[0].id;
        hostChanged = true;
      }
    }

    const activePlayers = this.players.filter(p => !p.isDisconnected);
    return {
      isEmpty: activePlayers.length === 0,
      hostChanged
    };
  }

  public setReady(playerId: string, isReady: boolean) {
    const player = this.players.find(p => p.id === playerId);
    if (player) {
      player.isReady = isReady;
    }
  }

  public startGame() {
    const activePlayers = this.players.filter(p => !p.isDisconnected);
    if (activePlayers.length < 3) {
      throw new Error("Need at least 3 players to start the game.");
    }

    // Reset scores & sequences
    this.players.forEach(p => {
      p.score = 0;
      p.roundScore = 0;
      p.isReady = false;
    });

    // Shuffle active players to get ranker sequence
    this.rankerSequence = activePlayers.map(p => p.id).sort(() => Math.random() - 0.5);
    this.currentRound = 0;
    this.maxRounds = this.rankerSequence.length;
    this.usedPrompts.clear();

    this.startNextRound();
  }

  public startNextRound() {
    if (this.currentRound >= this.maxRounds) {
      this.phase = 'GAME_OVER';
      return;
    }

    this.rankerId = this.rankerSequence[this.currentRound];
    
    // Check if ranker is disconnected, if so, skip them
    const ranker = this.players.find(p => p.id === this.rankerId);
    if (!ranker || ranker.isDisconnected) {
      this.currentRound++;
      this.startNextRound();
      return;
    }

    // Select random prompt, avoiding duplicates if possible
    let availablePrompts = PROMPTS_DATABASE.filter(p => !this.usedPrompts.has(p.text));
    if (availablePrompts.length === 0) {
      // If all prompts used, reset tracking
      this.usedPrompts.clear();
      availablePrompts = PROMPTS_DATABASE;
    }

    const randomPrompt = availablePrompts[Math.floor(Math.random() * availablePrompts.length)];
    this.prompt = randomPrompt;
    this.usedPrompts.add(randomPrompt.text);

    // Clear previous round data
    this.rankingList = undefined;
    this.choices = undefined;
    this.guesses = {};
    this.guessTimestamps = {};
    this.roundWinnerId = undefined;
    this.players.forEach(p => p.roundScore = 0);

    this.phase = 'RANKING';
    this.currentRound++;
  }

  public submitRanking(rankerId: string, rankingList: string[]) {
    if (this.phase !== 'RANKING' || this.rankerId !== rankerId) {
      throw new Error("Not authorized or wrong phase to submit ranking.");
    }

    // Verify ranking list contains all active/lobby players
    const activeIds = this.players.filter(p => !p.isDisconnected).map(p => p.id);
    const valid = activeIds.every(id => rankingList.includes(id));
    if (!valid) {
      // Fallback: make sure at least all players are ranked
      // (sometimes clients might miss a player if they disconnected just now)
      this.rankingList = rankingList;
    } else {
      this.rankingList = rankingList;
    }

    // Generate multiple choice options
    if (this.prompt) {
      const correctText = this.prompt.text;
      const category = this.prompt.category;
      
      const sameCategory = PROMPTS_DATABASE.filter(
        p => p.category === category && p.text !== correctText
      );

      // Select 3 distractors
      const shuffledDistractors = sameCategory
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map(p => p.text);

      // Combine and shuffle
      this.choices = [correctText, ...shuffledDistractors].sort(() => Math.random() - 0.5);
    }

    this.phase = 'GUESSING';
    this.guessingStartTime = Date.now();
  }

  public submitGuess(playerId: string, promptText: string) {
    if (this.phase !== 'GUESSING') {
      throw new Error("Not in guessing phase.");
    }
    if (playerId === this.rankerId) {
      throw new Error("Ranker cannot guess.");
    }

    const player = this.players.find(p => p.id === playerId);
    if (!player || player.isDisconnected) return;

    this.guesses[playerId] = promptText;
    this.guessTimestamps[playerId] = Date.now() - this.guessingStartTime;

    // Check if everyone (except ranker and disconnected players) has guessed
    const activeGuessers = this.players.filter(
      p => p.id !== this.rankerId && !p.isDisconnected
    );
    const allGuessed = activeGuessers.every(p => this.guesses[p.id] !== undefined);

    if (allGuessed) {
      this.revealRoundResults();
    }
  }

  private revealRoundResults() {
    if (!this.prompt) return;

    const correctText = this.prompt.text;
    let correctGuessCount = 0;
    
    // Clear last round scores
    this.players.forEach(p => p.roundScore = 0);

    // Score guessers
    const guessers = this.players.filter(p => p.id !== this.rankerId && !p.isDisconnected);
    
    // Track fastest correct guesser for extra animations or recognition
    let fastestCorrectId: string | undefined;
    let minTime = Infinity;

    guessers.forEach(p => {
      const guess = this.guesses[p.id];
      if (guess === correctText) {
        correctGuessCount++;
        let scoreEarned = 250; // Base score
        
        // Speed bonus: up to 150 points if guessed under 15 seconds
        const timeTaken = this.guessTimestamps[p.id] || 15000;
        const speedBonus = Math.max(0, Math.min(150, Math.floor((15000 - timeTaken) / 100)));
        scoreEarned += speedBonus;

        p.roundScore = scoreEarned;
        p.score += scoreEarned;

        if (timeTaken < minTime) {
          minTime = timeTaken;
          fastestCorrectId = p.id;
        }
      }
    });

    // Score ranker
    const ranker = this.players.find(p => p.id === this.rankerId);
    if (ranker && !ranker.isDisconnected) {
      let rankerScore = correctGuessCount * 100;
      
      // Bonus: everyone got it right
      if (guessers.length > 0 && correctGuessCount === guessers.length) {
        rankerScore += 200;
      }
      
      ranker.roundScore = rankerScore;
      ranker.score += rankerScore;
    }

    this.roundWinnerId = fastestCorrectId;
    this.phase = 'REVEAL';
  }

  public forceReveal() {
    // Force end of guessing (e.g. timeout)
    if (this.phase === 'GUESSING') {
      // Auto-fill missing guesses with empty string
      this.players.forEach(p => {
        if (p.id !== this.rankerId && !p.isDisconnected && !this.guesses[p.id]) {
          this.guesses[p.id] = "";
        }
      });
      this.revealRoundResults();
    }
  }

  public playAgain() {
    // Reset players, keeps them in lobby
    this.players.forEach(p => {
      p.score = 0;
      p.roundScore = 0;
      p.isReady = false;
    });
    this.phase = 'LOBBY';
    this.currentRound = 0;
    this.maxRounds = 0;
    this.rankerId = '';
    this.prompt = undefined;
    this.rankingList = undefined;
    this.choices = undefined;
    this.guesses = {};
    this.roundWinnerId = undefined;
  }

  public toStateJSON(): RoomState {
    const isRevealOrGameOver = this.phase === 'REVEAL' || this.phase === 'LEADERBOARD' || this.phase === 'GAME_OVER';
    
    // Deep copy/structure and clean up secret details for guessers
    return {
      roomId: this.roomId,
      phase: this.phase,
      players: this.players,
      hostId: this.hostId,
      currentRound: this.currentRound,
      maxRounds: this.maxRounds,
      rankerId: this.rankerId,
      // Only include the full prompt for the ranker, OR if we are in reveal/leaderboard/game_over
      prompt: (isRevealOrGameOver || this.phase === 'RANKING') ? this.prompt : undefined,
      rankingList: this.rankingList,
      choices: this.choices,
      guesses: this.guesses,
      roundWinnerId: this.roundWinnerId
    };
  }
}
