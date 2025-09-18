
'use client'

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Header from "@/components/Header";
import { useAppContext } from "@/context/AppContext";
import type { Asset, AssetStatus } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, Filter } from '@/components/icons';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type SortKey = keyof Asset | 'assignedUserName';

type Filters = {
    name: string;
    status: AssetStatus | 'all';
    location: string;
    assignedTo: string;
};

const statusVariant: { [key in AssetStatus]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
    'in-use': 'default',
    'in-storage': 'secondary',
    'under-maintenance': 'outline',
    'retired': 'destructive'
};

export default function ITAssetsPage() {
    const { assets, users, stores } = useAppContext();
    const [sortKey, setSortKey] = useState<SortKey>('name');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    
    const [filters, setFilters] = useState<Filters>({
        name: '',
        status: 'all',
        location: '',
        assignedTo: '',
    });

    const itAssets = useMemo(() => assets.filter(a => a.category === 'IT Equipment'), [assets]);

    const sortedAndFilteredAssets = useMemo(() => {
        let filtered = [...itAssets].map(asset => {
            const assignedUser = users.find(u => u.id === asset.assignedTo);
            return { ...asset, assignedUserName: assignedUser?.name || 'Unassigned' };
        });

        filtered = filtered.filter(asset => {
            return (
                (filters.name ? asset.name.toLowerCase().includes(filters.name.toLowerCase()) : true) &&
                (filters.status === 'all' || asset.status === filters.status) &&
                (filters.location ? asset.location.toLowerCase().includes(filters.location.toLowerCase()) : true) &&
                (filters.assignedTo ? asset.assignedUserName.toLowerCase().includes(filters.assignedTo.toLowerCase()) : true)
            );
        });

        filtered.sort((a, b) => {
            const aValue = a[sortKey];
            const bValue = b[sortKey];

            if (aValue === undefined || aValue === null) return 1;
            if (bValue === undefined || bValue === null) return -1;
            
            if (sortKey === 'purchaseCost') {
                return sortDirection === 'asc' ? a.purchaseCost - b.purchaseCost : b.purchaseCost - a.purchaseCost;
            }

            if (typeof aValue === 'string' && typeof bValue === 'string') {
                return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
            }

            return 0;
        });

        return filtered;
    }, [itAssets, users, filters, sortKey, sortDirection]);
    
    const handleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortDirection('asc');
        }
    };

    const handleFilterChange = (field: keyof Filters, value: string) => {
        setFilters(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="flex flex-col h-full">
            <Header title="IT Asset Management" />
            <main className="flex-1 overflow-auto p-4 md:p-6">
                <Card>
                    <CardHeader>
                        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                            <div>
                                <CardTitle>IT Assets</CardTitle>
                                <CardDescription>A centralized inventory of all IT hardware and equipment.</CardDescription>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className="gap-2">
                                            <Filter className="h-4 w-4" /> Filter
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-80">
                                        <div className="grid gap-4">
                                            <div className="space-y-2">
                                                <h4 className="font-medium leading-none">Filters</h4>
                                                <p className="text-sm text-muted-foreground">Set filters for the asset list.</p>
                                            </div>
                                            <div className="grid gap-2">
                                                <div className="grid grid-cols-3 items-center gap-4">
                                                    <Label htmlFor="filter-name">Name</Label>
                                                    <Input id="filter-name" value={filters.name} onChange={(e) => handleFilterChange('name', e.target.value)} className="col-span-2 h-8" />
                                                </div>
                                                <div className="grid grid-cols-3 items-center gap-4">
                                                    <Label htmlFor="filter-status">Status</Label>
                                                    <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value as AssetStatus | 'all')}>
                                                        <SelectTrigger className="col-span-2 h-8">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="all">All</SelectItem>
                                                            {Object.keys(statusVariant).map(status => (
                                                                <SelectItem key={status} value={status} className="capitalize">{status.replace('-', ' ')}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="grid grid-cols-3 items-center gap-4">
                                                    <Label htmlFor="filter-location">Location</Label>
                                                    <Input id="filter-location" value={filters.location} onChange={(e) => handleFilterChange('location', e.target.value)} className="col-span-2 h-8" />
                                                </div>
                                                <div className="grid grid-cols-3 items-center gap-4">
                                                    <Label htmlFor="filter-assignedTo">Assigned To</Label>
                                                    <Input id="filter-assignedTo" value={filters.assignedTo} onChange={(e) => handleFilterChange('assignedTo', e.target.value)} className="col-span-2 h-8" />
                                                </div>
                                            </div>
                                        </div>
                                    </PopoverContent>
                                </Popover>
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
                                         <Button variant="ghost" onClick={() => handleSort('status')}>
                                            Status <ArrowUpDown className="ml-2 h-4 w-4" />
                                        </Button>
                                    </TableHead>
                                    <TableHead>
                                        <Button variant="ghost" onClick={() => handleSort('location')}>
                                            Location <ArrowUpDown className="ml-2 h-4 w-4" />
                                        </Button>
                                    </TableHead>
                                    <TableHead>
                                        <Button variant="ghost" onClick={() => handleSort('assignedUserName')}>
                                            Assigned To <ArrowUpDown className="ml-2 h-4 w-4" />
                                        </Button>
                                    </TableHead>
                                    <TableHead>Serial Number</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sortedAndFilteredAssets.map(asset => {
                                    const locationName = stores.find(s => s.id === asset.location)?.name || asset.location;
                                    return (
                                        <TableRow key={asset.id}>
                                            <TableCell className="font-medium">{asset.name}</TableCell>
                                            <TableCell><Badge variant={statusVariant[asset.status]} className="capitalize">{asset.status.replace('-', ' ')}</Badge></TableCell>
                                            <TableCell>{locationName}</TableCell>
                                            <TableCell>{asset.assignedUserName}</TableCell>
                                            <TableCell className="font-mono text-xs">{asset.serialNumber}</TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
