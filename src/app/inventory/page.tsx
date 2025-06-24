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
import type { Product } from '@/types';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { DatePicker } from '@/components/ui/date-picker';
import { isBefore, differenceInDays, parseISO } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const productSchema = z.object({
  name: z.string().min(1, "Product name is required."),
  price: z.coerce.number().positive("Price must be a positive number."),
  cost: z.coerce.number().min(0, "Cost must be a non-negative number."),
  stock: z.coerce.number().int().min(0, "Stock cannot be negative."),
  sku: z.string().optional(),
  category: z.string().optional(),
  description: z.string().optional(),
  vendorId: z.string().optional(),
  reorderThreshold: z.coerce.number().int().min(0, "Reorder threshold must be non-negative.").optional(),
  expiryDate: z.date().optional().nullable(),
});

type ProductFormData = z.infer<typeof productSchema>;

export default function InventoryPage() {
    const { products, setProducts, addActivityLog, currencySymbol, user, vendors, purchaseOrders } = useAppContext();
    const { toast } = useToast();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [productToEdit, setProductToEdit] = useState<Product | null>(null);
    const [productToDelete, setProductToDelete] = useState<Product | null>(null);

    const form = useForm<ProductFormData>({
        resolver: zodResolver(productSchema),
        defaultValues: {
            name: '',
            price: 0,
            cost: 0,
            stock: 0,
            sku: '',
            category: '',
            description: '',
            vendorId: 'none',
            reorderThreshold: 0,
            expiryDate: null,
        }
    });
    
    const canManage = user?.role === 'admin' || user?.role === 'manager';

    const handleOpenForm = (product: Product | null = null) => {
        setProductToEdit(product);
        if (product) {
            form.reset({
              ...product,
              vendorId: product.vendorId ?? 'none',
              reorderThreshold: product.reorderThreshold ?? 0,
              expiryDate: product.expiryDate ? new Date(product.expiryDate) : null,
            });
        } else {
            form.reset({ name: '', price: 0, cost: 0, stock: 0, sku: '', category: '', description: '', vendorId: 'none', reorderThreshold: 0, expiryDate: null });
        }
        setIsFormOpen(true);
    };

    const onSubmit = (data: ProductFormData) => {
        const productData = {
          ...data,
          vendorId: data.vendorId === 'none' ? undefined : data.vendorId,
          expiryDate: data.expiryDate ? data.expiryDate.toISOString() : undefined,
          reorderThreshold: data.reorderThreshold || undefined,
        };

        if (productToEdit) {
            const updatedProducts = products.map(p => p.id === productToEdit.id ? { ...p, ...productData } : p);
            setProducts(updatedProducts);
            toast({ title: "Product Updated", description: `${data.name} has been updated.` });
            addActivityLog('Product Updated', `Updated product: ${data.name} (ID: ${productToEdit.id})`);
        } else {
            const newProduct: Product = {
                id: `prod-${Date.now()}`,
                ...productData,
            };
            setProducts([newProduct, ...products]);
            toast({ title: "Product Added", description: `${data.name} has been added to inventory.` });
            addActivityLog('Product Added', `Added new product: ${data.name}`);
        }
        setIsFormOpen(false);
        setProductToEdit(null);
    };
    
    const handleDelete = () => {
        if (!productToDelete) return;
        addActivityLog('Product Deleted', `Deleted product: ${productToDelete.name} (ID: ${productToDelete.id})`);
        setProducts(products.filter(p => p.id !== productToDelete.id));
        toast({ title: "Product Deleted", description: `${productToDelete.name} has been deleted.` });
        setProductToDelete(null);
    };

    const getProductStatus = (product: Product) => {
        const statuses: { text: string; variant: 'destructive' | 'secondary' }[] = [];
        const now = new Date();

        if (typeof product.reorderThreshold !== 'undefined' && product.stock <= product.reorderThreshold) {
            statuses.push({ text: 'Low Stock', variant: 'destructive' });
        }

        if (product.expiryDate) {
            const expiry = parseISO(product.expiryDate);
            if (isBefore(expiry, now)) {
                statuses.push({ text: 'Expired', variant: 'destructive' });
            } else if (differenceInDays(expiry, now) <= 30) {
                statuses.push({ text: 'Expires Soon', variant: 'secondary' });
            }
        }
        
        return statuses;
    }
    
    const productPurchaseHistory = productToEdit ? purchaseOrders.filter(po => 
        po.status === 'received' && po.items.some(item => item.productId === productToEdit?.id)
    ) : [];

    return (
        <div className="flex flex-col h-full">
            <Header title="Inventory" />
            <main className="flex-1 overflow-auto p-4 md:p-6">
                <Card>
                    <CardHeader>
                        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                            <div>
                                <CardTitle>Product Inventory</CardTitle>
                                <CardDescription>Manage your products, stock levels, and costs.</CardDescription>
                            </div>
                            {canManage && (
                                <Button size="sm" className="gap-1 w-full md:w-auto" onClick={() => handleOpenForm()}>
                                    <PlusCircle className="h-4 w-4" />
                                    Add Product
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Product Name</TableHead>
                                    <TableHead className="hidden md:table-cell">Price</TableHead>
                                    <TableHead>Stock</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="hidden md:table-cell">Expiry</TableHead>
                                    <TableHead><span className="sr-only">Actions</span></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {products.map(product => {
                                    const statuses = getProductStatus(product);
                                    return (
                                        <TableRow key={product.id}>
                                            <TableCell className="font-medium">
                                                <div>{product.name}</div>
                                                <div className="text-sm text-muted-foreground md:hidden">
                                                    {currencySymbol} {product.price.toFixed(2)}
                                                </div>
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell">{currencySymbol} {product.price.toFixed(2)}</TableCell>
                                            <TableCell>{product.stock}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1">
                                                    {statuses.length > 0 ? (
                                                        statuses.map(status => (
                                                            <Badge key={status.text} variant={status.variant} className="whitespace-nowrap">{status.text}</Badge>
                                                        ))
                                                    ) : (
                                                        <span className="text-muted-foreground">-</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell">{product.expiryDate ? new Date(product.expiryDate).toLocaleDateString() : 'N/A'}</TableCell>
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
                                                        <DropdownMenuItem onClick={() => handleOpenForm(product)}>Edit</DropdownMenuItem>
                                                        <DropdownMenuItem className="text-destructive" onClick={() => setProductToDelete(product)}>Delete</DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </main>

            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{productToEdit ? 'Edit Product' : 'Add New Product'}</DialogTitle>
                        <DialogDescription>
                            {productToEdit ? 'Update the details of your product.' : 'Fill out the form to add a new product.'}
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto px-2">
                             <FormField control={form.control} name="name" render={({ field }) => (
                                <FormItem><FormLabel>Product Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="description" render={({ field }) => (
                                <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="Describe the product..." {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField control={form.control} name="sku" render={({ field }) => (
                                    <FormItem><FormLabel>SKU (Stock Keeping Unit)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="category" render={({ field }) => (
                                    <FormItem><FormLabel>Category</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                            </div>
                             <FormField control={form.control} name="vendorId" render={({ field }) => (
                                <FormItem><FormLabel>Default Vendor</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Select a vendor" /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            <SelectItem value="none">None</SelectItem>
                                            {vendors.map(v => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select><FormMessage />
                                </FormItem>
                            )} />
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <FormField control={form.control} name="price" render={({ field }) => (
                                    <FormItem><FormLabel>Price</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="cost" render={({ field }) => (
                                    <FormItem><FormLabel>Cost</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="stock" render={({ field }) => (
                                    <FormItem><FormLabel>Stock Quantity</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                 <FormField control={form.control} name="reorderThreshold" render={({ field }) => (
                                    <FormItem><FormLabel>Reorder Threshold</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="expiryDate" render={({ field }) => (
                                    <FormItem className="flex flex-col pt-2"><FormLabel>Expiry Date</FormLabel><FormControl><DatePicker date={field.value ?? undefined} setDate={field.onChange} /></FormControl><FormMessage /></FormItem>
                                )}/>
                            </div>
                            
                            {productToEdit && productPurchaseHistory.length > 0 && (
                                <div className="space-y-2 pt-4">
                                    <h3 className="text-lg font-medium">Purchase History</h3>
                                    <Card>
                                        <CardContent className="p-0 max-h-48 overflow-y-auto">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>PO ID</TableHead>
                                                        <TableHead>Vendor</TableHead>
                                                        <TableHead>Date</TableHead>
                                                        <TableHead className="text-right">Qty</TableHead>
                                                        <TableHead className="text-right">Cost</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {productPurchaseHistory.map(po => {
                                                        const item = po.items.find(i => i.productId === productToEdit.id)!;
                                                        return (
                                                            <TableRow key={po.id}>
                                                                <TableCell>{po.id}</TableCell>
                                                                <TableCell>{po.vendorName}</TableCell>
                                                                <TableCell>{po.receivedDate ? new Date(po.receivedDate).toLocaleDateString() : 'N/A'}</TableCell>
                                                                <TableCell className="text-right">{item.quantity}</TableCell>
                                                                <TableCell className="text-right">{currencySymbol} {item.cost.toFixed(2)}</TableCell>
                                                            </TableRow>
                                                        );
                                                    })}
                                                </TableBody>
                                            </Table>
                                        </CardContent>
                                    </Card>
                                </div>
                            )}
                            
                            <DialogFooter className="pt-4">
                                <Button type="submit">{productToEdit ? 'Save Changes' : 'Add Product'}</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!productToDelete} onOpenChange={(open) => !open && setProductToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>This action cannot be undone. This will permanently delete the product.</AlertDialogDescription>
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
