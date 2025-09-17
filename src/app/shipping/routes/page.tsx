'use client'

import { useState, useMemo } from 'react';
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useAppContext } from "@/context/AppContext";
import type { Shipment } from '@/types';
import { Map, List, Truck, CheckCircle } from '@/components/icons';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function RoutePlanningPage() {
    const { shipments } = useAppContext();
    const [selectedShipmentIds, setSelectedShipmentIds] = useState<string[]>([]);
    const [optimizedRoute, setOptimizedRoute] = useState<Shipment[]>([]);

    const pendingShipments = useMemo(() => 
        shipments.filter(s => s.status === 'pending'), 
    [shipments]);

    const handleSelectShipment = (shipmentId: string, checked: boolean) => {
        setSelectedShipmentIds(prev => 
            checked ? [...prev, shipmentId] : prev.filter(id => id !== shipmentId)
        );
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedShipmentIds(pendingShipments.map(s => s.id));
        } else {
            setSelectedShipmentIds([]);
        }
    };

    const handlePlanRoute = () => {
        const route = pendingShipments
            .filter(s => selectedShipmentIds.includes(s.id))
            // Basic optimization: sort by ID as a stand-in for location proximity.
            // A real implementation would use a mapping API.
            .sort((a, b) => a.id.localeCompare(b.id)); 
        
        setOptimizedRoute(route);
    };

    return (
        <div className="flex flex-col h-full">
            <Header title="Route Planning & Optimization" />
            <main className="flex-1 overflow-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 flex flex-col gap-6">
                    <Card className="flex-1 flex flex-col">
                        <CardHeader>
                            <CardTitle>Pending Shipments</CardTitle>
                            <CardDescription>Select shipments to include in the delivery route.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col">
                           <div className="flex items-center gap-3 border-b pb-3 mb-3">
                                <Checkbox
                                    id="select-all"
                                    checked={selectedShipmentIds.length > 0 && selectedShipmentIds.length === pendingShipments.length}
                                    onCheckedChange={handleSelectAll}
                                />
                                <label htmlFor="select-all" className="text-sm font-medium leading-none">Select All</label>
                           </div>
                           <ScrollArea className="flex-1">
                            <div className="space-y-4">
                                {pendingShipments.map(shipment => (
                                    <div key={shipment.id} className="flex items-start gap-3 p-3 rounded-md border bg-card hover:bg-muted/50">
                                        <Checkbox
                                            id={`shipment-${shipment.id}`}
                                            checked={selectedShipmentIds.includes(shipment.id)}
                                            onCheckedChange={(checked) => handleSelectShipment(shipment.id, !!checked)}
                                            className="mt-1"
                                        />
                                        <div className="text-sm">
                                            <label htmlFor={`shipment-${shipment.id}`} className="font-medium">{shipment.id}</label>
                                            <p className="text-muted-foreground truncate">{shipment.customerName}</p>
                                            <p className="text-xs text-muted-foreground truncate">{shipment.shippingAddress}</p>
                                        </div>
                                    </div>
                                ))}
                                 {pendingShipments.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No pending shipments.</p>}
                            </div>
                           </ScrollArea>
                        </CardContent>
                        <div className="p-6 pt-0">
                             <Button onClick={handlePlanRoute} className="w-full" disabled={selectedShipmentIds.length === 0}>
                                <List className="mr-2 h-4 w-4" /> Plan Route for {selectedShipmentIds.length} Shipment(s)
                            </Button>
                        </div>
                    </Card>
                </div>
                <div className="lg:col-span-2 flex flex-col gap-6">
                    <Card className="flex-1">
                        <CardHeader>
                            <CardTitle>Optimized Route</CardTitle>
                            <CardDescription>Generated delivery route based on selected shipments.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 xl:grid-cols-2 gap-6 h-full">
                            <div className="flex flex-col">
                                <h3 className="font-semibold mb-4 flex items-center gap-2"><Truck className="h-4 w-4"/>Delivery Stops</h3>
                                {optimizedRoute.length > 0 ? (
                                    <ol className="list-decimal list-inside space-y-4">
                                        {optimizedRoute.map((shipment, index) => (
                                            <li key={shipment.id} className="p-3 bg-secondary rounded-md">
                                                <span className="font-semibold">{index + 1}. {shipment.customerName}</span>
                                                <p className="text-sm text-muted-foreground">{shipment.shippingAddress}</p>
                                            </li>
                                        ))}
                                    </ol>
                                ) : (
                                    <div className="flex-1 flex flex-col items-center justify-center text-center text-muted-foreground bg-muted/50 rounded-lg">
                                        <List className="h-10 w-10 mb-2" />
                                        <p>Your optimized route will appear here.</p>
                                    </div>
                                )}
                            </div>
                             <div className="flex flex-col">
                                <h3 className="font-semibold mb-4 flex items-center gap-2"><Map className="h-4 w-4"/>Map View</h3>
                                <div className="flex-1 bg-muted/50 rounded-lg flex items-center justify-center relative overflow-hidden">
                                     <Map className="h-24 w-24 text-muted-foreground/30" />
                                      {optimizedRoute.map((shipment, index) => (
                                        <div key={shipment.id} className="absolute" style={{ top: `${(index + 1) * (100 / (optimizedRoute.length + 1))}%`, left: `${((index % 2) * 40) + 25}%`}}>
                                            <div className="relative flex items-center justify-center">
                                                 <CheckCircle className="h-6 w-6 text-primary bg-background rounded-full" />
                                                 <span className="absolute -top-5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">{index+1}</span>
                                            </div>
                                        </div>
                                      ))}
                                </div>
                             </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
