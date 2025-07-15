
"use client";

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookCopy, FileImage, Import, Wand2, Film } from 'lucide-react';

import AIBookGenerator from '@/components/tabs/AIBookGenerator';
import ImportContent from '@/components/tabs/ImportContent';
import CoverArtGenerator from '@/components/tabs/CoverArtGenerator';
import MyBooks from '@/components/tabs/MyBooks';
import Storyboard from '@/components/tabs/Storyboard';

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'ai-generator';

  return (
    <div className="container mx-auto py-2">
      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-5 mb-6">
          <Link href="/?tab=ai-generator" scroll={false}>
            <TabsTrigger value="ai-generator" className="w-full">
              <Wand2 className="mr-2 h-4 w-4" />
              AI Book Generator
            </TabsTrigger>
          </Link>
          <Link href="/?tab=import-content" scroll={false}>
            <TabsTrigger value="import-content" className="w-full">
              <Import className="mr-2 h-4 w-4" />
              Import Content
            </TabsTrigger>
          </Link>
          <Link href="/?tab=cover-generator" scroll={false}>
            <TabsTrigger value="cover-generator" className="w-full">
              <FileImage className="mr-2 h-4 w-4" />
              Cover Art Generator
            </TabsTrigger>
          </Link>
          <Link href="/?tab=storyboard" scroll={false}>
            <TabsTrigger value="storyboard" className="w-full">
              <Film className="mr-2 h-4 w-4" />
              Storyboard
            </TabsTrigger>
          </Link>
          <Link href="/?tab=my-books" scroll={false}>
            <TabsTrigger value="my-books" className="w-full">
              <BookCopy className="mr-2 h-4 w-4" />
              My Books
            </TabsTrigger>
          </Link>
        </TabsList>
        
        <TabsContent value="ai-generator">
          <AIBookGenerator />
        </TabsContent>
        <TabsContent value="import-content">
          <ImportContent />
        </TabsContent>
        <TabsContent value="cover-generator">
          <CoverArtGenerator />
        </TabsContent>
        <TabsContent value="storyboard">
          <Storyboard />
        </TabsContent>
        <TabsContent value="my-books">
          <MyBooks />
        </TabsContent>
      </Tabs>
    </div>
  );
}
