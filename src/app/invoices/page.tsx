
'use client'

import { useState, useEffect, useCallback, useMemo } from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { MoreHorizontal, PlusCircle, Trash2, ScanLine, Mail, Printer, FileText } from "lucide-react";
import { useSearchParams, useRouter } from 'next/navigation';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import InvoiceDetail from "@/components/InvoiceDetail";
import FullInvoice from "@/components/FullInvoice";
import { useAppContext } from "@/context/AppContext";
import type { Invoice, InvoiceItem } from "@/types";
import { Combobox } from "@/components/ui/combobox";
import BarcodeScanner from "@/components/BarcodeScanner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const invoiceItemSchema = z.object({
  productId: z.string().min(1, "Please select a product."),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1."),
});

const invoiceSchema = z.object({
  customerId: z.string().optional(),
  status: z.enum(['paid', 'pending', 'overdue']),
  date: z.date(),
  items: z.array(invoiceItemSchema).min(1, "Invoice must have at least one item."),
  discount: z.coerce.number().min(0).max(100).optional(),
  taxRate: z.coerce.number().min(0).optional(),
});

type InvoiceFormData = z.infer<typeof invoiceSchema>;

const statusVariant: { [key in Invoice['status']]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
    paid: 'default',
    pending: 'secondary',
    overdue: 'destructive',
    refunded: 'outline',
    'partially-refunded': 'outline',
};

export default function InvoicesPage() {
    const { invoices, setInvoices, customers, setCustomers, products, setProducts, addActivityLog, currentStore, currencySymbol } = useAppContext();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const [invoiceToEdit, setInvoiceToEdit] = useState<Invoice | null>(null);
    const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);
    const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);
    const [viewingFullInvoice, setViewingFullInvoice] = useState<Invoice | null>(null);
    const { toast } = useToast();
    const router = useRouter();
    const searchParams = useSearchParams();

    const form = useForm<InvoiceFormData>({
        resolver: zodResolver(invoiceSchema),
        defaultValues: {
            customerId: 'none',
            status: 'pending',
            date: new Date(),
            items: [{ productId: '', quantity: 1 }],
            discount: 0,
            taxRate: 0,
        },
    });
    
    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "items"
    });

    const storeInvoices = invoices.filter(i => i.storeId === currentStore?.id);

    const watchedItems = useWatch({ control: form.control, name: 'items' });
    const watchedDiscount = useWatch({ control: form.control, name: 'discount' }) || 0;
    const watchedTaxRate = useWatch({ control: form.control, name: 'taxRate' }) || 0;

    const subtotal = useMemo(() => watchedItems.reduce((acc, item) => {
        const product = products.find(p => p.id === item.productId);
        return acc + (product ? product.price * (item.quantity || 0) : 0);
    }, 0), [watchedItems, products]);

    const discountAmount = useMemo(() => subtotal * (watchedDiscount / 100), [subtotal, watchedDiscount]);
    const taxAmount = useMemo(() => (subtotal - discountAmount) * (watchedTaxRate / 100), [subtotal, discountAmount, watchedTaxRate]);
    const totalAmount = useMemo(() => subtotal - discountAmount + taxAmount, [subtotal, discountAmount, taxAmount]);

    const productOptions = useMemo(() => products.map(p => ({ label: p.name, value: p.id })), [products]);

    const handleOpenForm = useCallback((invoice: Invoice | null = null) => {
        setInvoiceToEdit(invoice);
        setIsFormOpen(true);
    }, []);

    useEffect(() => {
        if (searchParams.get('action') === 'new') {
            handleOpenForm(null);
            router.replace('/invoices', { scroll: false });
        }
    }, [searchParams, handleOpenForm, router]);

    useEffect(() => {
        if (isFormOpen && invoiceToEdit) {
            form.reset({
                customerId: invoiceToEdit.customerId || 'none',
                status: invoiceToEdit.status as 'paid' | 'pending' | 'overdue',
                date: new Date(invoiceToEdit.date),
                items: invoiceToEdit.items.map(item => ({ productId: item.productId, quantity: item.quantity })),
                discount: invoiceToEdit.discount || 0,
                taxRate: invoiceToEdit.taxRate || 0,
            });
        } else if (isFormOpen && !invoiceToEdit) {
            form.reset({
                customerId: 'none',
                status: 'pending',
                date: new Date(),
                items: [{ productId: '', quantity: 1 }],
                discount: 0,
                taxRate: 0,
            });
        }
    }, [invoiceToEdit, isFormOpen, form]);

    const handleScanSuccess = (productId: string) => {
        const product = products.find(p => p.id === productId);
        if (product) {
            append({ productId: product.id, quantity: 1 });
            toast({ title: "Product Added by Scan", description: product.name });
        } else {
            toast({ variant: 'destructive', title: "Product Not Found", description: `No product matched the scanned code.` });
        }
        setIsScannerOpen(false);
    };

    const onSubmit = (data: InvoiceFormData) => {
        const customer = customers.find(c => c.id === data.customerId);

        const newInvoiceItems: InvoiceItem[] = data.items.map(item => {
            const product = products.find(p => p.id === item.productId)!;
            return {
                productId: product.id,
                productName: product.name,
                quantity: item.quantity,
                price: product.price,
                cost: product.cost,
            };
        });

        // Update product stock
        const updatedProducts = [...products];
        let stockSufficient = true;
        
        data.items.forEach(item => {
            const productIndex = updatedProducts.findIndex(p => p.id === item.productId);
            if (productIndex !== -1) {
                const originalStock = invoiceToEdit ? 
                    (invoiceToEdit.items.find(i => i.productId === item.productId)?.quantity || 0) + updatedProducts[productIndex].stock :
                    updatedProducts[productIndex].stock;
                
                if (originalStock < item.quantity) {
                    stockSufficient = false;
                    toast({ variant: 'destructive', title: 'Insufficient Stock', description: `Not enough stock for ${updatedProducts[productIndex].name}. Available: ${originalStock}.`});
                }
            }
        });

        if (!stockSufficient) return;

        data.items.forEach(item => {
             const productIndex = updatedProducts.findIndex(p => p.id === item.productId);
             if (productIndex !== -1) {
                const originalItem = invoiceToEdit?.items.find(i => i.productId === item.productId);
                const stockChange = item.quantity - (originalItem?.quantity || 0);
                updatedProducts[productIndex].stock -= stockChange;
             }
        });
        setProducts(updatedProducts);

        // Loyalty Points Logic
        if (data.status === 'paid' && data.customerId && data.customerId !== 'none') {
            const wasAlreadyPaid = invoiceToEdit?.status === 'paid';
            
            if (!wasAlreadyPaid) { // Award points only if newly paid
                const customerIndex = customers.findIndex(c => c.id === data.customerId);
                if (customerIndex > -1) {
                    const updatedCustomers = [...customers];
                    const customerToUpdate = { ...updatedCustomers[customerIndex] };
                    
                    const pointsEarned = Math.floor(totalAmount);
                    customerToUpdate.loyaltyPoints = (customerToUpdate.loyaltyPoints || 0) + pointsEarned;

                    // Tier logic
                    if (customerToUpdate.loyaltyPoints >= 2000 && customerToUpdate.tier !== 'Gold') {
                        customerToUpdate.tier = 'Gold';
                    } else if (customerToUpdate.loyaltyPoints >= 500 && customerToUpdate.tier === 'Bronze') {
                        customerToUpdate.tier = 'Silver';
                    }

                    updatedCustomers[customerIndex] = customerToUpdate;
                    setCustomers(updatedCustomers);
                    toast({ title: "Loyalty Points Awarded!", description: `${customerToUpdate.name} earned ${pointsEarned} points.` });
                }
            }
        }


        if (invoiceToEdit) {
            setInvoices(invoices.map(inv => inv.id === invoiceToEdit.id ? {
                ...inv,
                customerId: data.customerId === 'none' ? undefined : data.customerId,
                customerName: data.customerId === 'none' ? undefined : customer?.name,
                status: data.status,
                date: format(data.date, 'yyyy-MM-dd'),
                items: newInvoiceItems,
                amount: totalAmount,
                discount: data.discount,
                taxRate: data.taxRate,
            } : inv));
            toast({ title: "Invoice Updated" });
            addActivityLog('Invoice Updated', `Updated invoice #${invoiceToEdit.id}. New total: ${currencySymbol}${totalAmount.toFixed(2)}`);
        } else {
            const newInvoice: Invoice = {
                id: `INV-${String(invoices.length + 1).padStart(3, '0')}`,
                storeId: currentStore?.id,
                customerId: data.customerId === 'none' ? undefined : data.customerId,
                customerName: data.customerId === 'none' ? undefined : customer?.name,
                status: data.status,
                date: format(data.date, 'yyyy-MM-dd'),
                items: newInvoiceItems,
                amount: totalAmount,
                discount: data.discount,
                taxRate: data.taxRate,
            };
            setInvoices([newInvoice, ...invoices]);
            toast({ title: "Invoice Created" });
            addActivityLog('Invoice Created', `Created invoice #${newInvoice.id} for ${currencySymbol}${totalAmount.toFixed(2)}`);
        }
        setIsFormOpen(false);
        setInvoiceToEdit(null);
    };
    
    const handleDelete = () => {
        if (!invoiceToDelete) return;
        addActivityLog('Invoice Deleted', `Deleted invoice #${invoiceToDelete.id}.`);
        setInvoices(invoices.filter(inv => inv.id !== invoiceToDelete.id));
        toast({ title: "Invoice Deleted" });
        setInvoiceToDelete(null);
    };

    const InvoiceTable = ({ invoices, onEdit, onDelete, onView, onViewFull }: { invoices: Invoice[], onEdit: (invoice: Invoice) => void, onDelete: (invoice: Invoice) => void, onView: (invoice: Invoice) => void, onViewFull: (invoice: Invoice) => void }) => (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-[100px]">Invoice ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead className="hidden md:table-cell">Amount</TableHead>
                    <TableHead className="hidden md:table-cell">Status</TableHead>
                    <TableHead className="hidden lg:table-cell">Date</TableHead>
                    <TableHead className="text-right w-[140px]">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {invoices.map(invoice => (
                    <TableRow key={invoice.id}>
                        <TableCell onClick={() => onView(invoice)} className="font-medium cursor-pointer">{invoice.id}</TableCell>
                        <TableCell onClick={() => onView(invoice)} className="cursor-pointer">
                            <div className="truncate">{invoice.customerName || 'N/A'}</div>
                            <div className="text-sm text-muted-foreground md:hidden">
                                {currencySymbol}{invoice.amount.toFixed(2)}
                            </div>
                        </TableCell>
                        <TableCell onClick={() => onView(invoice)} className="hidden md:table-cell cursor-pointer">{currencySymbol}{invoice.amount.toFixed(2)}</TableCell>
                        <TableCell onClick={() => onView(invoice)} className="hidden md:table-cell cursor-pointer"><Badge variant={statusVariant[invoice.status]} className="capitalize">{invoice.status.replace('-', ' ')}</Badge></TableCell>
                        <TableCell onClick={() => onView(invoice)} className="hidden lg:table-cell cursor-pointer">{new Date(invoice.date).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                           <TooltipProvider>
                                <div className="flex items-center justify-end gap-1">
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button variant="ghost" size="icon" onClick={() => onView(invoice)}>
                                                <Printer className="h-4 w-4" />
                                                <span className="sr-only">View Receipt</span>
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>View Receipt</p>
                                        </TooltipContent>
                                    </Tooltip>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button variant="ghost" size="icon" onClick={() => onViewFull(invoice)}>
                                                <FileText className="h-4 w-4" />
                                                <span className="sr-only">View Full Invoice</span>
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>View Full Invoice</p>
                                        </TooltipContent>
                                    </Tooltip>

                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button aria-haspopup="true" size="icon" variant="ghost">
                                                <MoreHorizontal className="h-4 w-4" />
                                                <span className="sr-only">Toggle menu</span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>More Actions</DropdownMenuLabel>
                                            <DropdownMenuItem onClick={() => onEdit(invoice)}>Edit</DropdownMenuItem>
                                            <DropdownMenuItem className="text-destructive" onClick={() => onDelete(invoice)}>Delete</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </TooltipProvider>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );

    return (
        <div className="flex flex-col h-full">
            <Header title="Invoices" />
            <main className="flex-1 overflow-auto p-4 md:p-6">
                <Card>
                    <CardHeader>
                        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                            <div><CardTitle>Invoices</CardTitle><CardDescription>Manage and track all your customer invoices for {currentStore?.name}.</CardDescription></div>
                            <Button size="sm" className="gap-1 w-full md:w-auto" onClick={() => handleOpenForm()}>
                                <PlusCircle className="h-4 w-4" /> Create Invoice
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="all">
                            <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-auto">
                                <TabsTrigger value="all">All</TabsTrigger>
                                <TabsTrigger value="paid">Paid</TabsTrigger>
                                <TabsTrigger value="pending">Pending</TabsTrigger>
                                <TabsTrigger value="overdue">Overdue</TabsTrigger>
                                <TabsTrigger value="refunded">Refunded</TabsTrigger>
                            </TabsList>
                            <TabsContent value="all"><InvoiceTable invoices={storeInvoices} onView={setViewingInvoice} onEdit={handleOpenForm} onDelete={setInvoiceToDelete} onViewFull={setViewingFullInvoice} /></TabsContent>
                            <TabsContent value="paid"><InvoiceTable invoices={storeInvoices.filter(i => i.status === 'paid')} onView={setViewingInvoice} onEdit={handleOpenForm} onDelete={setInvoiceToDelete} onViewFull={setViewingFullInvoice} /></TabsContent>
                            <TabsContent value="pending"><InvoiceTable invoices={storeInvoices.filter(i => i.status === 'pending')} onView={setViewingInvoice} onEdit={handleOpenForm} onDelete={setInvoiceToDelete} onViewFull={setViewingFullInvoice} /></TabsContent>
                            <TabsContent value="overdue"><InvoiceTable invoices={storeInvoices.filter(i => i.status === 'overdue')} onView={setViewingInvoice} onEdit={handleOpenForm} onDelete={setInvoiceToDelete} onViewFull={setViewingFullInvoice} /></TabsContent>
                            <TabsContent value="refunded"><InvoiceTable invoices={storeInvoices.filter(i => i.status === 'refunded' || i.status === 'partially-refunded')} onView={setViewingInvoice} onEdit={handleOpenForm} onDelete={setInvoiceToDelete} onViewFull={setViewingFullInvoice} /></TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </main>

            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="sm:max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>{invoiceToEdit ? 'Edit Invoice' : 'Create Invoice'}</DialogTitle>
                        <DialogDescription>{invoiceToEdit ? 'Update details.' : 'Fill out the form to create a new invoice.'}</DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[80vh] overflow-y-auto px-2">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <FormField control={form.control} name="customerId" render={({ field }) => (
                                    <FormItem><FormLabel>Customer</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a customer" /></SelectTrigger></FormControl>
                                            <SelectContent><SelectItem value="none">None</SelectItem>{customers.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                                        </Select><FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="date" render={({ field }) => (
                                    <FormItem className="flex flex-col"><FormLabel>Date</FormLabel><FormControl><DatePicker date={field.value} setDate={field.onChange} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                 <FormField control={form.control} name="status" render={({ field }) => (
                                    <FormItem><FormLabel>Status</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                            <SelectContent><SelectItem value="paid">Paid</SelectItem><SelectItem value="pending">Pending</SelectItem><SelectItem value="overdue">Overdue</SelectItem></SelectContent>
                                        </Select><FormMessage />
                                    </FormItem>
                                )}/>
                            </div>
                            
                            <div className="space-y-2">
                                <FormLabel>Invoice Items</FormLabel>
                                <div className="space-y-2 rounded-lg border p-2">
                                {fields.map((field, index) => (
                                    <div key={field.id} className="flex flex-wrap items-end gap-2">
                                        <FormField control={form.control} name={`items.${index}.productId`} render={({ field }) => (
                                            <FormItem className="flex-1 min-w-[200px]">
                                                <FormControl>
                                                    <Combobox
                                                        options={productOptions}
                                                        value={field.value}
                                                        onValueChange={field.onChange}
                                                        placeholder="Select a product..."
                                                        searchPlaceholder="Search products..."
                                                        emptyText="No products found."
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name={`items.${index}.quantity`} render={({ field }) => (
                                            <FormItem className="w-24"><FormControl><Input type="number" placeholder="Qty" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                        <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}><Trash2 className="h-4 w-4" /></Button>
                                    </div>
                                ))}
                                <div className="flex gap-2">
                                    <Button type="button" variant="outline" size="sm" onClick={() => append({ productId: '', quantity: 1 })}>
                                        <PlusCircle className="mr-2 h-4 w-4" /> Add Item
                                    </Button>
                                    <Button type="button" variant="outline" size="sm" onClick={() => setIsScannerOpen(true)}>
                                        <ScanLine className="mr-2 h-4 w-4" /> Scan Product
                                    </Button>
                                </div>
                                </div>
                                 <FormMessage>{form.formState.errors.items?.message}</FormMessage>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField control={form.control} name="discount" render={({ field }) => (
                                    <FormItem><FormLabel>Discount (%)</FormLabel><FormControl><Input type="number" step="0.1" placeholder="e.g. 5" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="taxRate" render={({ field }) => (
                                    <FormItem><FormLabel>Tax Rate (%)</FormLabel><FormControl><Input type="number" step="0.1" placeholder="e.g. 8.5" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                            </div>

                            <Card className="p-4 bg-muted/50">
                                <div className="space-y-2">
                                    <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{currencySymbol}{subtotal.toFixed(2)}</span></div>
                                    <div className="flex justify-between"><span className="text-muted-foreground">Discount ({watchedDiscount}%)</span><span className="text-destructive">-{currencySymbol}{discountAmount.toFixed(2)}</span></div>
                                    <div className="flex justify-between"><span className="text-muted-foreground">Tax ({watchedTaxRate}%)</span><span>+{currencySymbol}{taxAmount.toFixed(2)}</span></div>
                                    <div className="flex justify-between font-bold text-lg"><span >Total Amount</span><span>{currencySymbol}{totalAmount.toFixed(2)}</span></div>
                                </div>
                            </Card>

                            <DialogFooter>
                                <Button type="submit">{invoiceToEdit ? 'Save Changes' : 'Create Invoice'}</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

             <Dialog open={isScannerOpen} onOpenChange={setIsScannerOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Scan Barcode</DialogTitle>
                        <DialogDescription>Point your camera at a product barcode.</DialogDescription>
                    </DialogHeader>
                    <BarcodeScanner onScan={handleScanSuccess} onClose={() => setIsScannerOpen(false)} />
                </DialogContent>
            </Dialog>

            <Dialog open={!!viewingInvoice} onOpenChange={(open) => !open && setViewingInvoice(null)}>
                {viewingInvoice && <InvoiceDetail invoice={viewingInvoice} />}
            </Dialog>

             <Dialog open={!!viewingFullInvoice} onOpenChange={(open) => !open && setViewingFullInvoice(null)}>
                {viewingFullInvoice && <FullInvoice invoice={viewingFullInvoice} />}
            </Dialog>

            <AlertDialog open={!!invoiceToDelete} onOpenChange={(open) => !open && setInvoiceToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader><AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone. This will permanently delete invoice {invoiceToDelete?.id}.</AlertDialogDescription></AlertDialogHeader>
                    <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction></AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
