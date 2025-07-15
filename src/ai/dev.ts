'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/generate-book-chapters.ts';
import '@/ai/flows/summarize-and-rewrite-chapter.ts';
import '@/ai/flows/generate-cover-image.ts';
