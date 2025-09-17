
'use client'

import React, { useState, useMemo } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import Header from "@/components/Header";
import { useToast } from "@/hooks/use-toast";
import { useAppContext } from '@/context/AppContext';
import type { Shipment, ShipmentStatus, Invoice, InvoiceItem, Product } from '@/types';
import { Badge } from '@/components/ui/badge';
import { format, parseISO } from 'date-fns';
import { PlusCircle, Ship, Search, Truck, CheckboxIcon, Package, MoreHorizontal, Trash2 } from '@/components/icons';
import { ShipmentDetail } from '@/components/ShipmentDetail';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Label } from '@/components/ui/label';


const shipmentItemSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  productName: z.string(),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
  price: z.number(),
  cost: z.number(),
});

const shipmentSchema = z.object({
  customId: z.string().optional(),
  invoiceId: z.string().min(1, "Please select an invoice."),
  shippingAddress: z.string().min(1, "Shipping address is required."),
  trackingNumber: z.string().optional(),
  assignedDriverId: z.string().optional(),
  vehicleId: z.string().optional(),
  items: z.array(shipmentItemSchema).min(1, "Shipment must have at least one item."),
});

type ShipmentFormData = z.infer<typeof shipmentSchema>;

const statusVariant: { [key in ShipmentStatus]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
    pending: 'secondary',
    processing: 'secondary',
    'in-transit': 'default',
    'out-for-delivery': 'default',
    delivered: 'outline',
    failed: 'destructive',
    cancelled: 'destructive'
};

const timelineSteps = ['pending', 'processing', 'in-transit', 'out-for-delivery', 'delivered'];

export default function ShipmentsPage() {
    const { 
        shipments, setShipments, 
        invoices, employees, assets, products, customers,
        addActivityLog, user: currentUser
    } = useAppContext();
    const { toast } = useToast();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isCustomizeItemsOpen, setIsCustomizeItemsOpen] = useState(false);
    const [shipmentToEdit, setShipmentToEdit] = useState<Shipment | null>(null);
    const [shipmentToView, setShipmentToView] = useState<Shipment | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<ShipmentStatus | 'all'>('all');
    const [selectedShipmentIds, setSelectedShipmentIds] = useState<string[]>([]);

    const form = useForm<ShipmentFormData>({
        resolver: zodResolver(shipmentSchema),
        defaultValues: {
            customId: '',
            invoiceId: '',
            shippingAddress: '',
            trackingNumber: '',
            assignedDriverId: 'unassigned',
            vehicleId: 'unassigned',
            items: [],
        }
    });

    const { fields: customItemsFields, append, remove } = useFieldArray({
      control: form.control,
      name: "items"
    });

    const canManage = currentUser?.role === 'admin' || currentUser?.role === 'manager';
    const isAdmin = currentUser?.role === 'admin';

    const drivers = useMemo(() => employees.filter(e => e.jobTitle === 'Delivery Driver'), [employees]);
    const vehicles = useMemo(() => assets.filter(a => a.category === 'Vehicle' && a.status === 'in-use'), [assets]);
    
    const availableInvoices = useMemo(() => 
        invoices.filter(inv => inv.status === 'paid' && !shipments.some(s => s.invoiceId === inv.id && s.status !== 'cancelled'))
    , [invoices, shipments]);


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
                    shipment.id.toLowerCase().includes(lowercasedFilter) ||
                    shipment.customId?.toLowerCase().includes(lowercasedFilter) ||
                    shipment.trackingNumber?.toLowerCase().includes(lowercasedFilter) ||
                    shipment.customerName.toLowerCase().includes(lowercasedFilter) ||
                    shipment.invoiceId.toLowerCase().includes(lowercasedFilter)
                );
            })
            .sort((a, b) => new Date(b.dispatchDate).getTime() - new Date(a.dispatchDate).getTime());
    }, [shipments, searchTerm, statusFilter]);

    const handleOpenForm = (shipment: Shipment | null = null) => {
        setShipmentToEdit(shipment);
        if (shipment) {
            form.reset({
                customId: shipment.customId,
                invoiceId: shipment.invoiceId,
                shippingAddress: shipment.shippingAddress,
                trackingNumber: shipment.trackingNumber,
                assignedDriverId: shipment.assignedDriverId || 'unassigned',
                vehicleId: shipment.vehicleId || 'unassigned',
                items: shipment.items
            });
        } else {
            form.reset({ customId: '', invoiceId: '', shippingAddress: '', trackingNumber: '', assignedDriverId: 'unassigned', vehicleId: 'unassigned', items: [] });
        }
        setIsFormOpen(true);
    };
    
    const handleInvoiceChange = (invoiceId: string) => {
        const invoice = invoices.find(inv => inv.id === invoiceId);
        if(invoice) {
          const customer = customers.find(c => c.id === invoice.customerId);
          form.setValue('shippingAddress', customer?.shippingAddress || '');
          form.setValue('items', invoice.items);
        } else {
          form.setValue('shippingAddress', '');
          form.setValue('items', []);
        }
    };


    const onSubmit = (data: ShipmentFormData) => {
        const invoice = invoices.find(inv => inv.id === data.invoiceId);
        if (!invoice) {
            toast({ variant: 'destructive', title: 'Invoice not found!' });
            return;
        }

        const driver = drivers.find(d => d.id === data.assignedDriverId);

        const newShipmentData = {
            customId: data.customId,
            invoiceId: invoice.id,
            customerId: invoice.customerId,
            customerName: invoice.customerName || 'N/A',
            items: data.items,
            shippingAddress: data.shippingAddress,
            trackingNumber: data.trackingNumber,
            assignedDriverId: data.assignedDriverId === 'unassigned' ? undefined : data.assignedDriverId,
            assignedDriverName: driver?.name,
            vehicleId: data.vehicleId === 'unassigned' ? undefined : data.vehicleId,
        }

        if (shipmentToEdit) {
            const updatedShipments = shipments.map(s => s.id === shipmentToEdit.id ? { ...s, ...newShipmentData } : s);
            setShipments(updatedShipments);
            toast({ title: 'Shipment Updated' });
            addActivityLog('Shipment Updated', `Updated shipment ${shipmentToEdit.customId || shipmentToEdit.id}`);
        } else {
            const newShipment: Shipment = {
                id: `SHIP-${Date.now()}`,
                status: 'pending',
                dispatchDate: new Date().toISOString(),
                ...newShipmentData,
            };
            setShipments([newShipment, ...shipments]);
            toast({ title: 'Shipment Created' });
            addActivityLog('Shipment Created', `Created shipment for invoice ${invoice.id}`);
        }
        setIsFormOpen(false);
    };

    const handleStatusChange = (shipmentId: string, newStatus: ShipmentStatus) => {
        setShipments(prev => prev.map(s => {
            if (s.id === shipmentId) {
                const updatedShipment = { ...s, status: newStatus };
                if (newStatus === 'delivered') {
                    updatedShipment.actualDeliveryDate = new Date().toISOString();
                }
                return updatedShipment;
            }
            return s;
        }));
        const shipment = shipments.find(s => s.id === shipmentId);
        addActivityLog('Shipment Status Updated', `Shipment ${shipment?.customId || shipment?.id} status changed to ${newStatus}`);
    };

    const handleBulkUpdate = (newStatus: ShipmentStatus) => {
        setShipments(prev => prev.map(s => {
            if (selectedShipmentIds.includes(s.id)) {
                 const updatedShipment = { ...s, status: newStatus };
                if (newStatus === 'delivered') {
                    updatedShipment.actualDeliveryDate = new Date().toISOString();
                }
                return updatedShipment;
            }
            return s;
        }));
        addActivityLog('Bulk Shipment Update', `Updated ${selectedShipmentIds.length} shipments to ${newStatus}`);
        toast({ title: 'Bulk Update Successful', description: `${selectedShipmentIds.length} shipments updated to ${newStatus}.`});
        setSelectedShipmentIds([]);
    };
    

    return (
        <div className="flex flex-col h-full">
            <Header title="Shipment Tracking" />
            <main className="flex-1 overflow-auto p-4 md:p-6">
                 <Card>
                    <CardHeader>
                        <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
                            <div>
                                <CardTitle>Manage Shipments</CardTitle>
                                <CardDescription>Track, search, and manage all your outgoing shipments.</CardDescription>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                                <div className="relative w-full md:w-auto">
                                    <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search by ID, customer..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full md:w-[250px] pl-8 bg-secondary"
                                    />
                                </div>
                                <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ShipmentStatus | 'all')}>
                                    <SelectTrigger className="w-full sm:w-[150px]">
                                        <SelectValue placeholder="Filter by status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Statuses</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="processing">Processing</SelectItem>
                                        <SelectItem value="in-transit">In Transit</SelectItem>
                                        <SelectItem value="out-for-delivery">Out for Delivery</SelectItem>
                                        <SelectItem value="delivered">Delivered</SelectItem>
                                        <SelectItem value="failed">Failed</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                                {canManage && (
                                <Button size="sm" className="gap-1 flex-shrink-0" onClick={() => handleOpenForm(null)}>
                                    <PlusCircle className="h-4 w-4" /> New Shipment
                                </Button>
                                )}
                            </div>
                        </div>
                        {selectedShipmentIds.length > 0 && (
                            <div className="mt-4 flex items-center gap-4">
                                <p className="text-sm text-muted-foreground">{selectedShipmentIds.length} shipment(s) selected.</p>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="sm">Bulk Actions</Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuLabel>Update Status To</DropdownMenuLabel>
                                        {timelineSteps.map(status => (
                                            <DropdownMenuItem key={status} onSelect={() => handleBulkUpdate(status as ShipmentStatus)}>
                                                {status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                            </DropdownMenuItem>
                                        ))}
                                        <DropdownMenuItem onSelect={() => handleBulkUpdate('failed')} className="text-destructive">Failed</DropdownMenuItem>
                                        <DropdownMenuItem onSelect={() => handleBulkUpdate('cancelled')} className="text-destructive">Cancelled</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        )}
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                           {filteredShipments.map(shipment => {
                                const currentStepIndex = timelineSteps.indexOf(shipment.status);
                                return (
                                <Card key={shipment.id}>
                                    <div className="flex items-center p-4">
                                         <Checkbox
                                            className="mr-4"
                                            checked={selectedShipmentIds.includes(shipment.id)}
                                            onCheckedChange={(checked) => {
                                                setSelectedShipmentIds(prev => checked ? [...prev, shipment.id] : prev.filter(id => id !== shipment.id))
                                            }}
                                        />
                                        <div className="grid grid-cols-1 sm:grid-cols-4 md:grid-cols-6 gap-4 items-center flex-1 cursor-pointer" onClick={() => setShipmentToView(shipment)}>
                                            <div className="font-medium">
                                                <p className="flex items-center gap-2"><Ship className="h-4 w-4 text-muted-foreground"/> {shipment.customId || shipment.id}</p>
                                                <p className="text-sm text-muted-foreground truncate">{shipment.customerName}</p>
                                            </div>
                                            <div className="sm:col-span-3 md:col-span-5 grid grid-cols-3 md:grid-cols-5 gap-4 items-center">
                                                <div className="md:col-span-3">
                                                    <div className="flex items-center">
                                                        {timelineSteps.map((step, index) => (
                                                            <React.Fragment key={step}>
                                                                <div className={`h-2.5 w-2.5 rounded-full ${index <= currentStepIndex ? 'bg-primary' : 'bg-muted'}`} />
                                                                {index < timelineSteps.length - 1 && <div className={`flex-1 h-0.5 ${index < currentStepIndex ? 'bg-primary' : 'bg-muted'}`} />}
                                                            </React.Fragment>
                                                        ))}
                                                    </div>
                                                    <p className="text-xs text-muted-foreground mt-1 capitalize">{shipment.status.replace('-', ' ')}</p>
                                                </div>
                                                <div className="hidden md:block">
                                                    <p className="text-xs text-muted-foreground">Driver</p>
                                                    <p className="font-medium truncate">{shipment.assignedDriverName || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-muted-foreground">Est. Delivery</p>
                                                    <p className="font-medium">{shipment.estimatedDeliveryDate ? format(parseISO(shipment.estimatedDeliveryDate), 'PPP') : 'N/A'}</p>
                                                </div>
                                            </div>
                                        </div>
                                        {canManage && (
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="ml-4"><MoreHorizontal className="h-4 w-4"/></Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                    <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                                                    {timelineSteps.map(status => (
                                                        <DropdownMenuItem key={status} onSelect={() => handleStatusChange(shipment.id, status as ShipmentStatus)} disabled={shipment.status === status}>
                                                            Mark as {status.replace('-', ' ')}
                                                        </DropdownMenuItem>
                                                    ))}
                                                    <DropdownMenuItem className="text-destructive" onSelect={() => handleStatusChange(shipment.id, 'failed')}>Mark as Failed</DropdownMenuItem>
                                                    <DropdownMenuItem className="text-destructive" onSelect={() => handleStatusChange(shipment.id, 'cancelled')}>Mark as Cancelled</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        )}
                                    </div>
                                </Card>
                                )
                           })}
                           {filteredShipments.length === 0 && <p className="text-muted-foreground text-center py-10">No shipments found.</p>}
                        </div>
                    </CardContent>
                </Card>
            </main>

            <Dialog open={!!shipmentToView} onOpenChange={(open) => !open && setShipmentToView(null)}>
                {shipmentToView && <ShipmentDetail shipment={shipmentToView} onClose={() => setShipmentToView(null)} />}
            </Dialog>

            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{shipmentToEdit ? 'Edit Shipment' : 'Create New Shipment'}</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                            {isAdmin && (
                                <FormField
                                    control={form.control}
                                    name="customId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Custom Shipment ID (Optional)</FormLabel>
                                            <FormControl><Input {...field} placeholder="e.g., CUST-001-SHIP" /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}
                            <FormField
                                control={form.control}
                                name="invoiceId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Link to Invoice</FormLabel>
                                        <Select onValueChange={(value) => { field.onChange(value); handleInvoiceChange(value); }} value={field.value} disabled={!!shipmentToEdit}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a paid invoice" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {availableInvoices.map(inv => (
                                                    <SelectItem key={inv.id} value={inv.id}>{inv.id} - {inv.customerName}</SelectItem>
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
                                        <FormControl><Textarea {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="trackingNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tracking Number (Optional)</FormLabel>
                                        <FormControl><Input {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <FormField control={form.control} name="assignedDriverId" render={({ field }) => (
                                    <FormItem><FormLabel>Assign Driver</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select driver" /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                <SelectItem value="unassigned">Unassigned</SelectItem>
                                                {drivers.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select><FormMessage />
                                    </FormItem>
                                )}/>
                                <FormField control={form.control} name="vehicleId" render={({ field }) => (
                                    <FormItem><FormLabel>Assign Vehicle</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select vehicle" /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                <SelectItem value="unassigned">Unassigned</SelectItem>
                                                {vehicles.map(v => <SelectItem key={v.id} value={v.id}>{v.name} ({v.serialNumber})</SelectItem>)}
                                            </SelectContent>
                                        </Select><FormMessage />
                                    </FormItem>
                                )}/>
                            </div>
                            {isAdmin && (
                                <Button type="button" variant="outline" onClick={() => setIsCustomizeItemsOpen(true)} disabled={form.getValues('items').length === 0}>
                                    Customize Items
                                </Button>
                            )}
                            <DialogFooter>
                                <Button type="submit">{shipmentToEdit ? 'Save Changes' : 'Create Shipment'}</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            <Dialog open={isCustomizeItemsOpen} onOpenChange={setIsCustomizeItemsOpen}>
              <DialogContent className="sm:max-w-xl">
                  <DialogHeader>
                      <DialogTitle>Customize Shipment Items</DialogTitle>
                      <DialogDescription>Add, remove, or change quantities for this specific shipment.</DialogDescription>
                  </DialogHeader>
                  <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto">
                      {customItemsFields.map((field, index) => (
                          <div key={field.id} className="flex items-end gap-2">
                              <div className="flex-1">
                                  <Label>Product</Label>
                                  <Input value={field.productName} disabled />
                              </div>
                              <FormField
                                  control={form.control}
                                  name={`items.${index}.quantity`}
                                  render={({ field }) => (
                                      <FormItem className="w-24">
                                          <FormLabel>Qty</FormLabel>
                                          <FormControl>
                                              <Input type="number" {...field} />
                                          </FormControl>
                                      </FormItem>
                                  )}
                              />
                              <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}><Trash2 className="h-4 w-4" /></Button>
                          </div>
                      ))}
                       <Select onValueChange={(productId) => {
                          const product = products.find(p => p.id === productId);
                          if(product) {
                            append({ productId: product.id, productName: product.name, quantity: 1, price: product.price, cost: product.cost });
                          }
                       }}>
                          <SelectTrigger>
                            <SelectValue placeholder="Add another product..." />
                          </SelectTrigger>
                          <SelectContent>
                              {products.filter(p => !form.getValues('items').some(item => item.productId === p.id)).map(p => (
                                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                              ))}
                          </SelectContent>
                      </Select>
                  </div>
                  <DialogFooter>
                      <Button onClick={() => setIsCustomizeItemsOpen(false)}>Done</Button>
                  </DialogFooter>
              </DialogContent>
            </Dialog>
        </div>
    );
}

    