
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from '@/components/ui/date-picker';
import Header from "@/components/Header";
import { useToast } from "@/hooks/use-toast";
import { useAppContext } from '@/context/AppContext';
import type { Asset, AssetStatus } from '@/types';
import { Badge } from '@/components/ui/badge';
import { format, parseISO } from 'date-fns';
import { MoreHorizontal, PlusCircle } from '@/components/icons';

const assetSchema = z.object({
  name: z.string().min(1, "Asset name is required."),
  category: z.string().min(1, "Category is required."),
  serialNumber: z.string().optional(),
  purchaseDate: z.date({ required_error: "Purchase date is required." }),
  purchaseCost: z.coerce.number().min(0, "Cost must be a non-negative number."),
  status: z.enum(['in-use', 'in-storage', 'under-maintenance', 'retired']),
  location: z.string().min(1, "Location is required."),
  assignedTo: z.string().optional(),
});

type AssetFormData = z.infer<typeof assetSchema>;

const statusVariant: { [key in AssetStatus]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
    'in-use': 'default',
    'in-storage': 'secondary',
    'under-maintenance': 'outline',
    'retired': 'destructive'
};


export default function AssetsPage() {
    const { assets, setAssets, users, stores, addActivityLog, currencySymbol, user: currentUser } = useAppContext();
    const { toast } = useToast();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [assetToEdit, setAssetToEdit] = useState<Asset | null>(null);
    const [assetToDelete, setAssetToDelete] = useState<Asset | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const form = useForm<AssetFormData>({
        resolver: zodResolver(assetSchema),
    });

    const canManage = currentUser?.role === 'admin' || currentUser?.role === 'manager';
    
    const filteredAssets = useMemo(() => {
        if (!searchTerm) return assets;
        const lowercasedFilter = searchTerm.toLowerCase();
        return assets.filter(asset =>
            asset.name.toLowerCase().includes(lowercasedFilter) ||
            asset.category.toLowerCase().includes(lowercasedFilter) ||
            (asset.serialNumber && asset.serialNumber.toLowerCase().includes(lowercasedFilter)) ||
            asset.location.toLowerCase().includes(lowercasedFilter)
        );
    }, [assets, searchTerm]);

    if (!canManage) {
        return (
            <div className="flex flex-col h-full">
                <Header title="Access Denied" />
                <main className="flex-1 overflow-auto p-4 md:p-6">
                    <Card>
                        <CardHeader><CardTitle>Permission Required</CardTitle></CardHeader>
                        <CardContent><p>You do not have permission to view or manage assets. Please contact an administrator.</p></CardContent>
                    </Card>
                </main>
            </div>
        );
    }

    const handleOpenForm = (asset: Asset | null = null) => {
        setAssetToEdit(asset);
        if (asset) {
            form.reset({
                ...asset,
                purchaseDate: parseISO(asset.purchaseDate),
                assignedTo: asset.assignedTo ?? 'none',
            });
        } else {
            form.reset({
                name: '',
                category: '',
                serialNumber: '',
                purchaseDate: new Date(),
                purchaseCost: 0,
                status: 'in-storage',
                location: '',
                assignedTo: 'none',
            });
        }
        setIsFormOpen(true);
    };

    const onSubmit = (data: AssetFormData) => {
        const assetData = {
          ...data,
          purchaseDate: format(data.purchaseDate, 'yyyy-MM-dd'),
          assignedTo: data.assignedTo === 'none' ? undefined : data.assignedTo,
        };

        if (assetToEdit) {
            const updatedAssets = assets.map(a => a.id === assetToEdit.id ? { ...a, ...assetData } : a);
            setAssets(updatedAssets);
            toast({ title: "Asset Updated", description: `${data.name} has been updated.` });
            addActivityLog('Asset Updated', `Updated asset: ${data.name} (ID: ${assetToEdit.id})`);
        } else {
            const newAsset: Asset = {
                id: `asset-${Date.now()}`,
                ...assetData,
            };
            setAssets([newAsset, ...assets]);
            toast({ title: "Asset Added", description: `${data.name} has been added.` });
            addActivityLog('Asset Added', `Added new asset: ${data.name}`);
        }
        setIsFormOpen(false);
        setAssetToEdit(null);
    };
    
    const handleDelete = () => {
        if (!assetToDelete) return;
        addActivityLog('Asset Deleted', `Deleted asset: ${assetToDelete.name} (ID: ${assetToDelete.id})`);
        setAssets(assets.filter(a => a.id !== assetToDelete.id));
        toast({ title: "Asset Deleted", description: `${assetToDelete.name} has been deleted.` });
        setAssetToDelete(null);
    };

    return (
        <div className="flex flex-col h-full">
            <Header title="Asset Management" />
            <main className="flex-1 overflow-auto p-4 md:p-6">
                <Card>
                    <CardHeader>
                        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                            <div>
                                <CardTitle>Company Assets</CardTitle>
                                <CardDescription>Track and manage all company assets.</CardDescription>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                                <Input
                                    placeholder="Search assets..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full md:w-auto md:min-w-[250px] bg-secondary"
                                />
                                <Button size="sm" className="gap-1 w-full sm:w-auto" onClick={() => handleOpenForm()}>
                                    <PlusCircle className="h-4 w-4" />
                                    Add Asset
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Asset Name</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="hidden md:table-cell">Location</TableHead>
                                    <TableHead className="hidden md:table-cell">Assigned To</TableHead>
                                    <TableHead><span className="sr-only">Actions</span></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredAssets.map(asset => {
                                    const assignedUser = users.find(u => u.id === asset.assignedTo);
                                    const locationName = stores.find(s => s.id === asset.location)?.name || asset.location;
                                    return (
                                        <TableRow key={asset.id}>
                                            <TableCell className="font-medium">
                                                {asset.name}
                                                <div className="text-sm text-muted-foreground md:hidden">
                                                    {asset.category}
                                                </div>
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell">{asset.category}</TableCell>
                                            <TableCell><Badge variant={statusVariant[asset.status]} className="capitalize">{asset.status.replace('-', ' ')}</Badge></TableCell>
                                            <TableCell className="hidden md:table-cell">{locationName}</TableCell>
                                            <TableCell className="hidden md:table-cell">{assignedUser?.name || 'Unassigned'}</TableCell>
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
                                                        <DropdownMenuItem onClick={() => handleOpenForm(asset)}>Edit</DropdownMenuItem>
                                                        <DropdownMenuItem className="text-destructive" onClick={() => setAssetToDelete(asset)}>Delete</DropdownMenuItem>
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
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>{assetToEdit ? 'Edit Asset' : 'Add New Asset'}</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto px-2">
                            <FormField control={form.control} name="name" render={({ field }) => (
                                <FormItem><FormLabel>Asset Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField control={form.control} name="category" render={({ field }) => (
                                    <FormItem><FormLabel>Category</FormLabel><FormControl><Input placeholder="e.g., IT Equipment" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="serialNumber" render={({ field }) => (
                                    <FormItem><FormLabel>Serial Number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField control={form.control} name="purchaseDate" render={({ field }) => (
                                    <FormItem className="flex flex-col pt-2"><FormLabel>Purchase Date</FormLabel><FormControl><DatePicker date={field.value} setDate={field.onChange} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name="purchaseCost" render={({ field }) => (
                                    <FormItem><FormLabel>Purchase Cost ({currencySymbol})</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                            </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField control={form.control} name="status" render={({ field }) => (
                                    <FormItem><FormLabel>Status</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                <SelectItem value="in-use">In Use</SelectItem>
                                                <SelectItem value="in-storage">In Storage</SelectItem>
                                                <SelectItem value="under-maintenance">Under Maintenance</SelectItem>
                                                <SelectItem value="retired">Retired</SelectItem>
                                            </SelectContent>
                                        </Select><FormMessage />
                                    </FormItem>
                                )}/>
                                 <FormField control={form.control} name="location" render={({ field }) => (
                                    <FormItem><FormLabel>Location</FormLabel><FormControl><Input placeholder="e.g., Head Office or Store ID" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                            </div>
                            <FormField control={form.control} name="assignedTo" render={({ field }) => (
                                <FormItem><FormLabel>Assigned To</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a user" /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            <SelectItem value="none">Unassigned</SelectItem>
                                            {users.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select><FormMessage />
                                </FormItem>
                            )} />
                            
                            <DialogFooter className="pt-4">
                                <Button type="submit">{assetToEdit ? 'Save Changes' : 'Add Asset'}</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!assetToDelete} onOpenChange={(open) => !open && setAssetToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>This action cannot be undone. This will permanently delete the asset record.</AlertDialogDescription>
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
