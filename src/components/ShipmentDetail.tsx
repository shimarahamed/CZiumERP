
'use client'

import React from 'react';
import { Button } from "@/components/ui/button";
import { DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';
import type { Shipment, ShipmentStatus } from '@/types';
import { useAppContext } from '@/context/AppContext';
import { format } from 'date-fns';
import { Truck, Package, User, Map, Calendar, CheckCircle, Ship } from '@/components/icons';
import FullInvoice from './FullInvoice';
import { Dialog } from './ui/dialog';
import { useState } from 'react';

interface ShipmentDetailProps {
    shipment: Shipment;
    onClose: () => void;
}

const statusVariant: { [key in ShipmentStatus]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
    pending: 'secondary',
    'in-transit': 'default',
    delivered: 'outline',
    cancelled: 'destructive'
};

const timelineSteps = [
    { status: 'pending', title: 'Shipment Created', description: 'The shipment has been registered in the system.'},
    { status: 'in-transit', title: 'In Transit', description: 'The shipment is on its way to the destination.'},
    { status: 'delivered', title: 'Delivered', description: 'The shipment has been successfully delivered.'},
];

export function ShipmentDetail({ shipment, onClose }: ShipmentDetailProps) {
    const { employees, assets, invoices } = useAppContext();
    const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
    
    const driver = employees.find(e => e.id === shipment.assignedDriverId);
    const vehicle = assets.find(a => a.id === shipment.vehicleId);
    const invoice = invoices.find(inv => inv.id === shipment.invoiceId);
    
    const currentStepIndex = timelineSteps.findIndex(step => step.status === shipment.status);

    return (
        <>
            <DialogContent className="sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Ship className="h-6 w-6"/> Shipment Details for {shipment.id}
                    </DialogTitle>
                    <DialogDescription>Tracking Number: {shipment.trackingNumber}</DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-6 max-h-[70vh] overflow-y-auto px-1">
                    
                    <div className="mb-6">
                        <h3 className="font-semibold text-lg mb-4">Shipment Timeline</h3>
                        <div className="flex justify-between items-center px-2">
                            {timelineSteps.map((step, index) => (
                                <React.Fragment key={step.status}>
                                    <div className="flex flex-col items-center text-center">
                                        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${index <= currentStepIndex ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                                            {index <= currentStepIndex ? <CheckCircle className="h-5 w-5"/> : <div className="h-2 w-2 bg-muted-foreground rounded-full"/>}
                                        </div>
                                        <p className={`mt-2 font-medium text-sm ${index <= currentStepIndex ? 'text-primary' : 'text-muted-foreground'}`}>{step.title}</p>
                                        <p className="text-xs text-muted-foreground">{step.description}</p>
                                    </div>
                                    {index < timelineSteps.length - 1 && <div className={`flex-1 h-1 mx-2 ${index < currentStepIndex ? 'bg-primary' : 'bg-muted'}`}/>}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                             <h3 className="font-semibold text-lg">Details</h3>
                             <div className="grid grid-cols-2 gap-4 text-sm">
                                 <div><p className="font-medium text-muted-foreground flex items-center gap-2"><User className="h-4 w-4"/>Customer</p><p>{shipment.customerName}</p></div>
                                 <div><p className="font-medium text-muted-foreground flex items-center gap-2"><Map className="h-4 w-4"/>Address</p><p>{shipment.shippingAddress}</p></div>
                                 <div><p className="font-medium text-muted-foreground">Status</p><Badge variant={statusVariant[shipment.status]} className="capitalize">{shipment.status.replace('-', ' ')}</Badge></div>
                                 <div><p className="font-medium text-muted-foreground flex items-center gap-2"><User className="h-4 w-4"/>Driver</p><p>{driver?.name || 'Unassigned'}</p></div>
                                 <div><p className="font-medium text-muted-foreground flex items-center gap-2"><Truck className="h-4 w-4"/>Vehicle</p><p>{vehicle?.name || 'Unassigned'}</p></div>
                             </div>
                             <div className="grid grid-cols-2 gap-4 text-sm">
                                 <div><p className="font-medium text-muted-foreground flex items-center gap-2"><Calendar className="h-4 w-4"/>Dispatched</p><p>{format(new Date(shipment.dispatchDate), 'PPP')}</p></div>
                                 {shipment.actualDeliveryDate && <div><p className="font-medium text-muted-foreground flex items-center gap-2"><CheckCircle className="h-4 w-4"/>Delivered</p><p>{format(new Date(shipment.actualDeliveryDate), 'PPP')}</p></div>}
                             </div>
                        </div>
                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg flex items-center gap-2"><Package className="h-5 w-5"/>Items in Shipment</h3>
                            <div className="border rounded-md">
                                {shipment.items.map(item => (
                                    <div key={item.productId} className="flex justify-between items-center p-3 border-b last:border-b-0 text-sm">
                                        <span>{item.productName}</span>
                                        <span className="text-muted-foreground font-mono">x {item.quantity}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    {invoice && <Button variant="outline" onClick={() => setIsInvoiceOpen(true)}>View Linked Invoice</Button>}
                    <Button onClick={onClose}>Close</Button>
                </DialogFooter>
            </DialogContent>
            {invoice && (
                 <Dialog open={isInvoiceOpen} onOpenChange={setIsInvoiceOpen}>
                    <FullInvoice invoice={invoice}/>
                </Dialog>
            )}
        </>
    );
}
