
"use client";

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookCopy, FileImage, Import, Wand2, Film } from 'lucide-react';
import { useRouter } from 'next/navigation';

import AIBookGenerator from '@/components/tabs/AIBookGenerator';
import ImportContent from '@/components/tabs/ImportContent';
import CoverArtGenerator from '@/components/tabs/CoverArtGenerator';
import MyBooks from '@/components/tabs/MyBooks';
import Storyboard from '@/components/tabs/Storyboard';

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'ai-generator';

  const handleTabChange = (value: string) => {
    router.push(`/?tab=${value}`, { scroll: false });
  };

  return (
    <div className="container mx-auto py-2">
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-5 mb-6">
            <TabsTrigger value="ai-generator" asChild>
              <Link href="/?tab=ai-generator" scroll={false}>
                <Wand2 className="mr-2 h-4 w-4" />
                AI Book Generator
              </Link>
            </TabsTrigger>
            <TabsTrigger value="import-content" asChild>
              <Link href="/?tab=import-content" scroll={false}>
                <Import className="mr-2 h-4 w-4" />
                Import Content
              </Link>
            </TabsTrigger>
            <TabsTrigger value="cover-generator" asChild>
              <Link href="/?tab=cover-generator" scroll={false}>
                <FileImage className="mr-2 h-4 w-4" />
                Cover Art Generator
              </Link>
            </TabsTrigger>
            <TabsTrigger value="storyboard" asChild>
              <Link href="/?tab=storyboard" scroll={false}>
                <Film className="mr-2 h-4 w-4" />
                Storyboard
              </Link>
            </TabsTrigger>
            <TabsTrigger value="my-books" asChild>
              <Link href="/?tab=my-books" scroll={false}>
                <BookCopy className="mr-2 h-4 w-4" />
                My Books
              </Link>
            </TabsTrigger>
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
