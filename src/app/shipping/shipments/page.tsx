
'use client'

import { useState, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Header from "@/components/Header";
import { useToast } from "@/hooks/use-toast";
import { useAppContext } from '@/context/AppContext';
import type { Shipment, ShipmentStatus, Invoice } from '@/types';
import { MoreHorizontal, PlusCircle } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Textarea } from '@/components/ui/textarea';

const shipmentSchema = z.object({
  invoiceId: z.string().min(1, "An invoice must be selected."),
  trackingNumber: z.string().optional(),
  assignedDriverId: z.string().optional(),
  vehicleId: z.string().optional(),
});

type ShipmentFormData = z.infer<typeof shipmentSchema>;

const statusVariant: { [key in ShipmentStatus]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
    pending: 'secondary',
    'in-transit': 'default',
    delivered: 'outline',
    cancelled: 'destructive'
};

export default function ShipmentsPage() {
    const { shipments, setShipments, invoices, employees, assets, addActivityLog, user } = useAppContext();
    const { toast } = useToast();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [shipmentToEdit, setShipmentToEdit] = useState<Shipment | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const form = useForm<ShipmentFormData>({
        resolver: zodResolver(shipmentSchema),
    });
    
    const selectedInvoiceId = form.watch('invoiceId');
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

    useEffect(() => {
        const invoice = invoices.find(inv => inv.id === selectedInvoiceId);
        setSelectedInvoice(invoice || null);
    }, [selectedInvoiceId, invoices]);

    const canManage = user?.role === 'admin' || user?.role === 'manager';

    const paidInvoices = useMemo(() => 
        invoices.filter(inv => inv.status === 'paid' && !shipments.some(s => s.invoiceId === inv.id)), 
    [invoices, shipments]);
    
    const drivers = useMemo(() => employees.filter(e => e.jobTitle?.toLowerCase().includes('driver')), [employees]);
    const vehicles = useMemo(() => assets.filter(a => a.category.toLowerCase() === 'vehicle' && a.status === 'in-use'), [assets]);

    const filteredShipments = useMemo(() => {
        if (!searchTerm) return shipments;
        const lowercasedFilter = searchTerm.toLowerCase();
        return shipments.filter(shipment =>
            shipment.id.toLowerCase().includes(lowercasedFilter) ||
            (shipment.trackingNumber && shipment.trackingNumber.toLowerCase().includes(lowercasedFilter)) ||
            shipment.customerName.toLowerCase().includes(lowercasedFilter)
        );
    }, [shipments, searchTerm]);

    const handleOpenForm = (shipment: Shipment | null = null) => {
        setShipmentToEdit(shipment);
        if (shipment) {
            form.reset({
                invoiceId: shipment.invoiceId,
                trackingNumber: shipment.trackingNumber,
                assignedDriverId: shipment.assignedDriverId || '',
                vehicleId: shipment.vehicleId || '',
            });
        } else {
            form.reset({ invoiceId: '', trackingNumber: '', assignedDriverId: '', vehicleId: '' });
        }
        setIsFormOpen(true);
    };

    const handleStatusChange = (shipmentId: string, status: ShipmentStatus) => {
        setShipments(prev => prev.map(s => s.id === shipmentId ? { ...s, status } : s));
        toast({ title: "Shipment Status Updated" });
        addActivityLog('Shipment Status Updated', `Shipment ${shipmentId} moved to ${status}`);
    };

    const onSubmit = (data: ShipmentFormData) => {
        const driver = drivers.find(d => d.id === data.assignedDriverId);
        const vehicle = vehicles.find(v => v.id === data.vehicleId);

        if (!selectedInvoice) {
            toast({ variant: 'destructive', title: 'Error', description: 'Selected invoice not found.'});
            return;
        }

        const shipmentData = {
            invoiceId: selectedInvoice.id,
            customerId: selectedInvoice.customerId,
            customerName: selectedInvoice.customerName,
            trackingNumber: data.trackingNumber || `SHIP-${Date.now()}`,
            assignedDriverId: driver?.id,
            assignedDriverName: driver?.name,
            vehicleId: vehicle?.id,
            items: selectedInvoice.items,
            shippingAddress: selectedInvoice.customerName || 'N/A', // Placeholder
        };

        if (shipmentToEdit) {
            setShipments(shipments.map(s => s.id === shipmentToEdit.id ? { ...s, ...shipmentData } : s));
            toast({ title: "Shipment Updated" });
        } else {
            const newShipment: Shipment = {
                id: `SHIP-${Date.now()}`,
                status: 'pending',
                dispatchDate: new Date().toISOString(),
                ...shipmentData,
            };
            setShipments([newShipment, ...shipments]);
            toast({ title: "Shipment Created" });
            addActivityLog('Shipment Created', `Created shipment for invoice ${newShipment.invoiceId}`);
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
                                <Input
                                    placeholder="Search by ID, tracking, or customer..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full md:w-auto md:min-w-[250px] bg-secondary"
                                />
                                {canManage && (
                                <Button size="sm" className="gap-1" onClick={() => handleOpenForm()}>
                                    <PlusCircle className="h-4 w-4" /> New Shipment
                                </Button>
                                )}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Shipment ID</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Driver</TableHead>
                                    <TableHead>Tracking #</TableHead>
                                    <TableHead><span className="sr-only">Actions</span></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredShipments.map(shipment => (
                                    <TableRow key={shipment.id}>
                                        <TableCell>{shipment.id}</TableCell>
                                        <TableCell>{shipment.customerName}</TableCell>
                                        <TableCell><Badge variant={statusVariant[shipment.status]} className="capitalize">{shipment.status.replace('-', ' ')}</Badge></TableCell>
                                        <TableCell>{shipment.assignedDriverName || 'Unassigned'}</TableCell>
                                        <TableCell>{shipment.trackingNumber}</TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" disabled={!canManage}><MoreHorizontal/></Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                    <DropdownMenuItem onClick={() => handleOpenForm(shipment)}>Edit</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleStatusChange(shipment.id, 'in-transit')}>Mark In-Transit</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleStatusChange(shipment.id, 'delivered')}>Mark Delivered</DropdownMenuItem>
                                                    <DropdownMenuItem className="text-destructive" onClick={() => handleStatusChange(shipment.id, 'cancelled')}>Cancel</DropdownMenuItem>
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
                        <DialogTitle>{shipmentToEdit ? 'Edit Shipment' : 'Create Shipment'}</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto px-2">
                             <FormField
                                control={form.control}
                                name="invoiceId"
                                render={({ field }) => (
                                <FormItem><FormLabel>Select Invoice</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value} disabled={!!shipmentToEdit}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Select a paid invoice..." /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            {shipmentToEdit && <SelectItem value={shipmentToEdit.invoiceId}>INV-{shipmentToEdit.invoiceId}</SelectItem>}
                                            {paidInvoices.map(inv => <SelectItem key={inv.id} value={inv.id}>{inv.id} - {inv.customerName}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                <FormMessage /></FormItem>
                            )}/>
                            {selectedInvoice && (
                                <Card>
                                    <CardHeader><CardTitle>Shipment Details from {selectedInvoice.id}</CardTitle></CardHeader>
                                    <CardContent className="text-sm space-y-2">
                                        <p><span className="font-semibold">Customer:</span> {selectedInvoice.customerName}</p>
                                        <p><span className="font-semibold">Items:</span> {selectedInvoice.items.map(i => `${i.productName} (x${i.quantity})`).join(', ')}</p>
                                    </CardContent>
                                </Card>
                            )}
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField control={form.control} name="assignedDriverId" render={({ field }) => (
                                    <FormItem><FormLabel>Assign Driver</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select driver..." /></SelectTrigger></FormControl>
                                            <SelectContent>{drivers.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
                                        </Select>
                                    </FormItem>
                                )}/>
                                 <FormField control={form.control} name="vehicleId" render={({ field }) => (
                                    <FormItem><FormLabel>Assign Vehicle</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select vehicle..." /></SelectTrigger></FormControl>
                                            <SelectContent>{vehicles.map(v => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}</SelectContent>
                                        </Select>
                                    </FormItem>
                                )}/>
                            </div>
                            <FormField control={form.control} name="trackingNumber" render={({ field }) => (
                                <FormItem><FormLabel>Tracking Number (Optional)</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
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
