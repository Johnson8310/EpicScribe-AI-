
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe } from 'lucide-react';

export default function WorldBuildingHub() {
  return (
    <Card className="w-full max-w-4xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Globe className="h-6 w-6 text-primary" />
          Character & World-Building Hub
        </CardTitle>
        <CardDescription>
          Create character profiles, define locations, and build your story's universe. This feature is coming soon!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-10 border-2 border-dashed border-border rounded-lg">
            <Globe className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium text-foreground">World-Building Hub Under Construction</h3>
            <p className="text-muted-foreground">
              Soon you'll be able to manage your characters and world details here.
            </p>
          </div>
      </CardContent>
    </Card>
  );
}
