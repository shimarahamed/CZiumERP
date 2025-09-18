
'use client'

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Header from "@/components/Header";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Customer, Invoice, CustomerTier } from '@/types';
import { useAppContext } from '@/context/AppContext';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { MoreHorizontal, PlusCircle, ArrowUpDown } from '@/components/icons';
import { Textarea } from '@/components/ui/textarea';

const customerSchema = z.object({
    name: z.string().min(1, "Name is required."),
    email: z.string().email("Invalid email address."),
    phone: z.string().min(1, "Phone number is required."),
    billingAddress: z.string().optional(),
    shippingAddress: z.string().optional(),
});

type CustomerFormData = z.infer<typeof customerSchema>;

type SortKey = 'name' | 'tier' | 'loyaltyPoints';

const statusVariant: { [key in Invoice['status']]: 'default' | 'secondary' | 'destructive' } = {
    paid: 'default',
    pending: 'secondary',
    overdue: 'destructive'
};

const tierVariant: { [key in CustomerTier]: 'secondary' | 'default' | 'outline' } = {
    Bronze: 'secondary',
    Silver: 'default',
    Gold: 'outline'
};


export default function CustomersPage() {
    const { customers, setCustomers, invoices, addActivityLog, currencySymbol, user, themeSettings } = useAppContext();
    const { toast } = useToast();
    
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [customerToEdit, setCustomerToEdit] = useState<Customer | null>(null);
    const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
    
    const [searchTerm, setSearchTerm] = useState('');
    const [sortKey, setSortKey] = useState<SortKey>('name');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [historyCustomer, setHistoryCustomer] = useState<Customer | null>(null);

    const form = useForm<CustomerFormData>({
        resolver: zodResolver(customerSchema),
    });

    const canManage = user?.role === 'admin' || user?.role === 'manager';

    const handleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortDirection('asc');
        }
    };

    const handleOpenForm = (customer: Customer | null = null) => {
        setCustomerToEdit(customer);
        if (customer) {
            form.reset(customer);
        } else {
            form.reset({ name: '', email: '', phone: '', billingAddress: '', shippingAddress: '' });
        }
        setIsFormOpen(true);
    };

    const onSubmit = (data: CustomerFormData) => {
        if (customerToEdit) {
            const updatedCustomers = customers.map(c => 
                c.id === customerToEdit.id ? { ...c, ...data } : c
            );
            setCustomers(updatedCustomers);
            toast({ title: "Customer Updated", description: `${data.name}'s details have been updated.` });
            addActivityLog('Customer Updated', `Updated customer: ${data.name} (ID: ${customerToEdit.id})`);
        } else {
            const newCustomer: Customer = {
                id: `cust-${Date.now()}`,
                avatar: `https://placehold.co/40x40`,
                ...data,
                loyaltyPoints: 0,
                tier: 'Bronze',
            };
            setCustomers([newCustomer, ...customers]);
            toast({ title: "Customer Added", description: `${data.name} has been added.` });
            addActivityLog('Customer Added', `Added new customer: ${data.name}`);
        }
        setIsFormOpen(false);
        setCustomerToEdit(null);
    };

    const handleDelete = () => {
        if (!customerToDelete) return;
        addActivityLog('Customer Deleted', `Deleted customer: ${customerToDelete.name} (ID: ${customerToDelete.id})`);
        setCustomers(customers.filter(c => c.id !== customerToDelete.id));
        toast({ title: "Customer Deleted", description: `${customerToDelete.name} has been deleted.` });
        setCustomerToDelete(null);
    };

    const filteredCustomers = useMemo(() => {
        let filtered = customers.filter(customer =>
            customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.email.toLowerCase().includes(searchTerm.toLowerCase())
        );

        filtered.sort((a, b) => {
            let aValue: string | number = a[sortKey] || 0;
            let bValue: string | number = b[sortKey] || 0;

            if (sortKey === 'tier') {
                const tierOrder = { 'Gold': 3, 'Silver': 2, 'Bronze': 1 };
                aValue = tierOrder[a.tier || 'Bronze'];
                bValue = tierOrder[b.tier || 'Bronze'];
            }

            if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });

        return filtered;
    }, [customers, searchTerm, sortKey, sortDirection]);

    const customerInvoices = historyCustomer ? invoices.filter(invoice => invoice.customerId === historyCustomer.id) : [];

    return (
        <div className="flex flex-col h-full">
            <Header title="Customers" />
            <main className="flex-1 overflow-auto p-4 md:p-6">
                <Card>
                    <CardHeader>
                        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                            <div>
                                <CardTitle>Customers</CardTitle>
                                <CardDescription>Manage your customers and view their sales history.</CardDescription>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                                <Input
                                    placeholder="Search customers..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full md:w-auto md:min-w-[250px] bg-secondary"
                                />
                                {canManage && (
                                    <Button size="sm" className="gap-1 w-full sm:w-auto" onClick={() => handleOpenForm()}>
                                        <PlusCircle className="h-4 w-4" />
                                        Add Customer
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead><Button variant="ghost" onClick={() => handleSort('name')}>Customer <ArrowUpDown className="ml-2 h-4 w-4" /></Button></TableHead>
                                    <TableHead><Button variant="ghost" onClick={() => handleSort('tier')}>Tier <ArrowUpDown className="ml-2 h-4 w-4" /></Button></TableHead>
                                    <TableHead className="hidden sm:table-cell"><Button variant="ghost" onClick={() => handleSort('loyaltyPoints')}>Loyalty Points <ArrowUpDown className="ml-2 h-4 w-4" /></Button></TableHead>
                                    <TableHead className="hidden md:table-cell">Email</TableHead>
                                    <TableHead>
                                        <span className="sr-only">Actions</span>
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredCustomers.map(customer => (
                                    <TableRow key={customer.id}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-3">
                                                <Avatar>
                                                    <AvatarImage src={customer.avatar} alt={customer.name} data-ai-hint="person user" />
                                                    <AvatarFallback>{customer.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col min-w-0">
                                                   <span className="truncate">{customer.name}</span>
                                                   <div className="text-muted-foreground sm:hidden flex flex-col">
                                                        <span className="truncate">{customer.email}</span>
                                                        <span>{customer.loyaltyPoints || 0} points</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge 
                                                variant={tierVariant[customer.tier || 'Bronze']} 
                                                className={customer.tier === 'Gold' ? 'border-amber-500 text-amber-600' : ''}
                                            >
                                                {customer.tier || 'Bronze'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="hidden sm:table-cell">{customer.loyaltyPoints || 0}</TableCell>
                                        <TableCell className="hidden md:table-cell">{customer.email}</TableCell>
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
                                                    <DropdownMenuItem onClick={() => setHistoryCustomer(customer)}>View Purchase History</DropdownMenuItem>
                                                    {canManage && <DropdownMenuItem onClick={() => handleOpenForm(customer)}>Edit</DropdownMenuItem>}
                                                    {canManage && <DropdownMenuItem className="text-destructive" onClick={() => setCustomerToDelete(customer)}>Delete</DropdownMenuItem>}
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
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{customerToEdit ? 'Edit Customer' : 'Add New Customer'}</DialogTitle>
                        <DialogDescription>
                            {customerToEdit ? 'Update customer details.' : 'Fill in the details to add a new customer.'}
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto px-2">
                            <FormField control={form.control} name="name" render={({ field }) => (
                                <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="email" render={({ field }) => (
                                <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="phone" render={({ field }) => (
                                <FormItem><FormLabel>Phone</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="billingAddress" render={({ field }) => (
                                <FormItem><FormLabel>Billing Address</FormLabel><FormControl><Textarea placeholder="Enter billing address" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                             <FormField control={form.control} name="shippingAddress" render={({ field }) => (
                                <FormItem><FormLabel>Shipping Address</FormLabel><FormControl><Textarea placeholder="Enter shipping address" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <DialogFooter className="pt-4">
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button type="button">{customerToEdit ? 'Save Changes' : 'Add Customer'}</Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={form.handleSubmit(onSubmit)}>Confirm</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!customerToDelete} onOpenChange={(open) => !open && setCustomerToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>This action cannot be undone. This will permanently delete the customer.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            
            <Dialog open={!!historyCustomer} onOpenChange={(open) => !open && setHistoryCustomer(null)}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Purchase History for {historyCustomer?.name}</DialogTitle>
                        <DialogDescription>A list of all invoices for this customer.</DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        {customerInvoices.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Invoice ID</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {customerInvoices.map(invoice => (
                                        <TableRow key={invoice.id}>
                                            <TableCell className="font-medium">{invoice.id}</TableCell>
                                            <TableCell>{new Date(invoice.date).toLocaleDateString()}</TableCell>
                                            <TableCell>{currencySymbol} {invoice.amount.toFixed(2)}</TableCell>
                                            <TableCell>
                                                <Badge variant={statusVariant[invoice.status]} className="capitalize">
                                                    {invoice.status}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <p className="text-center text-muted-foreground">No invoices found for this customer.</p>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

        </div>
    );
}

