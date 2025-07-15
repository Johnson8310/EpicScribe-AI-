
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Film, PlusCircle, Trash2, ArrowUp, ArrowDown, Save } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface PlotCardData {
  id: string;
  title: string;
  description: string;
}

const LOCAL_STORAGE_KEY = 'epic-scribe-storyboard';

const getInitialStoryboard = (): PlotCardData[] => {
  if (typeof window === 'undefined') return [];
  const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
  return savedData ? JSON.parse(savedData) : [];
};

export default function Storyboard() {
  const [plotCards, setPlotCards] = useState<PlotCardData[]>([]);
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
    setPlotCards(getInitialStoryboard());
  }, []);

  const saveStoryboard = (cards: PlotCardData[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cards));
      toast({
        title: "Storyboard Saved!",
        description: "Your plot changes have been saved locally.",
      });
    }
  };
  
  const handleAddCard = () => {
    const newCard: PlotCardData = {
      id: `card-${Date.now()}`,
      title: "New Scene",
      description: "Describe what happens in this scene...",
    };
    setPlotCards(prev => [...prev, newCard]);
  };

  const handleDeleteCard = (id: string) => {
    setPlotCards(prev => prev.filter(card => card.id !== id));
  };
  
  const handleCardChange = (id: string, field: 'title' | 'description', value: string) => {
     setPlotCards(prev => prev.map(card => card.id === id ? { ...card, [field]: value } : card));
  };

  const moveCard = (index: number, direction: 'up' | 'down') => {
    const newCards = [...plotCards];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newCards.length) return;

    // Swap elements
    [newCards[index], newCards[targetIndex]] = [newCards[targetIndex], newCards[index]];
    
    setPlotCards(newCards);
  };


  return (
    <Card className="w-full max-w-6xl mx-auto shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Film className="h-6 w-6 text-primary" />
            Interactive Storyboard
          </CardTitle>
          <CardDescription>
            Visually plan your story scene by scene. Drag and drop to reorder.
          </CardDescription>
        </div>
        <div className="flex gap-2">
            <Button onClick={handleAddCard}><PlusCircle className="mr-2 h-4 w-4" /> Add Scene</Button>
            <Button variant="outline" onClick={() => saveStoryboard(plotCards)}><Save className="mr-2 h-4 w-4" /> Save Storyboard</Button>
        </div>
      </CardHeader>
      <CardContent>
        {isClient && plotCards.length > 0 ? (
          <div className="space-y-4">
            {plotCards.map((card, index) => (
              <Card key={card.id} className="p-4 bg-secondary/30">
                <div className="flex items-start gap-4">
                  <div className="flex-grow space-y-2">
                     <Input 
                        value={card.title} 
                        onChange={(e) => handleCardChange(card.id, 'title', e.target.value)}
                        className="text-lg font-semibold bg-background"
                     />
                     <Textarea 
                        value={card.description} 
                        onChange={(e) => handleCardChange(card.id, 'description', e.target.value)}
                        placeholder="Describe the scene..."
                        className="min-h-[80px] bg-background"
                     />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button size="icon" variant="ghost" onClick={() => moveCard(index, 'up')} disabled={index === 0}>
                        <ArrowUp className="h-5 w-5" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => moveCard(index, 'down')} disabled={index === plotCards.length - 1}>
                        <ArrowDown className="h-5 w-5" />
                    </Button>
                    <Button size="icon" variant="destructive" onClick={() => handleDeleteCard(card.id)}>
                        <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          isClient && (
            <div onClick={handleAddCard} className="text-center py-10 border-2 border-dashed border-border rounded-lg hover:bg-accent hover:border-primary transition-colors cursor-pointer">
              <Film className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium text-foreground">Your storyboard is empty.</h3>
              <p className="text-muted-foreground">Click here to add your first scene.</p>
            </div>
          )
        )}
      </CardContent>
    </Card>
  );
}
