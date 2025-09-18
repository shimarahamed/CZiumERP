
'use client'

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import Header from "@/components/Header";
import { useToast } from "@/hooks/use-toast";
import { useAppContext } from '@/context/AppContext';
import type { PerformanceReview } from '@/types';
import { PlusCircle, Star } from '@/components/icons';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

const reviewSchema = z.object({
    employeeId: z.string().min(1, "Please select an employee."),
    rating: z.number().min(1).max(5),
    comments: z.string().min(10, "Comments must be at least 10 characters long."),
});

type ReviewFormData = z.infer<typeof reviewSchema>;


const RatingStars = ({ rating }: { rating: number }) => (
    <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
            <Star key={i} className={cn("h-4 w-4", i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground')} />
        ))}
    </div>
);

export default function PerformancePage() {
    const { performanceReviews, setPerformanceReviews, employees, addActivityLog, user } = useAppContext();
    const { toast } = useToast();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const form = useForm<ReviewFormData>({
        resolver: zodResolver(reviewSchema),
        defaultValues: { employeeId: '', rating: 3, comments: '' }
    });

    const canManage = user?.role === 'admin' || user?.role === 'manager';
    
     const filteredReviews = useMemo(() => {
        if (!searchTerm) return performanceReviews;
        const lowercasedFilter = searchTerm.toLowerCase();
        return performanceReviews.filter(review =>
            review.employeeName.toLowerCase().includes(lowercasedFilter) ||
            review.reviewerName.toLowerCase().includes(lowercasedFilter) ||
            review.comments.toLowerCase().includes(lowercasedFilter)
        );
    }, [performanceReviews, searchTerm]);

    if (!canManage) {
        return (
            <div className="flex flex-col h-full"><Header title="Access Denied" />
                <main className="flex-1 p-6"><Card><CardHeader><CardTitle>Permission Required</CardTitle></CardHeader>
                <CardContent><p>You do not have permission to manage performance reviews.</p></CardContent></Card></main>
            </div>
        );
    }
    
    const onSubmit = (data: ReviewFormData) => {
        if (!user) return;
        const employee = employees.find(e => e.id === data.employeeId);
        if (!employee) return;
        
        const newReview: PerformanceReview = {
            id: `pr-${Date.now()}`,
            employeeId: employee.id,
            employeeName: employee.name,
            reviewerId: user.id,
            reviewerName: user.name,
            date: new Date().toISOString(),
            ...data
        };

        setPerformanceReviews(prev => [newReview, ...prev]);
        addActivityLog('Performance Review Added', `Review for ${employee.name} added by ${user.name}`);
        toast({ title: 'Performance Review Added' });
        setIsFormOpen(false);
        form.reset({ employeeId: '', rating: 3, comments: '' });
    };

    return (
        <div className="flex flex-col h-full">
            <Header title="Performance Reviews" />
            <main className="flex-1 p-4 md:p-6">
                 <div className="flex flex-col md:flex-row justify-end md:items-center gap-4 mb-4">
                    <Input
                        placeholder="Search reviews..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full md:w-auto md:min-w-[250px] bg-secondary"
                    />
                    <Button size="sm" className="gap-1" onClick={() => setIsFormOpen(true)}>
                        <PlusCircle className="h-4 w-4" /> Add Review
                    </Button>
                </div>
                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Employee</TableHead>
                                    <TableHead>Reviewer</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Rating</TableHead>
                                    <TableHead>Comments</TableHead>
                                </TableRow>
                            </TableHeader>
                             <TableBody>
                                {filteredReviews.map(review => (
                                    <TableRow key={review.id}>
                                        <TableCell className="font-medium">{review.employeeName}</TableCell>
                                        <TableCell>{review.reviewerName}</TableCell>
                                        <TableCell>{format(new Date(review.date), 'PPP')}</TableCell>
                                        <TableCell><RatingStars rating={review.rating} /></TableCell>
                                        <TableCell className="max-w-sm truncate">{review.comments}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </main>

            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Add New Performance Review</DialogTitle></DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
                            <FormField control={form.control} name="employeeId" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Employee</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Select an employee" /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            {employees.map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                             <FormField control={form.control} name="rating" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Rating: {field.value} / 5</FormLabel>
                                    <FormControl>
                                        <Slider
                                            min={1} max={5} step={1}
                                            value={[field.value]}
                                            onValueChange={(values) => field.onChange(values[0])}
                                        />
                                    </FormControl>
                                </FormItem>
                             )}/>
                            <FormField control={form.control} name="comments" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Comments</FormLabel>
                                    <FormControl>
                                        <Textarea rows={5} placeholder="Provide detailed feedback..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                            <DialogFooter>
                                <Button type="submit">Submit Review</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    );
}

    