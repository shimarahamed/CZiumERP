
'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";

export default function VehiclesPage() {

  return (
    <div className="flex flex-col h-full">
      <Header title="Fleet Management" />
      <main className="flex-1 overflow-auto p-4 md:p-6">
        <Card>
          <CardHeader>
            <CardTitle>Vehicle & Fleet Management</CardTitle>
            <CardDescription>This feature is under active development.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>The interface for managing your fleet of vehicles will be available here. You will be able to add vehicles (which will be linked to the Assets module), assign drivers, and track maintenance schedules.</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

