'use client'

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { MoreHorizontal, PlusCircle } from "lucide-react";

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

import { initialInvoices, customers as initialCustomers } from "@/lib/data";
import Header from "@/components/Header";
import type { Invoice, Customer } from "@/types";

const invoiceSchema = z.object({
  customerId: z.string().optional(),
  amount: z.coerce.number().positive({ message: "Amount must be a positive number." }),
  status: z.enum(['paid', 'pending', 'overdue'], { required_error: "Please select a status." }),
  date: z.date({ required_error: "An invoice date is required." }),
});

type InvoiceFormData = z.infer<typeof invoiceSchema>;

const statusVariant: { [key in Invoice['status']]: 'default' | 'secondary' | 'destructive' } = {
    paid: 'default',
    pending: 'secondary',
    overdue: 'destructive'
};

export default function InvoicesPage() {
    const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
    const [customers] = useState<Customer[]>(initialCustomers);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [invoiceToEdit, setInvoiceToEdit] = useState<Invoice | null>(null);
    const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);
    const { toast } = useToast();

    const form = useForm<InvoiceFormData>({
        resolver: zodResolver(invoiceSchema),
    });

    useEffect(() => {
        if (isFormOpen) {
            if (invoiceToEdit) {
                form.reset({
                    ...invoiceToEdit,
                    date: new Date(invoiceToEdit.date),
                    amount: invoiceToEdit.amount,
                    customerId: invoiceToEdit.customerId || '',
                });
            } else {
                form.reset({
                    customerId: '',
                    amount: 0,
                    status: 'pending',
                    date: new Date(),
                });
            }
        }
    }, [invoiceToEdit, isFormOpen, form]);

    const handleOpenForm = (invoice: Invoice | null = null) => {
        setInvoiceToEdit(invoice);
        setIsFormOpen(true);
    };

    const onSubmit = (data: InvoiceFormData) => {
        const customer = data.customerId ? customers.find(c => c.id === data.customerId) : undefined;

        if (invoiceToEdit) {
            setInvoices(invoices.map(inv => inv.id === invoiceToEdit.id ? {
                ...inv,
                ...data,
                date: format(data.date, 'yyyy-MM-dd'),
                customerName: customer?.name,
                customerId: customer?.id,
            } : inv));
            toast({ title: "Invoice Updated", description: `Invoice ${invoiceToEdit.id} has been updated.` });
        } else {
            const newInvoice: Invoice = {
                id: `INV-${String(invoices.length + 1).padStart(3, '0')}`,
                ...data,
                date: format(data.date, 'yyyy-MM-dd'),
                customerName: customer?.name,
                customerId: customer?.id,
            };
            setInvoices([newInvoice, ...invoices]);
            toast({ title: "Invoice Created", description: `Invoice ${newInvoice.id} has been successfully created.` });
        }
        setIsFormOpen(false);
        setInvoiceToEdit(null);
    };
    
    const handleDelete = () => {
        if (!invoiceToDelete) return;
        setInvoices(invoices.filter(inv => inv.id !== invoiceToDelete.id));
        toast({ title: "Invoice Deleted", description: `Invoice ${invoiceToDelete.id} has been deleted.` });
        setInvoiceToDelete(null);
    }

    const paidInvoices = invoices.filter(i => i.status === 'paid');
    const pendingInvoices = invoices.filter(i => i.status === 'pending');
    const overdueInvoices = invoices.filter(i => i.status === 'overdue');

    const InvoiceTable = ({ invoices, onEdit, onDelete }: { invoices: Invoice[], onEdit: (invoice: Invoice) => void, onDelete: (invoice: Invoice) => void }) => (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Invoice ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead><span className="sr-only">Actions</span></TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {invoices.map(invoice => (
                    <TableRow key={invoice.id}>
                        <TableCell className="font-medium">{invoice.id}</TableCell>
                        <TableCell>{invoice.customerName || 'N/A'}</TableCell>
                        <TableCell>${invoice.amount.toFixed(2)}</TableCell>
                        <TableCell><Badge variant={statusVariant[invoice.status]} className="capitalize">{invoice.status}</Badge></TableCell>
                        <TableCell>{new Date(invoice.date).toLocaleDateString()}</TableCell>
                        <TableCell>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button aria-haspopup="true" size="icon" variant="ghost">
                                        <MoreHorizontal className="h-4 w-4" />
                                        <span className="sr-only">Toggle menu</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuItem onClick={() => onEdit(invoice)}>Edit</DropdownMenuItem>
                                    <DropdownMenuItem className="text-destructive" onClick={() => onDelete(invoice)}>Delete</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );

    return (
        <div className="flex flex-col h-full">
            <Header title="Invoices" />
            <main className="flex-1 overflow-auto p-6">
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle>Invoices</CardTitle>
                                <CardDescription>Manage and track all your customer invoices.</CardDescription>
                            </div>
                            <Button size="sm" className="gap-1" onClick={() => handleOpenForm()}>
                                <PlusCircle className="h-4 w-4" />
                                Create Invoice
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="all">
                            <TabsList>
                                <TabsTrigger value="all">All</TabsTrigger>
                                <TabsTrigger value="paid">Paid</TabsTrigger>
                                <TabsTrigger value="pending">Pending</TabsTrigger>
                                <TabsTrigger value="overdue">Overdue</TabsTrigger>
                            </TabsList>
                            <TabsContent value="all"><InvoiceTable invoices={invoices} onEdit={handleOpenForm} onDelete={setInvoiceToDelete} /></TabsContent>
                            <TabsContent value="paid"><InvoiceTable invoices={paidInvoices} onEdit={handleOpenForm} onDelete={setInvoiceToDelete} /></TabsContent>
                            <TabsContent value="pending"><InvoiceTable invoices={pendingInvoices} onEdit={handleOpenForm} onDelete={setInvoiceToDelete} /></TabsContent>
                            <TabsContent value="overdue"><InvoiceTable invoices={overdueInvoices} onEdit={handleOpenForm} onDelete={setInvoiceToDelete} /></TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </main>

            {/* Create/Edit Dialog */}
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{invoiceToEdit ? 'Edit Invoice' : 'Create Invoice'}</DialogTitle>
                        <DialogDescription>
                            {invoiceToEdit ? 'Update the details of your invoice.' : 'Fill out the form to create a new invoice.'}
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                            <FormField
                                control={form.control}
                                name="customerId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Customer (Optional)</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Select a customer" /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                <SelectItem value="">None</SelectItem>
                                                {customers.map(customer => (
                                                    <SelectItem key={customer.id} value={customer.id}>{customer.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="amount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Amount</FormLabel>
                                        <FormControl><Input type="number" placeholder="0.00" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Invoice Date</FormLabel>
                                        <FormControl>
                                           <DatePicker date={field.value} setDate={field.onChange} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Status</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Select a status" /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                <SelectItem value="paid">Paid</SelectItem>
                                                <SelectItem value="pending">Pending</SelectItem>
                                                <SelectItem value="overdue">Overdue</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <DialogFooter>
                                <Button type="submit">{invoiceToEdit ? 'Save Changes' : 'Create Invoice'}</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!invoiceToDelete} onOpenChange={(open) => !open && setInvoiceToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete invoice {invoiceToDelete?.id}.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
