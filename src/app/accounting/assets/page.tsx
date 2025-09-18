
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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
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
import { MoreHorizontal, PlusCircle, ArrowUpDown } from '@/components/icons';

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

type SortKey = 'name' | 'category' | 'status' | 'location';

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
    const [sortKey, setSortKey] = useState<SortKey>('name');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

    const form = useForm<AssetFormData>({
        resolver: zodResolver(assetSchema),
    });

    const canManage = currentUser?.role === 'admin' || currentUser?.role === 'manager';
    
    const sortedAndFilteredAssets = useMemo(() => {
        let filtered = assets.filter(asset =>
            asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            asset.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (asset.serialNumber && asset.serialNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
            asset.location.toLowerCase().includes(searchTerm.toLowerCase())
        );

        filtered.sort((a, b) => {
            const aValue = a[sortKey];
            const bValue = b[sortKey];

            if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });

        return filtered;
    }, [assets, searchTerm, sortKey, sortDirection]);

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
    
    const handleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortDirection('asc');
        }
    };

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

    const processSubmit = (data: AssetFormData) => {
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
                                    <TableHead>
                                        <Button variant="ghost" onClick={() => handleSort('name')}>
                                            Asset Name <ArrowUpDown className="ml-2 h-4 w-4" />
                                        </Button>
                                    </TableHead>
                                    <TableHead>
                                         <Button variant="ghost" onClick={() => handleSort('category')}>
                                            Category <ArrowUpDown className="ml-2 h-4 w-4" />
                                        </Button>
                                    </TableHead>
                                    <TableHead>
                                         <Button variant="ghost" onClick={() => handleSort('status')}>
                                            Status <ArrowUpDown className="ml-2 h-4 w-4" />
                                        </Button>
                                    </TableHead>
                                    <TableHead className="hidden md:table-cell">
                                        <Button variant="ghost" onClick={() => handleSort('location')}>
                                            Location <ArrowUpDown className="ml-2 h-4 w-4" />
                                        </Button>
                                    </TableHead>
                                    <TableHead className="hidden md:table-cell">Assigned To</TableHead>
                                    <TableHead><span className="sr-only">Actions</span></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sortedAndFilteredAssets.map(asset => {
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
                        <form onSubmit={form.handleSubmit(processSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto px-2">
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
                                 {assetToEdit ? (
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button type="button">Save Changes</Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                <AlertDialogDescription>This will save the changes to the asset.</AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => form.handleSubmit(processSubmit)()}>Confirm</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                ) : (
                                    <Button type="submit">Add Asset</Button>
                                )}
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

    