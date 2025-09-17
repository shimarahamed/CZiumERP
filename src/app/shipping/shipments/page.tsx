'use client'

import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function ShipmentsPage() {
  return (
    <div className="flex flex-col h-full">
      <Header title="Shipment Tracking" />
      <main className="flex-1 overflow-auto p-4 md:p-6">
        <Card>
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
            <CardDescription>This feature is currently under redesign.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>The new and improved shipment tracking experience is being built. Please check back later!</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
