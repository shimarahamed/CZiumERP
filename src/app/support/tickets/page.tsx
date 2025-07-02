
'use client'

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Header from "@/components/Header";
import { useToast } from "@/hooks/use-toast";
import { useAppContext } from '@/context/AppContext';
import type { Ticket, TicketStatus, TicketPriority } from '@/types';
import { MoreHorizontal, PlusCircle } from '@/components/icons';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from '@/components/ui/separator';

const ticketSchema = z.object({
  title: z.string().min(1, "Title is required."),
  description: z.string().min(1, "Description is required."),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  assigneeId: z.string().optional(),
  category: z.string().optional(),
  group: z.string().optional(),
});

type TicketFormData = z.infer<typeof ticketSchema>;

const statusVariant: { [key in TicketStatus]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
    'open': 'default',
    'in-progress': 'secondary',
    'on-hold': 'secondary',
    'closed': 'outline',
};

const priorityVariant: { [key in TicketPriority]: 'default' | 'secondary' | 'destructive' } = {
    low: 'secondary',
    medium: 'default',
    high: 'outline',
    urgent: 'destructive'
};

const priorityDisplay: { [key in TicketPriority]: string } = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    urgent: 'Urgent'
}

export default function SupportTicketsPage() {
    const { tickets, setTickets, users, addActivityLog, user } = useAppContext();
    const { toast } = useToast();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [viewingTicket, setViewingTicket] = useState<Ticket | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<TicketStatus | 'all'>('all');
    const [priorityFilter, setPriorityFilter] = useState<TicketPriority | 'all'>('all');


    const form = useForm<TicketFormData>({
        resolver: zodResolver(ticketSchema),
        defaultValues: { title: '', description: '', priority: 'medium', assigneeId: 'unassigned', category: '', group: '' }
    });

    const supportTeam = useMemo(() => users.filter(u => u.role === 'admin' || u.role === 'manager'), [users]);

    const filteredTickets = useMemo(() => {
        return tickets
            .filter(ticket => {
                if (statusFilter !== 'all' && ticket.status !== statusFilter) {
                    return false;
                }
                if (priorityFilter !== 'all' && ticket.priority !== priorityFilter) {
                    return false;
                }
                if (!searchTerm) {
                    return true;
                }
                const lowercasedFilter = searchTerm.toLowerCase();
                return (
                    ticket.id.toLowerCase().includes(lowercasedFilter) ||
                    ticket.title.toLowerCase().includes(lowercasedFilter) ||
                    ticket.description.toLowerCase().includes(lowercasedFilter) ||
                    (ticket.assigneeName && ticket.assigneeName.toLowerCase().includes(lowercasedFilter))
                );
            });
    }, [tickets, searchTerm, statusFilter, priorityFilter]);

    const onSubmit = (data: TicketFormData) => {
        if (!user) return;
        const finalAssigneeId = (data.assigneeId && data.assigneeId !== 'unassigned') ? data.assigneeId : undefined;
        const assignee = finalAssigneeId ? users.find(u => u.id === finalAssigneeId) : undefined;
        
        const newTicket: Ticket = {
            id: `ticket-${Date.now()}`,
            reporterId: user.id,
            reporterName: user.name,
            assigneeId: finalAssigneeId,
            assigneeName: assignee?.name,
            status: 'open',
            createdAt: new Date().toISOString(),
            title: data.title,
            description: data.description,
            priority: data.priority,
            category: data.category || 'General',
            group: data.group || 'Default',
        };
        setTickets(prev => [newTicket, ...prev]);
        addActivityLog('Support Ticket Created', `Created ticket: "${data.title}"`);
        toast({ title: 'Ticket Created' });
        setIsFormOpen(false);
        form.reset({ title: '', description: '', priority: 'medium', assigneeId: 'unassigned', category: '', group: '' });
    };

    const handleStatusChange = (ticketId: string, newStatus: TicketStatus) => {
        setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: newStatus } : t));
        const ticket = tickets.find(t => t.id === ticketId);
        if (ticket) {
            addActivityLog('Ticket Status Updated', `Ticket "${ticket.title}" status changed to ${newStatus}`);
            toast({ title: 'Ticket Status Updated' });
        }
    };

    const nextStatusMap: Partial<Record<TicketStatus, TicketStatus[]>> = {
        open: ['in-progress', 'on-hold', 'closed'],
        'in-progress': ['on-hold', 'closed'],
        'on-hold': ['in-progress', 'closed'],
    };

    return (
        <div className="flex flex-col h-full">
            <Header title="Support Tickets" />
            <main className="flex-1 overflow-auto p-4 md:p-6">
                <Card>
                    <CardHeader>
                        <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
                            <div>
                                <CardTitle>Ticket Queue</CardTitle>
                                <CardDescription>Manage all support and maintenance requests.</CardDescription>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                                <Input
                                    placeholder="Search tickets..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full md:w-auto md:min-w-[200px] bg-secondary"
                                />
                                <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as TicketStatus | 'all')}>
                                    <SelectTrigger className="w-full sm:w-[150px]">
                                        <SelectValue placeholder="Filter by status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Statuses</SelectItem>
                                        <SelectItem value="open">Open</SelectItem>
                                        <SelectItem value="in-progress">In Progress</SelectItem>
                                        <SelectItem value="on-hold">On Hold</SelectItem>
                                        <SelectItem value="closed">Closed</SelectItem>
                                    </SelectContent>
                                </Select>
                                 <Select value={priorityFilter} onValueChange={(value) => setPriorityFilter(value as TicketPriority | 'all')}>
                                    <SelectTrigger className="w-full sm:w-[150px]">
                                        <SelectValue placeholder="Filter by priority" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Priorities</SelectItem>
                                        <SelectItem value="low">Low</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="high">High</SelectItem>
                                        <SelectItem value="urgent">Urgent</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Button size="sm" className="gap-1 flex-shrink-0" onClick={() => setIsFormOpen(true)}>
                                    <PlusCircle className="h-4 w-4" /> Create Ticket
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[120px]">Ticket ID</TableHead>
                                    <TableHead>Subject</TableHead>
                                    <TableHead className="hidden md:table-cell">Requester</TableHead>
                                    <TableHead className="hidden md:table-cell">Assigned To</TableHead>
                                    <TableHead className="hidden lg:table-cell">Group</TableHead>
                                    <TableHead className="hidden lg:table-cell">Category</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredTickets.map(ticket => (
                                    <TableRow key={ticket.id} onClick={() => setViewingTicket(ticket)} className="cursor-pointer">
                                        <TableCell className="font-mono text-xs">{ticket.id}</TableCell>
                                        <TableCell className="font-medium max-w-[200px] lg:max-w-[350px] truncate">{ticket.title}</TableCell>
                                        <TableCell className="hidden md:table-cell">{ticket.reporterName}</TableCell>
                                        <TableCell className="hidden md:table-cell">{ticket.assigneeName || 'Unassigned'}</TableCell>
                                        <TableCell className="hidden lg:table-cell">{ticket.group}</TableCell>
                                        <TableCell className="hidden lg:table-cell">{ticket.category}</TableCell>
                                        <TableCell>
                                            <Badge variant={statusVariant[ticket.status]} className="capitalize">{ticket.status.replace('-', ' ')}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                                                    <DropdownMenuSeparator />
                                                    {nextStatusMap[ticket.status]?.map(nextStatus => (
                                                        <DropdownMenuItem key={nextStatus} onClick={() => handleStatusChange(ticket.id, nextStatus)}>
                                                            Move to {nextStatus.charAt(0).toUpperCase() + nextStatus.slice(1).replace('-', ' ')}
                                                        </DropdownMenuItem>
                                                    ))}
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
                        <DialogTitle>Create New Support Ticket</DialogTitle>
                        <DialogDescription>Describe the issue or request in detail.</DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                            <FormField control={form.control} name="title" render={({ field }) => (
                                <FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <FormField control={form.control} name="description" render={({ field }) => (
                                <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea rows={5} {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField control={form.control} name="category" render={({ field }) => (
                                    <FormItem><FormLabel>Category</FormLabel><FormControl><Input {...field} placeholder="e.g. Hardware, Software" /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name="group" render={({ field }) => (
                                    <FormItem><FormLabel>Group</FormLabel><FormControl><Input {...field} placeholder="e.g. IT Support, Operations" /></FormControl><FormMessage /></FormItem>
                                )}/>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                               <FormField control={form.control} name="priority" render={({ field }) => (
                                    <FormItem><FormLabel>Priority</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                                            <SelectContent>
                                                <SelectItem value="low">Low</SelectItem>
                                                <SelectItem value="medium">Medium</SelectItem>
                                                <SelectItem value="high">High</SelectItem>
                                                <SelectItem value="urgent">Urgent</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                                <FormField control={form.control} name="assigneeId" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Assign To (Optional)</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Select a team member" /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                <SelectItem value="unassigned">Unassigned</SelectItem>
                                                {supportTeam.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                            </div>
                            <DialogFooter><Button type="submit">Create Ticket</Button></DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            <Dialog open={!!viewingTicket} onOpenChange={(open) => !open && setViewingTicket(null)}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{viewingTicket?.title}</DialogTitle>
                        <DialogDescription>
                            Ticket ID: {viewingTicket?.id}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4 max-h-[70vh] overflow-y-auto">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div><p className="font-semibold">Requester</p><p>{viewingTicket?.reporterName}</p></div>
                            <div><p className="font-semibold">Assigned To</p><p>{viewingTicket?.assigneeName || 'Unassigned'}</p></div>
                            <div><p className="font-semibold">Created On</p><p>{viewingTicket && format(new Date(viewingTicket.createdAt), 'PPP')}</p></div>
                            <div><p className="font-semibold">Priority</p><p className="capitalize">{viewingTicket?.priority}</p></div>
                            <div><p className="font-semibold">Status</p><p className="capitalize">{viewingTicket?.status.replace('-', ' ')}</p></div>
                            <div><p className="font-semibold">Group</p><p>{viewingTicket?.group || 'N/A'}</p></div>
                            <div><p className="font-semibold">Category</p><p>{viewingTicket?.category || 'N/A'}</p></div>
                        </div>
                        <Separator />
                        <div>
                            <h4 className="font-semibold mb-2">Description</h4>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap bg-secondary p-4 rounded-md">{viewingTicket?.description}</p>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
