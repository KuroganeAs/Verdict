import { Prompt } from '../types/game';

export const PROMPTS_DATABASE: Prompt[] = [
  // Relationships
  { text: "Biggest red flag", category: "Relationships" },
  { text: "Worst texter", category: "Relationships" },
  { text: "Most likely to ghost someone after a great date", category: "Relationships" },
  { text: "Biggest attention seeker", category: "Relationships" },
  { text: "Most romantic partner", category: "Relationships" },
  { text: "Most likely to get back with their toxic ex", category: "Relationships" },
  { text: "Most likely to marry for money", category: "Relationships" },
  { text: "Most likely to forget an anniversary", category: "Relationships" },

  // Habits & Lifestyle
  { text: "Worst driver", category: "Habits & Lifestyle" },
  { text: "Biggest clean freak", category: "Habits & Lifestyle" },
  { text: "Most likely to show up 30 minutes late", category: "Habits & Lifestyle" },
  { text: "Most dramatic person", category: "Habits & Lifestyle" },
  { text: "Worst cook", category: "Habits & Lifestyle" },
  { text: "Most likely to spend their last $10 on coffee", category: "Habits & Lifestyle" },
  { text: "Loudest chewer", category: "Habits & Lifestyle" },
  { text: "Most likely to stay up until 4 AM scrolling social media", category: "Habits & Lifestyle" },

  // Survival & Apocalypse
  { text: "Most likely to survive a zombie apocalypse", category: "Survival & Apocalypse" },
  { text: "First to die in a horror movie", category: "Survival & Apocalypse" },
  { text: "Most likely to eat mysterious berries in the wild", category: "Survival & Apocalypse" },
  { text: "Best person to have with you on a deserted island", category: "Survival & Apocalypse" },
  { text: "Most likely to start a cult", category: "Survival & Apocalypse" },
  { text: "Most likely to accidentally set the house on fire", category: "Survival & Apocalypse" },
  { text: "Most likely to befriending a wild bear", category: "Survival & Apocalypse" },

  // Success & Ambition
  { text: "Most likely to become a billionaire", category: "Success & Ambition" },
  { text: "Most likely to start a successful business", category: "Success & Ambition" },
  { text: "Most likely to get fired on their first day", category: "Success & Ambition" },
  { text: "Hardest worker in the room", category: "Success & Ambition" },
  { text: "Most likely to win a Nobel prize", category: "Success & Ambition" },
  { text: "Most likely to become a famous influencer", category: "Success & Ambition" },
  { text: "Most likely to sleep through a major job interview", category: "Success & Ambition" },

  // Social Skills & Quirks
  { text: "Easiest to peer pressure", category: "Social Skills & Quirks" },
  { text: "Loudest laugh", category: "Social Skills & Quirks" },
  { text: "Best liar", category: "Social Skills & Quirks" },
  { text: "Most likely to fall for a fake news article", category: "Social Skills & Quirks" },
  { text: "Worst secret keeper", category: "Social Skills & Quirks" },
  { text: "Most likely to argue with a cashier", category: "Social Skills & Quirks" },
  { text: "Most likely to laugh at a funeral", category: "Social Skills & Quirks" },
  { text: "Most likely to cry during a Pixar movie", category: "Social Skills & Quirks" }
];
export type CategoryType = "Relationships" | "Habits & Lifestyle" | "Survival & Apocalypse" | "Success & Ambition" | "Social Skills & Quirks";
