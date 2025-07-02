
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
import { MoreHorizontal, PlusCircle, User, Flag, MessageSquare } from '@/components/icons';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { format } from 'date-fns';

const ticketSchema = z.object({
  title: z.string().min(1, "Title is required."),
  description: z.string().min(1, "Description is required."),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  assigneeId: z.string().optional(),
});

type TicketFormData = z.infer<typeof ticketSchema>;

const statusColumns: { status: TicketStatus; title: string; color: string }[] = [
    { status: 'open', title: 'Open', color: 'bg-blue-500' },
    { status: 'in-progress', title: 'In Progress', color: 'bg-yellow-500' },
    { status: 'on-hold', title: 'On Hold', color: 'bg-purple-500' },
    { status: 'closed', title: 'Closed', color: 'bg-green-500' },
];

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

    const form = useForm<TicketFormData>({
        resolver: zodResolver(ticketSchema),
        defaultValues: { title: '', description: '', priority: 'medium', assigneeId: '' }
    });

    const supportTeam = useMemo(() => users.filter(u => u.role === 'admin' || u.role === 'manager'), [users]);
    const canManage = user?.role === 'admin' || user?.role === 'manager';

    const filteredTickets = useMemo(() => {
        if (!searchTerm) return tickets;
        const lowercasedFilter = searchTerm.toLowerCase();
        return tickets.filter(ticket =>
            ticket.title.toLowerCase().includes(lowercasedFilter) ||
            ticket.description.toLowerCase().includes(lowercasedFilter) ||
            (ticket.assigneeName && ticket.assigneeName.toLowerCase().includes(lowercasedFilter))
        );
    }, [tickets, searchTerm]);

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
        form.reset({ title: '', description: '', priority: 'medium', assigneeId: '' });
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
            <main className="flex-1 flex flex-col p-4 md:p-6">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold">Ticket Dashboard</h1>
                        <p className="text-muted-foreground">Manage all support and maintenance requests.</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                        <Input
                            placeholder="Search tickets..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full md:w-auto md:min-w-[250px] bg-secondary"
                        />
                        <Button size="sm" className="gap-1" onClick={() => setIsFormOpen(true)}>
                            <PlusCircle className="h-4 w-4" /> Create Ticket
                        </Button>
                    </div>
                </div>
                
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 overflow-x-auto">
                    {statusColumns.map(column => (
                        <div key={column.status} className="flex flex-col gap-4">
                            <div className="flex items-center gap-2 px-2">
                                <span className={cn("h-2 w-2 rounded-full", column.color)} />
                                <h2 className="font-semibold text-lg">{column.title}</h2>
                                <span className="text-sm text-muted-foreground">({filteredTickets.filter(c => c.status === column.status).length})</span>
                            </div>
                            <div className="flex-1 flex flex-col gap-4 bg-muted/50 p-4 rounded-lg min-h-[200px]">
                                {filteredTickets.filter(c => c.status === column.status).map(ticket => (
                                    <Card key={ticket.id}>
                                        <CardHeader className="p-4 pb-2">
                                            <div className="flex justify-between items-start">
                                                <CardTitle className="text-base leading-tight pr-2">{ticket.title}</CardTitle>
                                                 <DropdownMenu>
                                                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal /></Button></DropdownMenuTrigger>
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
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-4 pt-2 space-y-3 text-sm">
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Badge variant={priorityVariant[ticket.priority]} className="capitalize">{priorityDisplay[ticket.priority]}</Badge>
                                            </div>
                                            <p className="text-muted-foreground line-clamp-3">{ticket.description}</p>
                                            <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                                                <div className="flex items-center gap-1.5">
                                                    <User className="h-3 w-3" />
                                                    <span className="truncate">{ticket.assigneeName || 'Unassigned'}</span>
                                                </div>
                                                <span>{format(new Date(ticket.createdAt), 'MMM d')}</span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
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
