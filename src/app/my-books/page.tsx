import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookCopy } from "lucide-react";

export default function MyBooksPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <BookCopy className="h-8 w-8 text-primary" />
          My Books
        </h1>
        {/* Add New Book button can go here if desired */}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Coming Soon!</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This section will display all your generated books. For now, you can manage recent
            projects from the Dashboard.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
