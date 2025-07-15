
"use client";

import { useSearchParams } from 'next/navigation';

import AIBookGenerator from '@/components/tabs/AIBookGenerator';
import ImportContent from '@/components/tabs/ImportContent';
import CoverArtGenerator from '@/components/tabs/CoverArtGenerator';
import MyBooks from '@/components/tabs/MyBooks';
import Storyboard from '@/components/tabs/Storyboard';

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'ai-generator';

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'ai-generator':
        return <AIBookGenerator />;
      case 'import-content':
        return <ImportContent />;
      case 'cover-generator':
        return <CoverArtGenerator />;
      case 'storyboard':
        return <Storyboard />;
      case 'my-books':
        return <MyBooks />;
      default:
        return <AIBookGenerator />;
    }
  };

  return (
    <div className="container mx-auto py-2">
      {renderActiveComponent()}
    </div>
  );
}
