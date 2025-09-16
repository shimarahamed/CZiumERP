
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
import { useToast } from "@/hooks/use-toast";
import { useAppContext } from '@/context/AppContext';
import type { Product } from '@/types';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { DatePicker } from '@/components/ui/date-picker';
import { isBefore } from 'date-fns/isBefore';
import { differenceInDays } from 'date-fns/differenceInDays';
import { parseISO } from 'date-fns/parseISO';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ProductDetail from '@/components/ProductDetail';
import { MoreHorizontal, PlusCircle } from '@/components/icons';
import { cn } from '@/lib/utils';

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
  warrantyDate: z.date().optional().nullable(),
  productType: z.enum(['standard', 'manufactured', 'component']).default('standard'),
});

type ProductFormData = z.infer<typeof productSchema>;

const productTypeVariant: { [key in Product['productType'] & string]: 'default' | 'secondary' | 'outline' } = {
    standard: 'secondary',
    manufactured: 'default',
    component: 'outline'
};


export default function InventoryPage() {
    const { products, setProducts, addActivityLog, currencySymbol, user } = useAppContext();
    const { toast } = useToast();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [productToEdit, setProductToEdit] = useState<Product | null>(null);
    const [productToView, setProductToView] = useState<Product | null>(null);
    const [productToDelete, setProductToDelete] = useState<Product | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

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
            warrantyDate: null,
            productType: 'standard',
        }
    });
    
    const canManage = user?.role === 'admin' || user?.role === 'manager';

    const filteredProducts = useMemo(() => {
        if (!searchTerm) return products;
        const lowercasedFilter = searchTerm.toLowerCase();
        return products.filter(product =>
            product.name.toLowerCase().includes(lowercasedFilter) ||
            (product.sku && product.sku.toLowerCase().includes(lowercasedFilter)) ||
            (product.category && product.category.toLowerCase().includes(lowercasedFilter)) ||
            (product.productType && product.productType.toLowerCase().includes(lowercasedFilter))
        );
    }, [products, searchTerm]);

    const handleOpenForm = (product: Product | null = null) => {
        setProductToEdit(product);
        if (product) {
            form.reset({
              ...product,
              vendorId: product.vendorId ?? 'none',
              reorderThreshold: product.reorderThreshold ?? 0,
              expiryDate: product.expiryDate ? new Date(product.expiryDate) : null,
              warrantyDate: product.warrantyDate ? new Date(product.warrantyDate) : null,
              productType: product.productType ?? 'standard',
            });
        } else {
            form.reset({ name: '', price: 0, cost: 0, stock: 0, sku: '', category: '', description: '', vendorId: 'none', reorderThreshold: 0, expiryDate: null, warrantyDate: null, productType: 'standard' });
        }
        setIsFormOpen(true);
    };

    const onSubmit = (data: ProductFormData) => {
        const productData = {
          ...data,
          vendorId: data.vendorId === 'none' ? undefined : data.vendorId,
          expiryDate: data.expiryDate ? data.expiryDate.toISOString() : undefined,
          warrantyDate: data.warrantyDate ? data.warrantyDate.toISOString() : undefined,
          reorderThreshold: data.reorderThreshold,
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

        if (product.stock <= 0) {
            statuses.push({ text: 'Out of Stock', variant: 'destructive' });
        } else if (product.reorderThreshold && product.stock <= product.reorderThreshold) {
            statuses.push({ text: 'Low Stock', variant: 'secondary' });
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
                            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                                <Input
                                    placeholder="Search products..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full md:w-[300px] bg-secondary"
                                />
                                {canManage && (
                                    <Button size="sm" className="gap-1 w-full sm:w-auto" onClick={() => handleOpenForm()}>
                                        <PlusCircle className="h-4 w-4" />
                                        Add Product
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Product Name</TableHead>
                                    <TableHead className="hidden md:table-cell">Type</TableHead>
                                    <TableHead>Stock</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="hidden md:table-cell">Price</TableHead>
                                    <TableHead><span className="sr-only">Actions</span></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredProducts.map(product => {
                                    const statuses = getProductStatus(product);
                                    return (
                                        <TableRow key={product.id}>
                                            <TableCell className="font-medium">
                                                <div 
                                                    className="cursor-pointer hover:underline"
                                                    onClick={() => setProductToView(product)}
                                                >
                                                    {product.name}
                                                </div>
                                                <div className="text-sm text-muted-foreground md:hidden">
                                                    {currencySymbol} {product.price.toFixed(2)}
                                                </div>
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell">
                                                <Badge variant={productTypeVariant[product.productType || 'standard']} className="capitalize">
                                                    {product.productType || 'Standard'}
                                                </Badge>
                                            </TableCell>
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
                                            <TableCell className="hidden md:table-cell">{currencySymbol} {product.price.toFixed(2)}</TableCell>
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
                                                        <DropdownMenuItem onClick={() => setProductToView(product)}>View Details</DropdownMenuItem>
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField control={form.control} name="name" render={({ field }) => (
                                    <FormItem><FormLabel>Product Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="productType" render={({ field }) => (
                                    <FormItem><FormLabel>Product Type</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                                            <SelectContent>
                                                <SelectItem value="standard">Standard</SelectItem>
                                                <SelectItem value="manufactured">Manufactured</SelectItem>
                                                <SelectItem value="component">Component (Raw Material)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>
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
                                            {useAppContext().vendors.map(v => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}
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
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                 <FormField control={form.control} name="reorderThreshold" render={({ field }) => (
                                    <FormItem><FormLabel>Reorder Threshold</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10))} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="expiryDate" render={({ field }) => (
                                    <FormItem className="flex flex-col pt-2"><FormLabel>Expiry Date</FormLabel><FormControl><DatePicker date={field.value ?? undefined} setDate={field.onChange} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name="warrantyDate" render={({ field }) => (
                                    <FormItem className="flex flex-col pt-2"><FormLabel>Warranty Date</FormLabel><FormControl><DatePicker date={field.value ?? undefined} setDate={field.onChange} /></FormControl><FormMessage /></FormItem>
                                )}/>
                            </div>
                            
                            <DialogFooter className="pt-4">
                                <Button type="submit">{productToEdit ? 'Save Changes' : 'Add Product'}</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            <Dialog open={!!productToView} onOpenChange={(open) => !open && setProductToView(null)}>
                {productToView && <ProductDetail product={productToView} />}
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
