
'use client'

import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DatePicker } from '@/components/ui/date-picker';
import Header from "@/components/Header";
import { useToast } from "@/hooks/use-toast";
import { useAppContext } from '@/context/AppContext';
import type { Task, TaskStatus } from '@/types';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, User, Users, Calendar, Flag, DollarSign } from '@/components/icons';
import { format, parseISO } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const taskSchema = z.object({
  title: z.string().min(1, "Task title is required."),
  description: z.string().optional(),
  assigneeId: z.string().min(1, "Please assign this task to someone."),
  dueDate: z.date({ required_error: "Due date is required." }),
});

type TaskFormData = z.infer<typeof taskSchema>;

const statusVariant: { [key in TaskStatus]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
  'in-progress': 'default',
  'done': 'outline',
  'todo': 'secondary',
};

const statusDisplay: { [key in TaskStatus]: string } = {
  'in-progress': 'In Progress',
  'done': 'Done',
  'todo': 'To Do',
};

export default function ProjectDetailPage() {
    const { id } = useParams();
    const { projects, tasks, setTasks, employees, addActivityLog, currencySymbol } = useAppContext();
    const { toast } = useToast();
    const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);

    const project = useMemo(() => projects.find(p => p.id === id), [id, projects]);
    const projectTasks = useMemo(() => tasks.filter(t => t.projectId === id), [id, tasks]);
    const manager = useMemo(() => employees.find(e => e.id === project?.managerId), [project, employees]);
    const teamMembers = useMemo(() => employees.filter(e => project?.teamIds.includes(e.id)), [project, employees]);

    const form = useForm<TaskFormData>({
        resolver: zodResolver(taskSchema),
    });

    if (!project) {
        return (
            <div className="flex flex-col h-full">
                <Header title="Project Not Found" showBackButton />
                <main className="flex-1 p-6"><Card><CardHeader><CardTitle>Error</CardTitle><CardContent><p>The requested project could not be found.</p></CardContent></CardHeader></Card>
                </main>
            </div>
        );
    }
    
    const handleTaskStatusChange = (taskId: string, newStatus: TaskStatus) => {
        setTasks(currentTasks => currentTasks.map(task => 
            task.id === taskId ? { ...task, status: newStatus } : task
        ));
        const task = tasks.find(t => t.id === taskId);
        addActivityLog('Task Status Updated', `Task "${task?.title}" in project "${project.name}" set to ${newStatus}.`);
    };

    const onSubmitTask = (data: TaskFormData) => {
        const newTask: Task = {
            id: `task-${Date.now()}`,
            projectId: project.id,
            status: 'todo',
            ...data,
            dueDate: format(data.dueDate, 'yyyy-MM-dd'),
        };
        setTasks(prev => [newTask, ...prev]);
        toast({ title: "Task Added" });
        addActivityLog('Task Added', `Added task "${data.title}" to project "${project.name}".`);
        setIsTaskFormOpen(false);
        form.reset();
    };

    return (
        <div className="flex flex-col h-full">
            <Header title={project.name} showBackButton />
            <main className="flex-1 overflow-auto p-4 md:p-6">
                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader className="flex flex-row justify-between items-start">
                                <div>
                                <CardTitle>Tasks</CardTitle>
                                <CardDescription>All tasks associated with this project.</CardDescription>
                                </div>
                                <Button size="sm" onClick={() => setIsTaskFormOpen(true)}><PlusCircle className="mr-2 h-4 w-4"/> Add Task</Button>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Task</TableHead>
                                            <TableHead>Assignee</TableHead>
                                            <TableHead>Due Date</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {projectTasks.map(task => {
                                            const assignee = employees.find(e => e.id === task.assigneeId);
                                            return (
                                                <TableRow key={task.id}>
                                                    <TableCell className="font-medium">{task.title}</TableCell>
                                                    <TableCell>{assignee?.name || 'Unassigned'}</TableCell>
                                                    <TableCell>{format(parseISO(task.dueDate), 'PPP')}</TableCell>
                                                    <TableCell>
                                                        <Select value={task.status} onValueChange={(value: TaskStatus) => handleTaskStatusChange(task.id, value)}>
                                                            <SelectTrigger className="h-8 w-[120px]">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {Object.entries(statusDisplay).map(([key, value]) => (
                                                                    <SelectItem key={key} value={key}>{value}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="lg:col-span-1 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Project Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-sm">
                                <div className="flex items-center gap-2"><DollarSign className="h-4 w-4 text-muted-foreground" /><span className="font-medium">Budget:</span><span>{currencySymbol}{project.budget.toLocaleString()}</span></div>
                                <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-muted-foreground" /><span className="font-medium">Timeline:</span><span>{format(parseISO(project.startDate), 'MMM d, yyyy')} - {format(parseISO(project.endDate), 'MMM d, yyyy')}</span></div>
                                <div className="flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground" /><span className="font-medium">Manager:</span><span>{manager?.name}</span></div>
                                <div className="mt-4">
                                    <h4 className="font-medium mb-2 flex items-center gap-2"><Users className="h-4 w-4 text-muted-foreground"/>Team</h4>
                                    <div className="space-y-2">
                                        {teamMembers.map(member => (
                                            <div key={member.id} className="flex items-center gap-2">
                                                <Avatar className="h-6 w-6"><AvatarImage src={member.avatar} /><AvatarFallback>{member.name.charAt(0)}</AvatarFallback></Avatar>
                                                <span>{member.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>

            <Dialog open={isTaskFormOpen} onOpenChange={setIsTaskFormOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Task</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmitTask)} className="space-y-4 py-4">
                            <FormField control={form.control} name="title" render={({ field }) => (
                                <FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <FormField control={form.control} name="description" render={({ field }) => (
                                <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <div className="grid grid-cols-2 gap-4">
                                 <FormField control={form.control} name="assigneeId" render={({ field }) => (
                                    <FormItem><FormLabel>Assign To</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a user"/></SelectTrigger></FormControl>
                                            <SelectContent>{teamMembers.map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent>
                                        </Select><FormMessage />
                                    </FormItem>
                                )}/>
                                 <FormField control={form.control} name="dueDate" render={({ field }) => (
                                    <FormItem><FormLabel>Due Date</FormLabel><FormControl><DatePicker date={field.value} setDate={field.onChange} /></FormControl><FormMessage /></FormItem>
                                )}/>
                            </div>
                            <DialogFooter>
                                <Button type="submit">Add Task</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
