'use client'

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { MoreHorizontal, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Header from "@/components/Header";
import { useToast } from "@/hooks/use-toast";
import { useAppContext } from '@/context/AppContext';
import type { Vendor } from '@/types';

const vendorSchema = z.object({
  name: z.string().min(1, "Vendor name is required."),
  contactPerson: z.string().min(1, "Contact person is required."),
  email: z.string().email("Invalid email address."),
  phone: z.string().min(1, "Phone number is required."),
});

type VendorFormData = z.infer<typeof vendorSchema>;

export default function VendorsPage() {
    const { vendors, setVendors, addActivityLog, user } = useAppContext();
    const { toast } = useToast();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [vendorToEdit, setVendorToEdit] = useState<Vendor | null>(null);
    const [vendorToDelete, setVendorToDelete] = useState<Vendor | null>(null);

    const form = useForm<VendorFormData>({
        resolver: zodResolver(vendorSchema),
    });

    const canManage = user?.role === 'admin' || user?.role === 'manager';

    const handleOpenForm = (vendor: Vendor | null = null) => {
        setVendorToEdit(vendor);
        if (vendor) {
            form.reset(vendor);
        } else {
            form.reset({ name: '', contactPerson: '', email: '', phone: '' });
        }
        setIsFormOpen(true);
    };

    const onSubmit = (data: VendorFormData) => {
        if (vendorToEdit) {
            const updatedVendors = vendors.map(v => v.id === vendorToEdit.id ? { ...v, ...data } : v);
            setVendors(updatedVendors);
            toast({ title: "Vendor Updated", description: `${data.name} has been updated.` });
            addActivityLog('Vendor Updated', `Updated vendor: ${data.name} (ID: ${vendorToEdit.id})`);
        } else {
            const newVendor: Vendor = {
                id: `vend-${Date.now()}`,
                ...data,
            };
            setVendors([newVendor, ...vendors]);
            toast({ title: "Vendor Added", description: `${data.name} has been added.` });
            addActivityLog('Vendor Added', `Added new vendor: ${data.name}`);
        }
        setIsFormOpen(false);
        setVendorToEdit(null);
    };
    
    const handleDelete = () => {
        if (!vendorToDelete) return;
        addActivityLog('Vendor Deleted', `Deleted vendor: ${vendorToDelete.name} (ID: ${vendorToDelete.id})`);
        setVendors(vendors.filter(v => v.id !== vendorToDelete.id));
        toast({ title: "Vendor Deleted", description: `${vendorToDelete.name} has been deleted.` });
        setVendorToDelete(null);
    };

    return (
        <div className="flex flex-col h-full">
            <Header title="Vendors" />
            <main className="flex-1 overflow-auto p-4 md:p-6">
                <Card>
                    <CardHeader>
                        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                            <div>
                                <CardTitle>Vendor Management</CardTitle>
                                <CardDescription>Manage your product suppliers and vendors.</CardDescription>
                            </div>
                            {canManage && (
                                <Button size="sm" className="gap-1 w-full md:w-auto" onClick={() => handleOpenForm()}>
                                    <PlusCircle className="h-4 w-4" />
                                    Add Vendor
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Vendor</TableHead>
                                    <TableHead>Contact Person</TableHead>
                                    <TableHead className="hidden md:table-cell">Email</TableHead>
                                    <TableHead className="hidden md:table-cell">Phone</TableHead>
                                    <TableHead><span className="sr-only">Actions</span></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {vendors.map(vendor => (
                                    <TableRow key={vendor.id}>
                                        <TableCell className="font-medium truncate">{vendor.name}</TableCell>
                                        <TableCell>
                                            <div className="truncate">{vendor.contactPerson}</div>
                                            <div className="text-sm text-muted-foreground md:hidden truncate">{vendor.email}</div>
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell">{vendor.email}</TableCell>
                                        <TableCell className="hidden md:table-cell">{vendor.phone}</TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button aria-haspopup="true" size="icon" variant="ghost" disabled={!canManage}>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                        <span className="sr-only">Toggle menu</span>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => handleOpenForm(vendor)}>Edit</DropdownMenuItem>
                                                    <DropdownMenuItem className="text-destructive" onClick={() => setVendorToDelete(vendor)}>Delete</DropdownMenuItem>
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
                        <DialogTitle>{vendorToEdit ? 'Edit Vendor' : 'Add New Vendor'}</DialogTitle>
                        <DialogDescription>
                            {vendorToEdit ? 'Update the details of your vendor.' : 'Fill out the form to add a new vendor.'}
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                            <FormField control={form.control} name="name" render={({ field }) => (
                                <FormItem><FormLabel>Vendor Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                             <FormField control={form.control} name="contactPerson" render={({ field }) => (
                                <FormItem><FormLabel>Contact Person</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="email" render={({ field }) => (
                                <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="phone" render={({ field }) => (
                                <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input type="tel" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <DialogFooter>
                                <Button type="submit">{vendorToEdit ? 'Save Changes' : 'Add Vendor'}</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!vendorToDelete} onOpenChange={(open) => !open && setVendorToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>This action cannot be undone. This will permanently delete the vendor.</AlertDialogDescription>
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
