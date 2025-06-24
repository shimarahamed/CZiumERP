'use client'

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { MoreHorizontal, PlusCircle, Store } from "lucide-react";
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
import type { Store as StoreType } from '@/types';
import { Textarea } from '@/components/ui/textarea';

const storeSchema = z.object({
  name: z.string().min(1, "Store name is required."),
  address: z.string().min(1, "Address is required."),
});

type StoreFormData = z.infer<typeof storeSchema>;

export default function StoresPage() {
    const { stores, setStores, addActivityLog, user: currentUser, currentStore } = useAppContext();
    const { toast } = useToast();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [storeToEdit, setStoreToEdit] = useState<StoreType | null>(null);
    const [storeToDelete, setStoreToDelete] = useState<StoreType | null>(null);

    const form = useForm<StoreFormData>({
        resolver: zodResolver(storeSchema),
    });

    if (currentUser?.role !== 'admin') {
        return (
            <div className="flex flex-col h-full">
                <Header title="Access Denied" />
                <main className="flex-1 overflow-auto p-4 md:p-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Permission Required</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p>You do not have permission to view or manage stores. Please contact an administrator.</p>
                        </CardContent>
                    </Card>
                </main>
            </div>
        );
    }

    const handleOpenForm = (store: StoreType | null = null) => {
        setStoreToEdit(store);
        if (store) {
            form.reset(store);
        } else {
            form.reset({ name: '', address: '' });
        }
        setIsFormOpen(true);
    };

    const onSubmit = (data: StoreFormData) => {
        if (storeToEdit) {
            const updatedStores = stores.map(s => s.id === storeToEdit.id ? { ...s, ...data } : s);
            setStores(updatedStores);
            toast({ title: "Store Updated", description: `The details for ${data.name} have been updated.` });
            addActivityLog('Store Updated', `Updated store: ${data.name} (ID: ${storeToEdit.id})`);
        } else {
            const newStore: StoreType = {
                id: `store-${Date.now()}`,
                ...data,
            };
            setStores([newStore, ...stores]);
            toast({ title: "Store Added", description: `${data.name} has been added.` });
            addActivityLog('Store Added', `Added new store: ${data.name}`);
        }
        setIsFormOpen(false);
        setStoreToEdit(null);
    };
    
    const handleDelete = () => {
        if (!storeToDelete) return;

        if (storeToDelete.id === currentStore?.id) {
            toast({ variant: 'destructive', title: "Action Forbidden", description: "You cannot delete the currently active store session. Please switch stores first." });
            setStoreToDelete(null);
            return;
        }

        if (stores.length <= 1) {
            toast({ variant: 'destructive', title: "Action Forbidden", description: "You cannot delete the last remaining store." });
            setStoreToDelete(null);
            return;
        }

        addActivityLog('Store Deleted', `Deleted store: ${storeToDelete.name} (ID: ${storeToDelete.id})`);
        setStores(stores.filter(s => s.id !== storeToDelete.id));
        toast({ title: "Store Deleted", description: `${storeToDelete.name} has been deleted.` });
        setStoreToDelete(null);
    };

    return (
        <div className="flex flex-col h-full">
            <Header title="Store Management" />
            <main className="flex-1 overflow-auto p-4 md:p-6">
                <Card>
                    <CardHeader>
                        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                            <div>
                                <CardTitle>Stores</CardTitle>
                                <CardDescription>Manage your business locations.</CardDescription>
                            </div>
                            <Button size="sm" className="gap-1 w-full md:w-auto" onClick={() => handleOpenForm()}>
                                <PlusCircle className="h-4 w-4" />
                                Add Store
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Store Name</TableHead>
                                    <TableHead>Address</TableHead>
                                    <TableHead><span className="sr-only">Actions</span></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {stores.map(store => (
                                    <TableRow key={store.id}>
                                        <TableCell className="font-medium flex items-center gap-2">
                                            <Store className="h-4 w-4 text-muted-foreground"/>
                                            <span>{store.name}</span>
                                        </TableCell>
                                        <TableCell>{store.address}</TableCell>
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
                                                    <DropdownMenuItem onClick={() => handleOpenForm(store)}>Edit</DropdownMenuItem>
                                                    <DropdownMenuItem className="text-destructive" onClick={() => setStoreToDelete(store)}>Delete</DropdownMenuItem>
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
                        <DialogTitle>{storeToEdit ? 'Edit Store' : 'Add New Store'}</DialogTitle>
                        <DialogDescription>
                            {storeToEdit ? 'Update the details of your store.' : 'Fill out the form to add a new store.'}
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                            <FormField control={form.control} name="name" render={({ field }) => (
                                <FormItem><FormLabel>Store Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                             <FormField control={form.control} name="address" render={({ field }) => (
                                <FormItem><FormLabel>Address</FormLabel><FormControl><Textarea placeholder="123 Main St, Anytown, USA" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <DialogFooter>
                                <Button type="submit">{storeToEdit ? 'Save Changes' : 'Add Store'}</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!storeToDelete} onOpenChange={(open) => !open && setStoreToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>This action cannot be undone. This will permanently delete the store.</AlertDialogDescription>
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
