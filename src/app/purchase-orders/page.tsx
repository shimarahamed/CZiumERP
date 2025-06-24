'use client'

import { useState, useEffect } from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { MoreHorizontal, PlusCircle, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import { useAppContext } from "@/context/AppContext";
import type { PurchaseOrder, PurchaseOrderItem } from "@/types";

const poItemSchema = z.object({
  productId: z.string().min(1, "Please select a product."),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1."),
  cost: z.coerce.number().min(0, "Cost must be non-negative."),
});

const poSchema = z.object({
  vendorId: z.string().min(1, "Please select a vendor."),
  status: z.enum(['pending', 'ordered', 'received', 'cancelled']),
  orderDate: z.date(),
  expectedDeliveryDate: z.date().optional(),
  items: z.array(poItemSchema).min(1, "PO must have at least one item."),
});

type POFormData = z.infer<typeof poSchema>;

const statusVariant: { [key in PurchaseOrder['status']]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
    pending: 'secondary',
    ordered: 'default',
    received: 'outline',
    cancelled: 'destructive'
};

export default function PurchaseOrdersPage() {
    const { 
        purchaseOrders, setPurchaseOrders, 
        vendors, products, setProducts, 
        addActivityLog, currentStore, currencySymbol, user
    } = useAppContext();
    const { toast } = useToast();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [poToEdit, setPoToEdit] = useState<PurchaseOrder | null>(null);
    const [poToMarkReceived, setPoToMarkReceived] = useState<PurchaseOrder | null>(null);

    const form = useForm<POFormData>({
        resolver: zodResolver(poSchema),
        defaultValues: {
            vendorId: '',
            status: 'pending',
            orderDate: new Date(),
            items: [],
        },
    });

    const { fields, append, remove, replace } = useFieldArray({
        control: form.control,
        name: "items"
    });

    const watchedItems = useWatch({ control: form.control, name: 'items' });
    const totalCost = watchedItems.reduce((acc, item) => {
        return acc + (item.cost * item.quantity);
    }, 0);

    const canManage = user?.role === 'admin' || user?.role === 'manager';

    useEffect(() => {
        if (isFormOpen && poToEdit) {
            form.reset({
                vendorId: poToEdit.vendorId,
                status: poToEdit.status,
                orderDate: new Date(poToEdit.orderDate),
                expectedDeliveryDate: poToEdit.expectedDeliveryDate ? new Date(poToEdit.expectedDeliveryDate) : undefined,
                items: poToEdit.items.map(item => ({ productId: item.productId, quantity: item.quantity, cost: item.cost })),
            });
        } else if (isFormOpen && !poToEdit) {
            form.reset({
                vendorId: '',
                status: 'pending',
                orderDate: new Date(),
                expectedDeliveryDate: undefined,
                items: [],
            });
        }
    }, [poToEdit, isFormOpen, form]);


    const handleOpenForm = (po: PurchaseOrder | null = null) => {
        setPoToEdit(po);
        setIsFormOpen(true);
    };

    const onSubmit = (data: POFormData) => {
        const vendor = vendors.find(v => v.id === data.vendorId)!;

        const newPOItems: PurchaseOrderItem[] = data.items.map(item => {
            const product = products.find(p => p.id === item.productId)!;
            return {
                productId: product.id,
                productName: product.name,
                quantity: item.quantity,
                cost: item.cost,
            };
        });

        const newTotalCost = newPOItems.reduce((acc, item) => acc + (item.cost * item.quantity), 0);

        if (poToEdit) {
            const updatedPO = {
                ...poToEdit,
                vendorId: data.vendorId,
                vendorName: vendor.name,
                status: data.status,
                orderDate: format(data.orderDate, 'yyyy-MM-dd'),
                expectedDeliveryDate: data.expectedDeliveryDate ? format(data.expectedDeliveryDate, 'yyyy-MM-dd') : undefined,
                items: newPOItems,
                totalCost: newTotalCost,
            };
            setPurchaseOrders(purchaseOrders.map(po => po.id === poToEdit.id ? updatedPO : po));
            toast({ title: "Purchase Order Updated" });
            addActivityLog('Purchase Order Updated', `Updated PO #${poToEdit.id}.`);
        } else {
            const newPO: PurchaseOrder = {
                id: `PO-${String(purchaseOrders.length + 1).padStart(3, '0')}`,
                storeId: currentStore?.id,
                vendorId: data.vendorId,
                vendorName: vendor.name,
                status: data.status,
                orderDate: format(data.orderDate, 'yyyy-MM-dd'),
                expectedDeliveryDate: data.expectedDeliveryDate ? format(data.expectedDeliveryDate, 'yyyy-MM-dd') : undefined,
                items: newPOItems,
                totalCost: newTotalCost,
            };
            setPurchaseOrders([newPO, ...purchaseOrders]);
            toast({ title: "Purchase Order Created" });
            addActivityLog('Purchase Order Created', `Created PO #${newPO.id} for ${vendor.name}.`);
        }
        setIsFormOpen(false);
        setPoToEdit(null);
    };

    const handleMarkAsReceived = () => {
        if (!poToMarkReceived) return;

        setProducts(currentProducts => {
            const newProducts = [...currentProducts];
            poToMarkReceived.items.forEach(item => {
                const productIndex = newProducts.findIndex(p => p.id === item.productId);
                if (productIndex !== -1) {
                    newProducts[productIndex].stock += item.quantity;
                }
            });
            return newProducts;
        });

        setPurchaseOrders(currentPOs =>
            currentPOs.map(po =>
                po.id === poToMarkReceived.id
                    ? { ...po, status: 'received', receivedDate: format(new Date(), 'yyyy-MM-dd') }
                    : po
            )
        );

        addActivityLog('PO Received', `PO #${poToMarkReceived.id} marked as received. Stock updated.`);
        toast({ title: "Purchase Order Received", description: "Product stock has been updated." });
        setPoToMarkReceived(null);
    };

    return (
        <div className="flex flex-col h-full">
            <Header title="Purchase Orders" />
            <main className="flex-1 overflow-auto p-4 md:p-6">
                <Card>
                    <CardHeader>
                        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                            <div>
                                <CardTitle>Purchase Orders</CardTitle>
                                <CardDescription>Create and manage purchase orders for your vendors.</CardDescription>
                            </div>
                            {canManage && (
                                <Button size="sm" className="gap-1 w-full md:w-auto" onClick={() => handleOpenForm()}>
                                    <PlusCircle className="h-4 w-4" /> Create Purchase Order
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                         <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>PO ID</TableHead>
                                    <TableHead>Vendor</TableHead>
                                    <TableHead className="hidden md:table-cell">Total Cost</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="hidden lg:table-cell">Order Date</TableHead>
                                    <TableHead><span className="sr-only">Actions</span></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {purchaseOrders.map(po => (
                                    <TableRow key={po.id}>
                                        <TableCell className="font-medium">{po.id}</TableCell>
                                        <TableCell>{po.vendorName}</TableCell>
                                        <TableCell className="hidden md:table-cell">{currencySymbol} {po.totalCost.toFixed(2)}</TableCell>
                                        <TableCell><Badge variant={statusVariant[po.status]} className="capitalize">{po.status}</Badge></TableCell>
                                        <TableCell className="hidden lg:table-cell">{new Date(po.orderDate).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button aria-haspopup="true" size="icon" variant="ghost" disabled={!canManage}>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    {po.status !== 'received' && po.status !== 'cancelled' && (
                                                        <DropdownMenuItem onClick={() => setPoToMarkReceived(po)}>Mark as Received</DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuItem onClick={() => handleOpenForm(po)}>Edit</DropdownMenuItem>
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
                        <DialogTitle>{poToEdit ? 'Edit PO' : 'Create Purchase Order'}</DialogTitle>
                        <DialogDescription>{poToEdit ? 'Update details.' : 'Fill out the form to create a new PO.'}</DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto px-2">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField control={form.control} name="vendorId" render={({ field }) => (
                                    <FormItem><FormLabel>Vendor</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a vendor" /></SelectTrigger></FormControl>
                                            <SelectContent>{vendors.map(v => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}</SelectContent>
                                        </Select><FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="status" render={({ field }) => (
                                    <FormItem><FormLabel>Status</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                <SelectItem value="pending">Pending</SelectItem>
                                                <SelectItem value="ordered">Ordered</SelectItem>
                                                <SelectItem value="received">Received</SelectItem>
                                                <SelectItem value="cancelled">Cancelled</SelectItem>
                                            </SelectContent>
                                        </Select><FormMessage />
                                    </FormItem>
                                )}/>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField control={form.control} name="orderDate" render={({ field }) => (
                                    <FormItem className="flex flex-col pt-2"><FormLabel>Order Date</FormLabel><FormControl><DatePicker date={field.value} setDate={field.onChange} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name="expectedDeliveryDate" render={({ field }) => (
                                    <FormItem className="flex flex-col pt-2"><FormLabel>Expected Delivery</FormLabel><FormControl><DatePicker date={field.value} setDate={field.onChange} /></FormControl><FormMessage /></FormItem>
                                )}/>
                            </div>
                            
                            <div className="space-y-2">
                                <FormLabel>Items to Order</FormLabel>
                                <div className="space-y-2 rounded-lg border p-2">
                                {fields.map((field, index) => (
                                    <div key={field.id} className="flex flex-wrap items-end gap-2">
                                        <FormField control={form.control} name={`items.${index}.productId`} render={({ field }) => (
                                            <FormItem className="flex-1 min-w-[150px]"><FormControl>
                                                <Select onValueChange={field.onChange} value={field.value}><SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
                                                    <SelectContent>{products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                                                </Select>
                                            </FormControl><FormMessage /></FormItem>
                                        )} />
                                        <FormField control={form.control} name={`items.${index}.quantity`} render={({ field }) => (
                                            <FormItem className="w-24"><FormLabel className="sr-only">Qty</FormLabel><FormControl><Input type="number" placeholder="Qty" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                        <FormField control={form.control} name={`items.${index}.cost`} render={({ field }) => (
                                            <FormItem className="w-28"><FormLabel className="sr-only">Cost</FormLabel><FormControl><Input type="number" placeholder="Cost/item" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                        <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}><Trash2 className="h-4 w-4" /></Button>
                                    </div>
                                ))}
                                <Button type="button" variant="outline" size="sm" onClick={() => append({ productId: '', quantity: 1, cost: 0 })}>
                                    <PlusCircle className="mr-2 h-4 w-4" /> Add Item
                                </Button>
                                </div>
                                 <FormMessage>{form.formState.errors.items?.message}</FormMessage>
                            </div>
                            
                            <div className="flex justify-end pt-4">
                                <div className="text-right">
                                    <p className="text-muted-foreground">Total Order Cost</p>
                                    <p className="text-2xl font-bold">{currencySymbol} {totalCost.toFixed(2)}</p>
                                </div>
                            </div>

                            <DialogFooter>
                                <Button type="submit">{poToEdit ? 'Save Changes' : 'Create PO'}</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!poToMarkReceived} onOpenChange={(open) => !open && setPoToMarkReceived(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Mark as Received?</AlertDialogTitle>
                        <AlertDialogDescription>This will add the item quantities from PO #{poToMarkReceived?.id} to your inventory stock. This action cannot be undone.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleMarkAsReceived}>Confirm Receipt</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
