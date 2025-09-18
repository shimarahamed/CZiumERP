
'use client'

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns/format';
import { differenceInDays } from 'date-fns/differenceInDays';
import { parseISO } from 'date-fns/parseISO';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from '@/components/ui/textarea';
import Header from "@/components/Header";
import { useToast } from "@/hooks/use-toast";
import { useAppContext } from '@/context/AppContext';
import type { LeaveRequest } from '@/types';
import { Badge } from '@/components/ui/badge';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, Check, X } from '@/components/icons';
import { Input } from '@/components/ui/input';

const leaveRequestSchema = z.object({
  dateRange: z.object({
    from: z.date({ required_error: "Start date is required." }),
    to: z.date({ required_error: "End date is required." }),
  }),
  reason: z.string().min(10, "Reason must be at least 10 characters long."),
});

type LeaveRequestFormData = z.infer<typeof leaveRequestSchema>;

const statusVariant: { [key in LeaveRequest['status']]: 'default' | 'secondary' | 'destructive' } = {
    pending: 'secondary',
    approved: 'default',
    rejected: 'destructive',
};

export default function LeaveRequestsPage() {
    const { user, employees, setEmployees, leaveRequests, setLeaveRequests, addActivityLog } = useAppContext();
    const { toast } = useToast();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const form = useForm<LeaveRequestFormData>({
        resolver: zodResolver(leaveRequestSchema),
    });

    const canManage = user?.role === 'admin' || user?.role === 'manager';

    const currentEmployee = useMemo(() => employees.find(e => e.userId === user?.id), [employees, user?.id]);
    const leaveBalance = useMemo(() => {
        if (!currentEmployee) return 0;
        return (currentEmployee.annualLeaveAllowance || 0) - (currentEmployee.leaveTaken || 0);
    }, [currentEmployee]);

    const filteredMyRequests = useMemo(() => {
        const baseRequests = leaveRequests.filter(lr => lr.userId === user?.id).sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());
        if (!searchTerm) return baseRequests;
        return baseRequests.filter(req => req.reason.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [leaveRequests, user?.id, searchTerm]);
    
    const filteredTeamRequests = useMemo(() => {
        const baseRequests = leaveRequests.filter(lr => lr.status === 'pending').sort((a,b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());
        if (!searchTerm) return baseRequests;
        return baseRequests.filter(req => 
            req.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            req.reason.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [leaveRequests, searchTerm]);

    const onSubmit = (data: LeaveRequestFormData) => {
        if (!user) return;
        const newRequest: LeaveRequest = {
            id: `lr-${Date.now()}`,
            userId: user.id,
            userName: user.name,
            startDate: format(data.dateRange.from, 'yyyy-MM-dd'),
            endDate: format(data.dateRange.to, 'yyyy-MM-dd'),
            reason: data.reason,
            status: 'pending',
            requestedAt: new Date().toISOString(),
        };
        setLeaveRequests(prev => [newRequest, ...prev]);
        addActivityLog('Leave Requested', `User ${user.email} requested leave.`);
        toast({ title: 'Leave Request Submitted', description: 'Your request has been sent for approval.' });
        setIsFormOpen(false);
        form.reset();
    };
    
    const handleUpdateRequest = (requestId: string, status: 'approved' | 'rejected') => {
        if(!user) return;
        
        const req = leaveRequests.find(r => r.id === requestId);
        if (!req) return;

        if (status === 'approved') {
            const employeeToUpdate = employees.find(e => e.userId === req.userId);
            if(employeeToUpdate) {
                const leaveDuration = differenceInDays(parseISO(req.endDate), parseISO(req.startDate)) + 1;
                const updatedEmployees = employees.map(emp => 
                    emp.id === employeeToUpdate.id 
                    ? { ...emp, leaveTaken: (emp.leaveTaken || 0) + leaveDuration } 
                    : emp
                );
                setEmployees(updatedEmployees);
            }
        }
        
        setLeaveRequests(prev => 
            prev.map(r => r.id === requestId ? { ...r, status } : r)
        );

        addActivityLog(`Leave Request ${status.charAt(0).toUpperCase() + status.slice(1)}`, `Request from ${req.userName} was ${status} by ${user.email}`);
        toast({ title: `Request ${status.charAt(0).toUpperCase() + status.slice(1)}` });
    };


    return (
        <div className="flex flex-col h-full">
            <Header title="Leave Requests" />
            <main className="flex-1 overflow-auto p-4 md:p-6">
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>My Leave Balance</CardTitle>
                        <CardDescription>Your available leave for the year.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{leaveBalance} days</p>
                        <p className="text-sm text-muted-foreground">Remaining out of {currentEmployee?.annualLeaveAllowance || 0} days.</p>
                    </CardContent>
                </Card>

                 <Tabs defaultValue="my-requests" className="w-full">
                    <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
                        <TabsList>
                            <TabsTrigger value="my-requests">My Requests</TabsTrigger>
                            {canManage && <TabsTrigger value="team-requests">Team Requests</TabsTrigger>}
                        </TabsList>
                        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                            <Input
                                placeholder="Search requests..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full md:w-auto bg-secondary"
                            />
                             <Button size="sm" className="gap-1" onClick={() => setIsFormOpen(true)}>
                                <PlusCircle className="h-4 w-4" />
                                New Request
                            </Button>
                        </div>
                    </div>
                    <TabsContent value="my-requests">
                        <Card className="mt-4">
                            <CardHeader>
                                <CardTitle>My Leave History</CardTitle>
                                <CardDescription>A log of your past and pending leave requests.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Dates</TableHead>
                                            <TableHead>Reason</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredMyRequests.map(req => (
                                            <TableRow key={req.id}>
                                                <TableCell>{format(new Date(req.startDate), 'MMM d, yyyy')} - {format(new Date(req.endDate), 'MMM d, yyyy')}</TableCell>
                                                <TableCell className="truncate max-w-xs">{req.reason}</TableCell>
                                                <TableCell><Badge variant={statusVariant[req.status]} className="capitalize">{req.status}</Badge></TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    {canManage && (
                    <TabsContent value="team-requests">
                         <Card className="mt-4">
                            <CardHeader>
                                <CardTitle>Pending Team Requests</CardTitle>
                                <CardDescription>Review and approve/reject leave requests from your team.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Employee</TableHead>
                                            <TableHead>Dates</TableHead>
                                            <TableHead>Reason</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredTeamRequests.map(req => (
                                            <TableRow key={req.id}>
                                                <TableCell>{req.userName}</TableCell>
                                                <TableCell>{format(new Date(req.startDate), 'MMM d')} - {format(new Date(req.endDate), 'MMM d, yyyy')}</TableCell>
                                                <TableCell className="truncate max-w-xs">{req.reason}</TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2">
                                                        <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => handleUpdateRequest(req.id, 'approved')}>
                                                            <Check className="h-4 w-4 text-green-500" />
                                                        </Button>
                                                        <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => handleUpdateRequest(req.id, 'rejected')}>
                                                            <X className="h-4 w-4 text-red-500" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    )}
                 </Tabs>
            </main>

            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>New Leave Request</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                            <FormField
                                control={form.control}
                                name="dateRange"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Leave Dates</FormLabel>
                                        <DateRangePicker date={field.value} setDate={field.onChange} />
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="reason"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Reason</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Please provide a reason for your leave..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <DialogFooter>
                                <Button type="submit">Submit Request</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    );
}

