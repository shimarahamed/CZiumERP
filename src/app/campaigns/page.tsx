
'use client'

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format, parseISO } from 'date-fns';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Header from "@/components/Header";
import { useToast } from "@/hooks/use-toast";
import { useAppContext } from '@/context/AppContext';
import type { Campaign, CampaignStatus, CampaignChannel } from '@/types';
import { MoreHorizontal, PlusCircle, ArrowUpDown, Filter } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/date-picker';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';


const campaignSchema = z.object({
  name: z.string().min(1, "Campaign name is required."),
  description: z.string().optional(),
  status: z.enum(['planning', 'active', 'completed', 'cancelled']),
  channel: z.enum(['email', 'social-media', 'sms', 'paid-ads', 'other']),
  targetAudience: z.string().optional(),
  budget: z.coerce.number().min(0, "Budget must be non-negative."),
  startDate: z.date({ required_error: "Start date is required." }),
  endDate: z.date({ required_error: "End date is required." }),
}).refine(data => data.endDate >= data.startDate, {
    message: "End date cannot be before start date.",
    path: ["endDate"],
});

type CampaignFormData = z.infer<typeof campaignSchema>;

type SortKey = 'name' | 'status' | 'channel' | 'budget' | 'startDate';

type Filters = {
  name: string;
  status: CampaignStatus | 'all';
  channel: CampaignChannel | 'all';
};

const statusVariant: { [key in CampaignStatus]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
    planning: 'secondary',
    active: 'default',
    completed: 'outline',
    cancelled: 'destructive'
};

const channelDisplay: { [key in CampaignChannel]: string } = {
    'email': 'Email',
    'social-media': 'Social Media',
    'sms': 'SMS',
    'paid-ads': 'Paid Ads',
    'other': 'Other'
};

export default function CampaignsPage() {
    const { campaigns, setCampaigns, addActivityLog, user, currencySymbol } = useAppContext();
    const { toast } = useToast();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [campaignToEdit, setCampaignToEdit] = useState<Campaign | null>(null);
    const [campaignToDelete, setCampaignToDelete] = useState<Campaign | null>(null);
    const [sortKey, setSortKey] = useState<SortKey>('startDate');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const [filters, setFilters] = useState<Filters>({
        name: '',
        status: 'all',
        channel: 'all',
    });

    const form = useForm<CampaignFormData>({
        resolver: zodResolver(campaignSchema),
    });

    const canManage = user?.role === 'admin' || user?.role === 'manager';

    const sortedCampaigns = useMemo(() => {
        let filtered = campaigns.filter(campaign =>
            (filters.name ? campaign.name.toLowerCase().includes(filters.name.toLowerCase()) : true) &&
            (filters.status === 'all' || campaign.status === filters.status) &&
            (filters.channel === 'all' || campaign.channel === filters.channel)
        );

        filtered.sort((a, b) => {
            const aValue = a[sortKey];
            const bValue = b[sortKey];
            if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });

        return filtered;
    }, [campaigns, filters, sortKey, sortDirection]);

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

    const handleOpenForm = (campaign: Campaign | null = null) => {
        setCampaignToEdit(campaign);
        if (campaign) {
            form.reset({
                ...campaign,
                startDate: parseISO(campaign.startDate),
                endDate: parseISO(campaign.endDate),
            });
        } else {
            form.reset({
                name: '',
                description: '',
                status: 'planning',
                channel: 'email',
                targetAudience: '',
                budget: 0,
                startDate: new Date(),
                endDate: new Date(),
            });
        }
        setIsFormOpen(true);
    };

    const onSubmit = (data: CampaignFormData) => {
        const campaignData = {
          ...data,
          startDate: format(data.startDate, 'yyyy-MM-dd'),
          endDate: format(data.endDate, 'yyyy-MM-dd'),
        };

        if (campaignToEdit) {
            const updatedCampaigns = campaigns.map(c => c.id === campaignToEdit.id ? { ...c, ...campaignData } : c);
            setCampaigns(updatedCampaigns);
            toast({ title: "Campaign Updated", description: `${data.name} has been updated.` });
            addActivityLog('Campaign Updated', `Updated campaign: ${data.name}`);
        } else {
            const newCampaign: Campaign = {
                id: `camp-${Date.now()}`,
                ...campaignData,
            };
            setCampaigns([newCampaign, ...campaigns]);
            toast({ title: "Campaign Added", description: `${data.name} has been added.` });
            addActivityLog('Campaign Added', `Added new campaign: ${data.name}`);
        }
        setIsFormOpen(false);
        setCampaignToEdit(null);
    };
    
    const handleDelete = () => {
        if (!campaignToDelete) return;
        addActivityLog('Campaign Deleted', `Deleted campaign: ${campaignToDelete.name}`);
        setCampaigns(campaigns.filter(c => c.id !== campaignToDelete.id));
        toast({ title: "Campaign Deleted" });
        setCampaignToDelete(null);
    };

    return (
        <div className="flex flex-col h-full">
            <Header title="Marketing Campaigns" />
            <main className="flex-1 overflow-auto p-4 md:p-6">
                <Card>
                    <CardHeader>
                        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                            <div>
                                <CardTitle>Campaigns</CardTitle>
                                <CardDescription>Manage and track all your marketing campaigns.</CardDescription>
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
                                                <p className="text-sm text-muted-foreground">Set filters for the campaign list.</p>
                                            </div>
                                            <div className="grid gap-2">
                                                <div className="grid grid-cols-3 items-center gap-4">
                                                    <Label htmlFor="filter-name">Name</Label>
                                                    <Input id="filter-name" value={filters.name} onChange={(e) => handleFilterChange('name', e.target.value)} className="col-span-2 h-8" />
                                                </div>
                                                <div className="grid grid-cols-3 items-center gap-4">
                                                    <Label htmlFor="filter-status">Status</Label>
                                                    <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value as CampaignStatus | 'all')}>
                                                        <SelectTrigger className="col-span-2 h-8">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="all">All</SelectItem>
                                                            {Object.keys(statusVariant).map(status => (
                                                                <SelectItem key={status} value={status} className="capitalize">{status}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                 <div className="grid grid-cols-3 items-center gap-4">
                                                    <Label htmlFor="filter-channel">Channel</Label>
                                                    <Select value={filters.channel} onValueChange={(value) => handleFilterChange('channel', value as CampaignChannel | 'all')}>
                                                        <SelectTrigger className="col-span-2 h-8">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="all">All</SelectItem>
                                                             {Object.keys(channelDisplay).map(channel => (
                                                                <SelectItem key={channel} value={channel} className="capitalize">{channel.replace('-', ' ')}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                        </div>
                                    </PopoverContent>
                                </Popover>
                                {canManage && (
                                <Button size="sm" className="gap-1" onClick={() => handleOpenForm()}>
                                    <PlusCircle className="h-4 w-4" /> New Campaign
                                </Button>
                                )}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead><Button variant="ghost" onClick={() => handleSort('name')}>Campaign <ArrowUpDown className="ml-2 h-4 w-4"/></Button></TableHead>
                                    <TableHead><Button variant="ghost" onClick={() => handleSort('status')}>Status <ArrowUpDown className="ml-2 h-4 w-4"/></Button></TableHead>
                                    <TableHead><Button variant="ghost" onClick={() => handleSort('channel')}>Channel <ArrowUpDown className="ml-2 h-4 w-4"/></Button></TableHead>
                                    <TableHead><Button variant="ghost" onClick={() => handleSort('budget')}>Budget <ArrowUpDown className="ml-2 h-4 w-4"/></Button></TableHead>
                                    <TableHead className="hidden md:table-cell"><Button variant="ghost" onClick={() => handleSort('startDate')}>Timeline <ArrowUpDown className="ml-2 h-4 w-4"/></Button></TableHead>
                                    <TableHead><span className="sr-only">Actions</span></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sortedCampaigns.map(campaign => (
                                    <TableRow key={campaign.id}>
                                        <TableCell className="font-medium">{campaign.name}</TableCell>
                                        <TableCell><Badge variant={statusVariant[campaign.status]} className="capitalize">{campaign.status}</Badge></TableCell>
                                        <TableCell>{channelDisplay[campaign.channel]}</TableCell>
                                        <TableCell>{currencySymbol}{campaign.budget.toFixed(2)}</TableCell>
                                        <TableCell className="hidden md:table-cell">{format(parseISO(campaign.startDate), 'MMM d, yyyy')} - {format(parseISO(campaign.endDate), 'MMM d, yyyy')}</TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button aria-haspopup="true" size="icon" variant="ghost" disabled={!canManage}>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleOpenForm(campaign)}>Edit</DropdownMenuItem>
                                                    <DropdownMenuItem className="text-destructive" onClick={() => setCampaignToDelete(campaign)}>Delete</DropdownMenuItem>
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
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{campaignToEdit ? 'Edit Campaign' : 'New Campaign'}</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto px-2">
                            <FormField control={form.control} name="name" render={({ field }) => (
                                <FormItem><FormLabel>Campaign Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <FormField control={form.control} name="description" render={({ field }) => (
                                <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField control={form.control} name="status" render={({ field }) => (
                                    <FormItem><FormLabel>Status</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                <SelectItem value="planning">Planning</SelectItem>
                                                <SelectItem value="active">Active</SelectItem>
                                                <SelectItem value="completed">Completed</SelectItem>
                                                <SelectItem value="cancelled">Cancelled</SelectItem>
                                            </SelectContent>
                                        </Select><FormMessage />
                                    </FormItem>
                                )}/>
                                <FormField control={form.control} name="channel" render={({ field }) => (
                                    <FormItem><FormLabel>Channel</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                <SelectItem value="email">Email</SelectItem>
                                                <SelectItem value="social-media">Social Media</SelectItem>
                                                <SelectItem value="sms">SMS</SelectItem>
                                                <SelectItem value="paid-ads">Paid Ads</SelectItem>
                                                <SelectItem value="other">Other</SelectItem>
                                            </SelectContent>
                                        </Select><FormMessage />
                                    </FormItem>
                                )}/>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField control={form.control} name="targetAudience" render={({ field }) => (
                                    <FormItem><FormLabel>Target Audience</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name="budget" render={({ field }) => (
                                    <FormItem><FormLabel>Budget ({currencySymbol})</FormLabel><FormControl><Input type="number" step="100" {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                               <FormField control={form.control} name="startDate" render={({ field }) => (
                                    <FormItem className="flex flex-col pt-2"><FormLabel>Start Date</FormLabel><FormControl><DatePicker date={field.value} setDate={field.onChange} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name="endDate" render={({ field }) => (
                                    <FormItem className="flex flex-col pt-2"><FormLabel>End Date</FormLabel><FormControl><DatePicker date={field.value} setDate={field.onChange} /></FormControl><FormMessage /></FormItem>
                                )}/>
                            </div>
                            <DialogFooter>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild><Button type="button">{campaignToEdit ? 'Save Changes' : 'Create Campaign'}</Button></AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle></AlertDialogHeader>
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

            <AlertDialog open={!!campaignToDelete} onOpenChange={(open) => !open && setCampaignToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>This will permanently delete the campaign "{campaignToDelete?.name}".</AlertDialogDescription>
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
