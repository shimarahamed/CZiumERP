
'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";

export default function RoutesPage() {

  return (
    <div className="flex flex-col h-full">
      <Header title="Route Planning" />
      <main className="flex-1 overflow-auto p-4 md:p-6">
        <Card>
          <CardHeader>
            <CardTitle>Route Planning & Optimization</CardTitle>
            <CardDescription>This feature is under active development.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>A tool for planning and optimizing delivery routes will be available here. It will help in creating efficient multi-stop routes for drivers based on shipment destinations.</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

