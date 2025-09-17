
'use client'

import { useState, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Header from "@/components/Header";
import { useToast } from "@/hooks/use-toast";
import { useAppContext } from '@/context/AppContext';
import type { Shipment, ShipmentStatus, Invoice } from '@/types';
import { MoreHorizontal, PlusCircle, Truck, Package, User as UserIcon, Calendar, Info, FileText } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ShipmentDetail } from '@/components/ShipmentDetail';

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
    const [viewingShipment, setViewingShipment] = useState<Shipment | null>(null);
    const [shipmentToEdit, setShipmentToEdit] = useState<Shipment | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<ShipmentStatus | 'all'>('all');

    const form = useForm<ShipmentFormData>({
        resolver: zodResolver(shipmentSchema),
    });
    
    const selectedInvoiceId = form.watch('invoiceId');
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const hasExistingShipment = useMemo(() => shipments.some(s => s.invoiceId === selectedInvoiceId), [shipments, selectedInvoiceId]);

    useEffect(() => {
        const invoice = invoices.find(inv => inv.id === selectedInvoiceId);
        setSelectedInvoice(invoice || null);
    }, [selectedInvoiceId, invoices]);

    const canManage = user?.role === 'admin' || user?.role === 'manager';

    const paidInvoices = useMemo(() => 
        invoices.filter(inv => inv.status === 'paid'),
    [invoices]);
    
    const drivers = useMemo(() => employees.filter(e => e.jobTitle?.toLowerCase().includes('driver')), [employees]);
    const vehicles = useMemo(() => assets.filter(a => a.category.toLowerCase() === 'vehicle' && a.status === 'in-use'), [assets]);

    const filteredShipments = useMemo(() => {
        return shipments.filter(shipment => {
            if (statusFilter !== 'all' && shipment.status !== statusFilter) return false;

            if (!searchTerm) return true;
            const lowercasedFilter = searchTerm.toLowerCase();
            return (
                shipment.id.toLowerCase().includes(lowercasedFilter) ||
                (shipment.trackingNumber && shipment.trackingNumber.toLowerCase().includes(lowercasedFilter)) ||
                shipment.customerName.toLowerCase().includes(lowercasedFilter) ||
                shipment.shippingAddress.toLowerCase().includes(lowercasedFilter)
            );
        });
    }, [shipments, searchTerm, statusFilter]);

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
        const shipment = shipments.find(s => s.id === shipmentId);
        if (!shipment) return;
        
        const updates: Partial<Shipment> = { status };
        if (status === 'delivered') {
            updates.actualDeliveryDate = new Date().toISOString();
        }

        setShipments(prev => prev.map(s => s.id === shipmentId ? { ...s, ...updates } : s));
        toast({ title: "Shipment Status Updated" });
        addActivityLog('Shipment Status Updated', `Shipment #${shipmentId} for ${shipment.customerName} set to ${status}.`);
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
                                    placeholder="Search shipments..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full md:w-auto md:min-w-[200px] bg-secondary"
                                />
                                <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ShipmentStatus | 'all')}>
                                    <SelectTrigger className="w-full sm:w-auto">
                                        <SelectValue placeholder="Filter by status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Statuses</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="in-transit">In-Transit</SelectItem>
                                        <SelectItem value="delivered">Delivered</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                                {canManage && (
                                <Button size="sm" className="gap-1 flex-shrink-0" onClick={() => handleOpenForm()}>
                                    <PlusCircle className="h-4 w-4" /> New Shipment
                                </Button>
                                )}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                       <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                           {filteredShipments.map(shipment => {
                               const driver = employees.find(e => e.id === shipment.assignedDriverId);
                               const vehicle = assets.find(a => a.id === shipment.vehicleId);
                               return (
                                   <Card key={shipment.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setViewingShipment(shipment)}>
                                       <CardHeader className="pb-4">
                                           <div className="flex justify-between items-start">
                                               <div>
                                                   <CardTitle className="text-lg flex items-center gap-2">
                                                        <Truck className="h-5 w-5 text-muted-foreground"/> {shipment.id}
                                                   </CardTitle>
                                                   <CardDescription>{shipment.trackingNumber}</CardDescription>
                                               </div>
                                               <Badge variant={statusVariant[shipment.status]} className="capitalize">{shipment.status.replace('-', ' ')}</Badge>
                                           </div>
                                       </CardHeader>
                                       <CardContent className="space-y-3 text-sm">
                                            <div className="flex items-start gap-3">
                                                <UserIcon className="h-4 w-4 mt-0.5 text-muted-foreground"/>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold">{shipment.customerName}</span>
                                                    <span className="text-muted-foreground text-xs">{shipment.shippingAddress}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Package className="h-4 w-4 text-muted-foreground"/>
                                                <span>{shipment.items.length} item(s)</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Calendar className="h-4 w-4 text-muted-foreground"/>
                                                <span>Dispatched: {format(new Date(shipment.dispatchDate), 'MMM d, yyyy')}</span>
                                            </div>
                                       </CardContent>
                                       <CardFooter className="flex justify-end p-4 pt-0">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" disabled={!canManage} onClick={(e) => e.stopPropagation()}><MoreHorizontal/></Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleOpenForm(shipment); }}>Edit</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleStatusChange(shipment.id, 'in-transit'); }}>Mark In-Transit</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleStatusChange(shipment.id, 'delivered'); }}>Mark Delivered</DropdownMenuItem>
                                                    <DropdownMenuItem className="text-destructive" onClick={(e) => { e.stopPropagation(); handleStatusChange(shipment.id, 'cancelled'); }}>Cancel</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                       </CardFooter>
                                   </Card>
                               )
                           })}
                       </div>
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
                                            {shipmentToEdit && <SelectItem value={shipmentToEdit.invoiceId}>{shipmentToEdit.invoiceId} - {shipmentToEdit.customerName}</SelectItem>}
                                            {paidInvoices.map(inv => <SelectItem key={inv.id} value={inv.id}>{inv.id} - {inv.customerName}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    {hasExistingShipment && !shipmentToEdit && (
                                        <FormDescription className="flex items-center gap-2 text-amber-600">
                                            <Info className="h-4 w-4" /> A shipment already exists for this invoice. Creating a new one will not replace it.
                                        </FormDescription>
                                    )}
                                <FormMessage /></FormItem>
                            )}/>
                            {selectedInvoice && (
                                <Card>
                                    <CardHeader className="p-4"><CardTitle className="text-base flex items-center gap-2"><FileText className="h-4 w-4" /> Details from Invoice {selectedInvoice.id}</CardTitle></CardHeader>
                                    <CardContent className="text-sm space-y-2 p-4 pt-0">
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

            <Dialog open={!!viewingShipment} onOpenChange={(open) => !open && setViewingShipment(null)}>
                {viewingShipment && <ShipmentDetail shipment={viewingShipment} onClose={() => setViewingShipment(null)} />}
            </Dialog>

        </div>
    );
}
