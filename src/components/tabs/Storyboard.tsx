
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Film } from 'lucide-react';

export default function Storyboard() {
  return (
    <Card className="w-full max-w-4xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Film className="h-6 w-6 text-primary" />
          Storyboard Generator
        </CardTitle>
        <CardDescription>
          Visually plan your story scene by scene. This feature is coming soon!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-10 border-2 border-dashed border-border rounded-lg">
            <Film className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium text-foreground">Storyboard Feature Under Construction</h3>
            <p className="text-muted-foreground">
              Soon you'll be able to generate and arrange storyboard panels for your book.
            </p>
          </div>
      </CardContent>
    </Card>
  );
}
