
'use client'

import { useState, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Header from "@/components/Header";
import { useToast } from "@/hooks/use-toast";
import { useAppContext } from '@/context/AppContext';
import type { Shipment, ShipmentStatus, Invoice } from '@/types';
import { MoreHorizontal, PlusCircle, Truck } from '@/components/icons';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Textarea } from '@/components/ui/textarea';

const shipmentSchema = z.object({
  invoiceId: z.string().min(1, "An invoice must be selected."),
  shippingAddress: z.string().min(1, "Shipping address is required."),
  driverId: z.string().optional(),
  vehicleId: z.string().optional(),
  carrier: z.string().optional(),
  shippingCost: z.coerce.number().min(0).optional(),
  estimatedDelivery: z.date({ required_error: "Estimated delivery date is required." }),
});

type ShipmentFormData = z.infer<typeof shipmentSchema>;

const statusVariant: { [key in ShipmentStatus]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
    'pending': 'secondary',
    'ready-for-pickup': 'secondary',
    'in-transit': 'default',
    'out-for-delivery': 'default',
    'delivered': 'outline',
    'cancelled': 'destructive',
    'failed-delivery': 'destructive',
};

const statusDisplay: { [key in ShipmentStatus]: string } = {
    'pending': 'Pending',
    'ready-for-pickup': 'Ready for Pickup',
    'in-transit': 'In Transit',
    'out-for-delivery': 'Out for Delivery',
    'delivered': 'Delivered',
    'cancelled': 'Cancelled',
    'failed-delivery': 'Failed Delivery',
};


export default function ShipmentsPage() {
    const { 
        shipments, setShipments, 
        invoices, employees, assets, 
        addActivityLog, user, currencySymbol
    } = useAppContext();
    const { toast } = useToast();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [shipmentToEdit, setShipmentToEdit] = useState<Shipment | null>(null);

    const form = useForm<ShipmentFormData>({
        resolver: zodResolver(shipmentSchema),
        defaultValues: { shippingCost: 0 }
    });

    const canManage = user?.role === 'admin' || user?.role === 'manager';

    const shippableInvoices = useMemo(() => 
        invoices.filter(inv => inv.status === 'paid' && !shipments.some(s => s.invoiceId === inv.id)),
    [invoices, shipments]);
    
    const vehicles = useMemo(() => assets.filter(a => a.category === 'Vehicle'), [assets]);
    const drivers = useMemo(() => employees, [employees]);

    const handleOpenForm = (shipment: Shipment | null = null) => {
        setShipmentToEdit(shipment);
        if (shipment) {
            form.reset({
                invoiceId: shipment.invoiceId,
                shippingAddress: shipment.shippingAddress,
                driverId: shipment.driverId || '',
                vehicleId: shipment.vehicleId || '',
                carrier: shipment.carrier || '',
                shippingCost: shipment.shippingCost || 0,
                estimatedDelivery: new Date(shipment.estimatedDelivery),
            });
        } else {
            form.reset({ 
                invoiceId: '', 
                shippingAddress: '',
                driverId: '',
                vehicleId: '',
                carrier: 'Internal Fleet',
                shippingCost: 0,
                estimatedDelivery: new Date(),
            });
        }
        setIsFormOpen(true);
    };

    const handleInvoiceChange = (invoiceId: string) => {
        const invoice = invoices.find(inv => inv.id === invoiceId);
        if (invoice?.customerId) {
            const customer = useAppContext().customers.find(c => c.id === invoice.customerId);
            if (customer?.shippingAddress) {
                form.setValue('shippingAddress', customer.shippingAddress);
            }
        }
    };

    const handleStatusUpdate = (shipmentId: string, newStatus: ShipmentStatus) => {
        setShipments(prev => prev.map(s => s.id === shipmentId ? { ...s, status: newStatus } : s));
        toast({ title: 'Shipment Status Updated' });
        addActivityLog('Shipment Status Updated', `Shipment ${shipmentId} moved to ${newStatus}`);
    };

    const onSubmit = (data: ShipmentFormData) => {
        const invoice = invoices.find(inv => inv.id === data.invoiceId)!;
        
        if (shipmentToEdit) {
            setShipments(prev => prev.map(s => s.id === shipmentToEdit.id ? { 
                ...s, 
                ...data, 
                estimatedDelivery: format(data.estimatedDelivery, 'yyyy-MM-dd') 
            } : s));
            toast({ title: "Shipment Updated" });
        } else {
            const newShipment: Shipment = {
                id: `SHP-${Date.now()}`,
                invoiceId: invoice.id,
                trackingNumber: `TN${Math.floor(100000 + Math.random() * 900000)}`,
                status: 'pending',
                customerId: invoice.customerId!,
                customerName: invoice.customerName!,
                items: invoice.items,
                ...data,
                estimatedDelivery: format(data.estimatedDelivery, 'yyyy-MM-dd'),
            };
            setShipments(prev => [newShipment, ...prev]);
            toast({ title: "Shipment Created" });
            addActivityLog('Shipment Created', `New shipment ${newShipment.id} for invoice ${invoice.id}`);
        }
        setIsFormOpen(false);
    };

    return (
        <div className="flex flex-col h-full">
            <Header title="Shipment Tracking" />
            <main className="flex-1 overflow-auto p-4 md:p-6">
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle>Shipments</CardTitle>
                                <CardDescription>Track and manage all outgoing shipments.</CardDescription>
                            </div>
                            {canManage && (
                                <Button size="sm" onClick={() => handleOpenForm()}>
                                    <PlusCircle className="mr-2 h-4 w-4" /> New Shipment
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Shipment ID</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Tracking #</TableHead>
                                    <TableHead>Est. Delivery</TableHead>
                                    <TableHead><span className="sr-only">Actions</span></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {shipments.map(shipment => (
                                    <TableRow key={shipment.id}>
                                        <TableCell>{shipment.id}</TableCell>
                                        <TableCell>{shipment.customerName}</TableCell>
                                        <TableCell><Badge variant={statusVariant[shipment.status]}>{statusDisplay[shipment.status]}</Badge></TableCell>
                                        <TableCell className="font-mono">{shipment.trackingNumber}</TableCell>
                                        <TableCell>{format(new Date(shipment.estimatedDelivery), 'PPP')}</TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" disabled={!canManage}><MoreHorizontal className="h-4 w-4" /></Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => handleOpenForm(shipment)}>Edit Details</DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    {Object.keys(statusDisplay).map(status => (
                                                        <DropdownMenuItem 
                                                            key={status} 
                                                            onClick={() => handleStatusUpdate(shipment.id, status as ShipmentStatus)}
                                                            disabled={shipment.status === status}
                                                        >
                                                            Move to: {statusDisplay[status as ShipmentStatus]}
                                                        </DropdownMenuItem>
                                                    ))}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </main>

            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{shipmentToEdit ? 'Edit Shipment' : 'New Shipment'}</DialogTitle>
                        <DialogDescription>Convert a paid invoice into a trackable shipment.</DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto px-2">
                             <FormField
                                control={form.control}
                                name="invoiceId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Select Paid Invoice</FormLabel>
                                        <Select 
                                            onValueChange={(value) => {
                                                field.onChange(value);
                                                handleInvoiceChange(value);
                                            }} 
                                            value={field.value}
                                            disabled={!!shipmentToEdit}
                                        >
                                            <FormControl><SelectTrigger><SelectValue placeholder="Select an invoice to ship" /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                {shippableInvoices.map(inv => <SelectItem key={inv.id} value={inv.id}>{inv.id} - {inv.customerName}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="shippingAddress"
                                render={({ field }) => (
                                    <FormItem><FormLabel>Shipping Address</FormLabel><FormControl><Textarea rows={3} {...field} /></FormControl><FormMessage /></FormItem>
                                )}
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField control={form.control} name="driverId" render={({ field }) => (
                                    <FormItem><FormLabel>Driver</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a driver" /></SelectTrigger></FormControl>
                                            <SelectContent>{drivers.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
                                        </Select><FormMessage />
                                    </FormItem>
                                )}/>
                                <FormField control={form.control} name="vehicleId" render={({ field }) => (
                                    <FormItem><FormLabel>Vehicle</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a vehicle" /></SelectTrigger></FormControl>
                                            <SelectContent>{vehicles.map(v => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}</SelectContent>
                                        </Select><FormMessage />
                                    </FormItem>
                                )}/>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField control={form.control} name="carrier" render={({ field }) => (
                                    <FormItem><FormLabel>Carrier</FormLabel><FormControl><Input placeholder="e.g., Internal Fleet, FedEx" {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                 <FormField control={form.control} name="shippingCost" render={({ field }) => (
                                    <FormItem><FormLabel>Shipping Cost ({currencySymbol})</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                            </div>
                            <FormField control={form.control} name="estimatedDelivery" render={({ field }) => (
                                <FormItem className="flex flex-col pt-2"><FormLabel>Estimated Delivery Date</FormLabel><FormControl><DatePicker date={field.value} setDate={field.onChange} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <DialogFooter>
                                <Button type="submit">{shipmentToEdit ? 'Save Changes' : 'Create Shipment'}</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    );
}

