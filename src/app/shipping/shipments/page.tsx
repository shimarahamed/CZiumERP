
'use client'

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { MoreHorizontal, PlusCircle, Search, X, Truck } from '@/components/icons';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Header from "@/components/Header";
import { useToast } from "@/hooks/use-toast";
import { useAppContext } from '@/context/AppContext';
import type { Shipment, ShipmentStatus, Invoice } from '@/types';
import { Badge } from '@/components/ui/badge';
import { DatePicker } from '@/components/ui/date-picker';
import { format } from 'date-fns';
import { ShipmentDetail } from '@/components/ShipmentDetail';

const shipmentSchema = z.object({
  invoiceId: z.string().min(1, "An invoice is required."),
  shippingAddress: z.string().min(1, "Shipping address is required."),
  assignedDriverId: z.string().optional(),
  vehicleId: z.string().optional(),
  dispatchDate: z.date({ required_error: "Dispatch date is required."}),
  estimatedDeliveryDate: z.date().optional(),
});

type ShipmentFormData = z.infer<typeof shipmentSchema>;

const statusVariant: { [key in ShipmentStatus]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
    pending: 'secondary',
    'in-transit': 'default',
    delivered: 'outline',
    cancelled: 'destructive'
};

const statusDisplay: { [key in ShipmentStatus]: string } = {
  pending: 'Pending',
  'in-transit': 'In Transit',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

const TimelineStep = ({ status, title, isActive, isCompleted }: { status: string, title: string, isActive: boolean, isCompleted: boolean }) => (
    <div className="flex flex-col items-center">
        <div className={`h-3 w-3 rounded-full ${isCompleted || isActive ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
        <p className={`mt-1 text-xs ${isActive ? 'font-bold text-primary' : 'text-muted-foreground'}`}>{title}</p>
    </div>
);

export default function ShipmentsPage() {
    const { shipments, setShipments, addActivityLog, user, invoices, employees, assets } = useAppContext();
    const { toast } = useToast();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [shipmentToEdit, setShipmentToEdit] = useState<Shipment | null>(null);
    const [viewingShipment, setViewingShipment] = useState<Shipment | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<ShipmentStatus | 'all'>('all');

    const form = useForm<ShipmentFormData>({
        resolver: zodResolver(shipmentSchema),
    });

    const canManage = user?.role === 'admin' || user?.role === 'manager';

    const availableInvoices = useMemo(() => invoices.filter(i => i.status === 'paid'), [invoices]);

    const filteredShipments = useMemo(() => {
        return shipments
            .filter(shipment => {
                if (statusFilter !== 'all' && shipment.status !== statusFilter) {
                    return false;
                }
                if (!searchTerm) {
                    return true;
                }
                const lowercasedFilter = searchTerm.toLowerCase();
                return (
                    (shipment.trackingNumber && shipment.trackingNumber.toLowerCase().includes(lowercasedFilter)) ||
                    shipment.id.toLowerCase().includes(lowercasedFilter) ||
                    shipment.customerName.toLowerCase().includes(lowercasedFilter) ||
                    shipment.invoiceId.toLowerCase().includes(lowercasedFilter)
                );
            })
            .sort((a, b) => new Date(b.dispatchDate).getTime() - new Date(a.dispatchDate).getTime());
    }, [shipments, searchTerm, statusFilter]);

    const handleOpenForm = useCallback((shipment: Shipment | null = null) => {
        setShipmentToEdit(shipment);
        if (shipment) {
            form.reset({
                invoiceId: shipment.invoiceId,
                shippingAddress: shipment.shippingAddress,
                assignedDriverId: shipment.assignedDriverId,
                vehicleId: shipment.vehicleId,
                dispatchDate: new Date(shipment.dispatchDate),
                estimatedDeliveryDate: shipment.estimatedDeliveryDate ? new Date(shipment.estimatedDeliveryDate) : undefined,
            });
        } else {
            form.reset({
                invoiceId: '',
                shippingAddress: '',
                assignedDriverId: '',
                vehicleId: '',
                dispatchDate: new Date(),
                estimatedDeliveryDate: undefined,
            });
        }
        setIsFormOpen(true);
    }, [form]);
    
    const onInvoiceSelect = (invoiceId: string) => {
        const invoice = availableInvoices.find(inv => inv.id === invoiceId);
        const customer = invoice?.customerId ? useAppContext().customers.find(c => c.id === invoice.customerId) : null;
        if(invoice) {
            form.setValue('shippingAddress', customer?.shippingAddress || customer?.billingAddress || '');
        }
        
        const existingShipment = shipments.find(s => s.invoiceId === invoiceId && s.status !== 'cancelled');
        if (existingShipment) {
            toast({
                variant: 'destructive',
                title: 'Duplicate Shipment Warning',
                description: `Invoice ${invoiceId} is already associated with shipment ${existingShipment.id}.`,
            });
        }
    };

    const onSubmit = (data: ShipmentFormData) => {
        const invoice = invoices.find(i => i.id === data.invoiceId);
        if (!invoice) {
            toast({ variant: 'destructive', title: 'Invalid Invoice', description: 'The selected invoice could not be found.' });
            return;
        }
        const driver = employees.find(e => e.id === data.assignedDriverId);
        const vehicle = assets.find(a => a.id === data.vehicleId);

        const newShipmentData = {
            invoiceId: invoice.id,
            customerId: invoice.customerId,
            customerName: invoice.customerName || 'N/A',
            shippingAddress: data.shippingAddress,
            items: invoice.items,
            assignedDriverId: data.assignedDriverId,
            assignedDriverName: driver?.name,
            vehicleId: data.vehicleId,
            dispatchDate: format(data.dispatchDate, 'yyyy-MM-dd\'T\'HH:mm:ss.SSSxxx'),
            estimatedDeliveryDate: data.estimatedDeliveryDate ? format(data.estimatedDeliveryDate, 'yyyy-MM-dd\'T\'HH:mm:ss.SSSxxx') : undefined,
        };

        if (shipmentToEdit) {
            setShipments(shipments.map(s => s.id === shipmentToEdit.id ? { ...s, ...newShipmentData } : s));
            toast({ title: 'Shipment Updated' });
            addActivityLog('Shipment Updated', `Updated shipment ${shipmentToEdit.id}`);
        } else {
            const newShipment: Shipment = {
                id: `SHIP-${Date.now()}`,
                trackingNumber: `1Z${Math.random().toString().slice(2, 12)}`,
                status: 'pending',
                ...newShipmentData,
            };
            setShipments(prev => [newShipment, ...prev]);
            toast({ title: 'Shipment Created' });
            addActivityLog('Shipment Created', `New shipment created for invoice ${invoice.id}`);
        }

        setIsFormOpen(false);
    };

    return (
        <div className="flex flex-col h-full">
            <Header title="Shipment Tracking" />
            <main className="flex-1 overflow-auto p-4 md:p-6">
                <Card>
                    <CardHeader>
                        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                            <div>
                                <CardTitle>Shipments</CardTitle>
                                <CardDescription>Track and manage all outgoing shipments.</CardDescription>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                                <div className="relative w-full md:w-auto">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search shipments..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-8 w-full md:w-[250px] bg-secondary"
                                    />
                                </div>
                                <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ShipmentStatus | 'all')}>
                                    <SelectTrigger className="w-full sm:w-[150px]">
                                        <SelectValue placeholder="Filter by status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Statuses</SelectItem>
                                        {Object.keys(statusDisplay).map(status => (
                                            <SelectItem key={status} value={status}>{statusDisplay[status as ShipmentStatus]}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {canManage && (
                                    <Button size="sm" className="gap-1" onClick={() => handleOpenForm(null)}>
                                        <PlusCircle className="h-4 w-4" /> New Shipment
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {filteredShipments.map(shipment => (
                                <Card key={shipment.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setViewingShipment(shipment)}>
                                    <CardHeader className="p-4 flex flex-row items-center justify-between">
                                        <div>
                                            <CardTitle className="text-base font-bold flex items-center gap-2">
                                                <Truck className="h-5 w-5 text-primary"/>
                                                {shipment.id}
                                            </CardTitle>
                                            <CardDescription>To: {shipment.customerName}</CardDescription>
                                        </div>
                                        <Badge variant={statusVariant[shipment.status]} className="capitalize">{statusDisplay[shipment.status]}</Badge>
                                    </CardHeader>
                                    <CardContent className="p-4 pt-0">
                                        <div className="relative flex justify-between items-center w-full pt-4">
                                            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-muted -translate-y-1/2" />
                                            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-primary -translate-y-1/2" style={{ width: `${shipment.status === 'in-transit' ? '50%' : shipment.status === 'delivered' ? '100%' : '0%'}` }}/>
                                            <TimelineStep status="pending" title="Pending" isActive={shipment.status === 'pending'} isCompleted={['in-transit', 'delivered'].includes(shipment.status)} />
                                            <TimelineStep status="in-transit" title="In Transit" isActive={shipment.status === 'in-transit'} isCompleted={shipment.status === 'delivered'} />
                                            <TimelineStep status="delivered" title="Delivered" isActive={shipment.status === 'delivered'} isCompleted={shipment.status === 'delivered'} />
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                         {filteredShipments.length === 0 && (
                            <div className="text-center py-12 text-muted-foreground">
                                <Truck className="mx-auto h-12 w-12" />
                                <p>No shipments found matching your criteria.</p>
                            </div>
                         )}
                    </CardContent>
                </Card>
            </main>

            <Dialog open={!!viewingShipment} onOpenChange={(open) => !open && setViewingShipment(null)}>
                {viewingShipment && <ShipmentDetail shipment={viewingShipment} onClose={() => setViewingShipment(null)} />}
            </Dialog>

            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{shipmentToEdit ? 'Edit Shipment' : 'Create New Shipment'}</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                            <FormField
                                control={form.control}
                                name="invoiceId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Link to Invoice</FormLabel>
                                        <Select onValueChange={(value) => { field.onChange(value); onInvoiceSelect(value); }} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a paid invoice" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {availableInvoices.map(inv => (
                                                    <SelectItem key={inv.id} value={inv.id}>
                                                        {inv.id} - {inv.customerName}
                                                    </SelectItem>
                                                ))}
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
                                    <FormItem>
                                        <FormLabel>Shipping Address</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="assignedDriverId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Assign Driver</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger><SelectValue placeholder="Select driver" /></SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {employees.filter(e => e.jobTitle?.toLowerCase().includes('driver')).map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="vehicleId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Assign Vehicle</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger><SelectValue placeholder="Select vehicle" /></SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {assets.filter(a => a.category === 'Vehicle').map(v => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </FormItem>
                                    )}
                                />
                            </div>
                             <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="dispatchDate"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Dispatch Date</FormLabel>
                                            <DatePicker date={field.value} setDate={field.onChange} />
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="estimatedDeliveryDate"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Estimated Delivery</FormLabel>
                                            <DatePicker date={field.value} setDate={field.onChange} />
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

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
