
'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";

export default function ShipmentsPage() {

  return (
    <div className="flex flex-col h-full">
      <Header title="Shipments" />
      <main className="flex-1 overflow-auto p-4 md:p-6">
        <Card>
          <CardHeader>
            <CardTitle>Shipment Tracking</CardTitle>
            <CardDescription>This feature is under active development.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>The ability to create, track, and manage shipments will be available here soon. You will be able to convert paid invoices into trackable shipments, assign drivers, and monitor delivery status.</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

