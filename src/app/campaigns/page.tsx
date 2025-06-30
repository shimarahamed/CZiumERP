'use client';

import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Megaphone } from "@/components/icons";

export default function CampaignsPage() {
  return (
    <div className="flex flex-col h-full">
      <Header title="Marketing Campaigns" />
      <main className="flex-1 overflow-auto p-4 md:p-6 flex items-center justify-center">
        <Card className="w-full max-w-lg text-center">
          <CardHeader>
             <div className="flex justify-center items-center mb-4">
                <div className="p-3 bg-primary/20 rounded-lg">
                    <Megaphone className="w-8 h-8 text-primary" />
                </div>
            </div>
            <CardTitle>Coming Soon: Marketing Campaigns</CardTitle>
            <CardDescription>This feature is under active development.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>A dedicated module for planning, executing, and tracking the performance of your marketing campaigns is on its way. Please check back later!</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
