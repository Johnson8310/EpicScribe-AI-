
export interface Chapter {
  id: string;
  title: string;
  content: string;
}

export interface Book {
  id: string;
  title: string;
  prompt: string;
  genre: string;
  themes?: string;
  numChapters: number;
  chapters: Chapter[];
  status: 'idle' | 'generating' | 'completed' | 'error';
  lastModified: string; // ISO date string
  userId: string; // Added to associate book with a user
  coverImageUrl?: string;
  imagePrompt?: string; // For custom image prompts
}
