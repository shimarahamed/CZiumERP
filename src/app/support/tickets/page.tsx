
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

const ticketSchema = z.object({
  title: z.string().min(1, "Title is required."),
  description: z.string().min(1, "Description is required."),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  assigneeId: z.string().optional(),
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
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<TicketStatus | 'all'>('all');
    const [priorityFilter, setPriorityFilter] = useState<TicketPriority | 'all'>('all');


    const form = useForm<TicketFormData>({
        resolver: zodResolver(ticketSchema),
        defaultValues: { title: '', description: '', priority: 'medium', assigneeId: 'unassigned' }
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
        };
        setTickets(prev => [newTicket, ...prev]);
        addActivityLog('Support Ticket Created', `Created ticket: "${data.title}"`);
        toast({ title: 'Ticket Created' });
        setIsFormOpen(false);
        form.reset({ title: '', description: '', priority: 'medium', assigneeId: 'unassigned' });
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
                                    placeholder="Search by ID, title, assignee..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full md:w-auto md:min-w-[250px] bg-secondary"
                                />
                                <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as TicketStatus | 'all')}>
                                    <SelectTrigger className="w-full sm:w-auto">
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
                                    <SelectTrigger className="w-full sm:w-auto">
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
                                    <TableHead>Ticket</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Priority</TableHead>
                                    <TableHead>Assignee</TableHead>
                                    <TableHead className="hidden md:table-cell">Created</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredTickets.map(ticket => (
                                    <TableRow key={ticket.id}>
                                        <TableCell className="font-medium">
                                            <div className="flex flex-col">
                                                <span className="font-semibold truncate max-w-[250px]">{ticket.title}</span>
                                                <span className="text-xs text-muted-foreground">{ticket.id}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={statusVariant[ticket.status]} className="capitalize">{ticket.status.replace('-', ' ')}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={priorityVariant[ticket.priority]} className="capitalize">{priorityDisplay[ticket.priority]}</Badge>
                                        </TableCell>
                                        <TableCell>{ticket.assigneeName || 'Unassigned'}</TableCell>
                                        <TableCell className="hidden md:table-cell">{format(new Date(ticket.createdAt), 'PPP')}</TableCell>
                                        <TableCell className="text-right">
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
        </div>
    );
}
