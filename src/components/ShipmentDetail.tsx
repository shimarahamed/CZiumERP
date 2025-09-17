

'use client'

import React from 'react';
import { Button } from "@/components/ui/button";
import { DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';
import type { Shipment, ShipmentStatus } from '@/types';
import { useAppContext } from '@/context/AppContext';
import { format, parseISO } from 'date-fns';
import { Truck, Package, User, Map, Calendar, CheckCircle, Ship, AlertCircle, Circle, Archive, Send } from '@/components/icons';
import FullInvoice from './FullInvoice';
import { useState } from 'react';
import { cn } from '@/lib/utils';


interface ShipmentDetailProps {
    shipment: Shipment;
    onClose: () => void;
}

const statusVariant: { [key in ShipmentStatus]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
    pending: 'secondary',
    processing: 'secondary',
    'in-transit': 'default',
    'out-for-delivery': 'default',
    delivered: 'outline',
    failed: 'destructive',
    cancelled: 'destructive'
};

const timelineSteps = [
    { status: 'pending', title: 'Pending', description: 'Shipment created.', icon: <Circle className="h-5 w-5"/>, color: 'bg-gray-500', textColor: 'text-gray-600' },
    { status: 'processing', title: 'Processing', description: 'Items are being prepared.', icon: <Archive className="h-5 w-5"/>, color: 'bg-amber-500', textColor: 'text-amber-600'},
    { status: 'in-transit', title: 'In Transit', description: 'Shipment is on its way.', icon: <Send className="h-5 w-5"/>, color: 'bg-blue-500', textColor: 'text-blue-600'},
    { status: 'out-for-delivery', title: 'Out for Delivery', description: 'Driver is en route.', icon: <Truck className="h-5 w-5"/>, color: 'bg-indigo-500', textColor: 'text-indigo-600'},
    { status: 'delivered', title: 'Delivered', description: 'Shipment has been delivered.', icon: <CheckCircle className="h-5 w-5"/>, color: 'bg-green-500', textColor: 'text-green-600'},
];


export function ShipmentDetail({ shipment, onClose }: ShipmentDetailProps) {
    const { employees, assets, invoices } = useAppContext();
    const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
    
    const driver = employees.find(e => e.id === shipment.assignedDriverId);
    const vehicle = assets.find(a => a.id === shipment.vehicleId);
    const invoice = invoices.find(inv => inv.id === shipment.invoiceId);
    
    const currentStepIndex = timelineSteps.findIndex(step => step.status === shipment.status);

    const isFailedOrCancelled = shipment.status === 'failed' || shipment.status === 'cancelled';

    return (
        <>
            <DialogContent className="sm:max-w-3xl bg-card">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Ship className="h-6 w-6"/> Shipment Details for {shipment.customId || shipment.id}
                    </DialogTitle>
                    <DialogDescription>Tracking Number: {shipment.trackingNumber || 'N/A'}</DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-6 max-h-[70vh] overflow-y-auto px-1">
                    
                    <div className="mb-6">
                        <h3 className="font-semibold text-lg mb-4">Shipment Timeline</h3>
                         {isFailedOrCancelled ? (
                            <div className="flex items-center justify-center p-8 bg-muted rounded-lg text-center">
                                <div className="flex flex-col items-center gap-2">
                                    <AlertCircle className="h-10 w-10 text-destructive" />
                                    <p className="font-bold text-lg capitalize">{shipment.status}</p>
                                    <p className="text-sm text-muted-foreground">This shipment has been marked as {shipment.status}.</p>
                                </div>
                            </div>
                         ) : (
                            <div className="flex justify-between items-start px-2">
                                {timelineSteps.map((step, index) => (
                                    <React.Fragment key={step.status}>
                                        <div className="flex flex-col items-center text-center w-24">
                                            <div className={cn(
                                                'h-8 w-8 rounded-full flex items-center justify-center text-white',
                                                index <= currentStepIndex ? step.color : 'bg-muted'
                                            )}>
                                                {index <= currentStepIndex ? step.icon : <div className="h-2 w-2 bg-muted-foreground rounded-full"/>}
                                            </div>
                                            <p className={cn('mt-2 font-medium text-sm', index <= currentStepIndex ? step.textColor : 'text-muted-foreground')}>{step.title}</p>
                                            <p className="text-xs text-muted-foreground">{step.description}</p>
                                        </div>
                                        {index < timelineSteps.length - 1 && <div className={cn('flex-1 h-1 mt-3.5 mx-2', index < currentStepIndex ? timelineSteps[index+1].color : 'bg-muted')}/>}
                                    </React.Fragment>
                                ))}
                            </div>
                         )}
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
                                 <div><p className="font-medium text-muted-foreground flex items-center gap-2"><Calendar className="h-4 w-4"/>Dispatched</p><p>{shipment.dispatchDate ? format(parseISO(shipment.dispatchDate), 'PPP') : 'N/A'}</p></div>
                                 {shipment.actualDeliveryDate && <div><p className="font-medium text-muted-foreground flex items-center gap-2"><CheckCircle className="h-4 w-4"/>Delivered</p><p>{format(parseISO(shipment.actualDeliveryDate), 'PPP')}</p></div>}
                             </div>
                        </div>
                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg flex items-center gap-2"><Package className="h-5 w-5"/>Items in Shipment</h3>
                            <div className="border rounded-md max-h-48 overflow-y-auto">
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
