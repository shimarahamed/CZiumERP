
'use client'

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Header from "@/components/Header";
import { useToast } from "@/hooks/use-toast";
import { useAppContext } from '@/context/AppContext';
import type { Candidate, CandidateStatus } from '@/types';
import { MoreHorizontal, PlusCircle, Mail, Briefcase, LayoutGrid, List } from '@/components/icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const candidateSchema = z.object({
  name: z.string().min(1, "Name is required."),
  email: z.string().email("Invalid email address."),
  phone: z.string().min(1, "Phone number is required."),
  jobRequisitionId: z.string().min(1, "Please select a job position."),
});

type CandidateFormData = z.infer<typeof candidateSchema>;

const statusColumns: { status: CandidateStatus; title: string; color: string }[] = [
    { status: 'applied', title: 'Applied', color: 'bg-blue-500' },
    { status: 'interviewing', title: 'Interviewing', color: 'bg-purple-500' },
    { status: 'offer', title: 'Offer', color: 'bg-yellow-500' },
    { status: 'hired', title: 'Hired', color: 'bg-green-500' },
    { status: 'rejected', title: 'Rejected', color: 'bg-red-500' },
];

const nextStatusMap: Partial<Record<CandidateStatus, CandidateStatus[]>> = {
    applied: ['interviewing', 'rejected'],
    interviewing: ['offer', 'rejected'],
    offer: ['hired', 'rejected'],
};

const statusVariant: { [key in CandidateStatus]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
    applied: 'default',
    interviewing: 'secondary',
    offer: 'outline',
    hired: 'default',
    rejected: 'destructive',
};

export default function RecruitmentPage() {
    const { candidates, setCandidates, addActivityLog, user, jobRequisitions } = useAppContext();
    const { toast } = useToast();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [view, setView] = useState<'kanban' | 'list'>('kanban');

    const form = useForm<CandidateFormData>({
        resolver: zodResolver(candidateSchema),
        defaultValues: { name: '', email: '', phone: '', jobRequisitionId: '' }
    });
    
    const openJobRequisitions = useMemo(() => 
        jobRequisitions.filter(job => job.status === 'open'),
    [jobRequisitions]);

    const canManage = user?.role === 'admin' || user?.role === 'manager';

    const filteredCandidates = useMemo(() => {
        if (!searchTerm) return candidates;
        const lowercasedFilter = searchTerm.toLowerCase();
        return candidates.filter(candidate =>
            candidate.name.toLowerCase().includes(lowercasedFilter) ||
            candidate.email.toLowerCase().includes(lowercasedFilter) ||
            candidate.positionAppliedFor.toLowerCase().includes(lowercasedFilter)
        );
    }, [candidates, searchTerm]);

    if (!canManage) {
        return (
            <div className="flex flex-col h-full"><Header title="Access Denied" />
                <main className="flex-1 p-6"><Card><CardHeader><CardTitle>Permission Required</CardTitle></CardHeader>
                <CardContent><p>You do not have permission to manage recruitment.</p></CardContent></Card></main>
            </div>
        );
    }

    const onSubmit = (data: CandidateFormData) => {
        const job = openJobRequisitions.find(j => j.id === data.jobRequisitionId);
        if (!job) {
            toast({ variant: 'destructive', title: 'Invalid Job', description: 'The selected job position is not valid.'});
            return;
        }

        const newCandidate: Candidate = {
            id: `cand-${Date.now()}`,
            avatar: `https://placehold.co/40x40`,
            status: 'applied',
            applicationDate: new Date().toISOString(),
            name: data.name,
            email: data.email,
            phone: data.phone,
            jobRequisitionId: data.jobRequisitionId,
            positionAppliedFor: job.title,
        };
        setCandidates(prev => [newCandidate, ...prev]);
        addActivityLog('Candidate Added', `Added new candidate: ${data.name} for ${job.title}`);
        toast({ title: 'Candidate Added' });
        setIsFormOpen(false);
        form.reset({ name: '', email: '', phone: '', jobRequisitionId: '' });
    };

    const handleStatusChange = (candidateId: string, newStatus: CandidateStatus) => {
        setCandidates(prev => prev.map(c => c.id === candidateId ? { ...c, status: newStatus } : c));
        const candidate = candidates.find(c => c.id === candidateId);
        if (candidate) {
            addActivityLog('Candidate Status Updated', `${candidate.name}'s status changed to ${newStatus}`);
            toast({ title: 'Status Updated' });
        }
    };
    
    return (
        <div className="flex flex-col h-full">
            <Header title="Recruitment Pipeline" />
            <main className="flex-1 flex flex-col p-4 md:p-6">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold">Candidates</h1>
                        <p className="text-muted-foreground">Track applicants through your hiring process.</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                        <Input
                            placeholder="Search candidates..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full md:w-auto md:min-w-[250px] bg-secondary"
                        />
                        <div className="flex items-center gap-2">
                            <Button variant={view === 'kanban' ? 'default' : 'outline'} size="icon" onClick={() => setView('kanban')}><LayoutGrid className="h-4 w-4" /></Button>
                            <Button variant={view === 'list' ? 'default' : 'outline'} size="icon" onClick={() => setView('list')}><List className="h-4 w-4" /></Button>
                        </div>
                        <Button size="sm" className="gap-1" onClick={() => setIsFormOpen(true)}>
                            <PlusCircle className="h-4 w-4" /> Add Candidate
                        </Button>
                    </div>
                </div>
                
                {view === 'kanban' ? (
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 overflow-x-auto">
                        {statusColumns.map(column => (
                            <div key={column.status} className="flex flex-col gap-4">
                                <div className="flex items-center gap-2 px-2">
                                    <span className={cn("h-2 w-2 rounded-full", column.color)} />
                                    <h2 className="font-semibold text-lg">{column.title}</h2>
                                    <span className="text-sm text-muted-foreground">({filteredCandidates.filter(c => c.status === column.status).length})</span>
                                </div>
                                <div className="flex-1 flex flex-col gap-4 bg-muted/50 p-4 rounded-lg min-h-[200px]">
                                    {filteredCandidates.filter(c => c.status === column.status).map(candidate => (
                                        <Card key={candidate.id}>
                                            <CardHeader className="p-4">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar>
                                                            <AvatarImage src={candidate.avatar} alt={candidate.name} data-ai-hint="person user"/>
                                                            <AvatarFallback>{candidate.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <CardTitle className="text-base">{candidate.name}</CardTitle>
                                                            <CardDescription className="text-xs">Applied: {new Date(candidate.applicationDate).toLocaleDateString()}</CardDescription>
                                                        </div>
                                                    </div>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal /></Button></DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                                                            <DropdownMenuSeparator />
                                                            {nextStatusMap[candidate.status]?.map(nextStatus => (
                                                                <DropdownMenuItem key={nextStatus} onClick={() => handleStatusChange(candidate.id, nextStatus)}>
                                                                    Move to {nextStatus.charAt(0).toUpperCase() + nextStatus.slice(1)}
                                                                </DropdownMenuItem>
                                                            ))}
                                                            {(nextStatusMap[candidate.status]?.length ?? 0) > 0 && <DropdownMenuSeparator />}
                                                            <DropdownMenuItem className="text-destructive" onClick={() => handleStatusChange(candidate.id, 'rejected')}>Reject</DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="p-4 pt-0 space-y-2 text-sm">
                                                <p className="flex items-center gap-2 text-muted-foreground"><Briefcase className="h-4 w-4" /> {candidate.positionAppliedFor}</p>
                                                <p className="flex items-center gap-2 text-muted-foreground"><Mail className="h-4 w-4" /> {candidate.email}</p>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <Card>
                        <CardContent>
                           <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Candidate</TableHead>
                                        <TableHead>Position Applied For</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Application Date</TableHead>
                                        <TableHead><span className="sr-only">Actions</span></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredCandidates.map(candidate => (
                                        <TableRow key={candidate.id}>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-3">
                                                    <Avatar>
                                                        <AvatarImage src={candidate.avatar} alt={candidate.name} data-ai-hint="person user"/>
                                                        <AvatarFallback>{candidate.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <div>{candidate.name}</div>
                                                        <div className="text-xs text-muted-foreground">{candidate.email}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>{candidate.positionAppliedFor}</TableCell>
                                            <TableCell><Badge variant={statusVariant[candidate.status]} className="capitalize">{candidate.status.replace('-', ' ')}</Badge></TableCell>
                                            <TableCell>{new Date(candidate.applicationDate).toLocaleDateString()}</TableCell>
                                            <TableCell>
                                                 <DropdownMenu>
                                                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal /></Button></DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                                                        <DropdownMenuSeparator />
                                                        {nextStatusMap[candidate.status]?.map(nextStatus => (
                                                            <DropdownMenuItem key={nextStatus} onClick={() => handleStatusChange(candidate.id, nextStatus)}>
                                                                Move to {nextStatus.charAt(0).toUpperCase() + nextStatus.slice(1)}
                                                            </DropdownMenuItem>
                                                        ))}
                                                        {(nextStatusMap[candidate.status]?.length ?? 0) > 0 && <DropdownMenuSeparator />}
                                                        <DropdownMenuItem className="text-destructive" onClick={() => handleStatusChange(candidate.id, 'rejected')}>Reject</DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}

            </main>

             <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Add New Candidate</DialogTitle></DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                            <FormField control={form.control} name="name" render={({ field }) => (
                                <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <FormField control={form.control} name="email" render={({ field }) => (
                                <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <FormField control={form.control} name="phone" render={({ field }) => (
                                <FormItem><FormLabel>Phone</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                             <FormField control={form.control} name="jobRequisitionId" render={({ field }) => (
                                <FormItem><FormLabel>Position Applied For</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Select a job" /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            {openJobRequisitions.map(job => <SelectItem key={job.id} value={job.id}>{job.title}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                <FormMessage /></FormItem>
                            )}/>
                            <DialogFooter><Button type="submit">Add Candidate</Button></DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
