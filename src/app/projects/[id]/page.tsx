
'use client'

import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import Header from "@/components/Header";
import { useToast } from "@/hooks/use-toast";
import { useAppContext } from '@/context/AppContext';
import type { Task, TaskStatus, TaskPriority } from '@/types';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, User, Users, Calendar, Flag, DollarSign, MoreHorizontal, Briefcase as BriefcaseIcon } from '@/components/icons';
import { format, parseISO } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import GanttChart from '@/components/GanttChart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Task as GanttTask } from 'gantt-task-react';
import { Combobox } from '@/components/ui/combobox';

const taskSchema = z.object({
  title: z.string().min(1, "Task title is required."),
  description: z.string().optional(),
  assigneeId: z.string().min(1, "Please assign this task to someone."),
  dateRange: z.object({
    from: z.date({ required_error: "Start date is required." }),
    to: z.date({ required_error: "End date is required." }),
  }),
  priority: z.enum(['Low', 'Medium', 'High']),
}).refine(data => data.dateRange.to >= data.dateRange.from, {
    message: "End date cannot be before start date.",
    path: ["dateRange"],
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

const priorityVariant: { [key in TaskPriority]: 'default' | 'secondary' | 'destructive' } = {
    'High': 'destructive',
    'Medium': 'default',
    'Low': 'secondary',
};

const defaultTaskValues = {
    title: '',
    description: '',
    assigneeId: '',
    dateRange: { from: new Date(), to: new Date() },
    priority: 'Medium' as TaskPriority,
};

export default function ProjectDetailPage() {
    const { id } = useParams();
    const { projects, tasks, setTasks, employees, addActivityLog, currencySymbol } = useAppContext();
    const { toast } = useToast();
    const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
    const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
    const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

    const project = useMemo(() => projects.find(p => p.id === id), [id, projects]);
    const projectTasks = useMemo(() => tasks.filter(t => t.projectId === id), [id, tasks]);
    const manager = useMemo(() => employees.find(e => e.id === project?.managerId), [project, employees]);
    const teamMembers = useMemo(() => employees.filter(e => project?.teamIds.includes(e.id)), [project, employees]);

    const form = useForm<TaskFormData>({
        resolver: zodResolver(taskSchema),
        defaultValues: defaultTaskValues,
    });
    
    const employeeOptions = useMemo(() => 
        teamMembers.map(e => ({ label: e.name, value: e.id })), 
    [teamMembers]);

    const ganttTasks: GanttTask[] = useMemo(() => {
        return projectTasks
            .filter(task => task.startDate && task.endDate)
            .map(task => {
                let progress = 0;
                if (task.status === 'in-progress') progress = 50;
                else if (task.status === 'done') progress = 100;
                
                return {
                    id: task.id,
                    name: task.title,
                    start: parseISO(task.startDate),
                    end: parseISO(task.endDate),
                    type: 'task',
                    progress: progress,
                    isDisabled: false,
                    project: project?.name,
                    dependencies: [],
                };
            });
    }, [projectTasks, project?.name]);

    if (!project) {
        return (
            <div className="flex flex-col h-full">
                <Header title="Project Not Found" showBackButton />
                <main className="flex-1 p-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Error</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p>The requested project could not be found.</p>
                        </CardContent>
                    </Card>
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

    const handleOpenTaskForm = (task: Task | null) => {
        setTaskToEdit(task);
        if (task) {
            form.reset({
                title: task.title,
                description: task.description || '',
                assigneeId: task.assigneeId,
                dateRange: {
                    from: task.startDate ? parseISO(task.startDate) : new Date(),
                    to: task.endDate ? parseISO(task.endDate) : new Date(),
                },
                priority: task.priority,
            });
        } else {
            form.reset(defaultTaskValues);
        }
        setIsTaskFormOpen(true);
    };

    const onSubmitTask = (data: TaskFormData) => {
        if (taskToEdit) {
            const updatedTasks = tasks.map(t => 
                t.id === taskToEdit.id ? {
                    ...t,
                    ...data,
                    startDate: format(data.dateRange.from, 'yyyy-MM-dd'),
                    endDate: format(data.dateRange.to, 'yyyy-MM-dd'),
                } : t
            );
            setTasks(updatedTasks);
            toast({ title: "Task Updated" });
        } else {
            const newTask: Task = {
                id: `task-${Date.now()}`,
                projectId: project.id,
                status: 'todo',
                title: data.title,
                description: data.description,
                assigneeId: data.assigneeId,
                priority: data.priority,
                startDate: format(data.dateRange.from, 'yyyy-MM-dd'),
                endDate: format(data.dateRange.to, 'yyyy-MM-dd'),
            };
            setTasks(prev => [newTask, ...prev]);
            toast({ title: "Task Added" });
        }
        setIsTaskFormOpen(false);
        setTaskToEdit(null);
    };

    const handleDeleteTask = () => {
        if (!taskToDelete) return;
        setTasks(tasks.filter(t => t.id !== taskToDelete.id));
        toast({ title: "Task Deleted" });
        setTaskToDelete(null);
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
                                <Button size="sm" onClick={() => handleOpenTaskForm(null)}><PlusCircle className="mr-2 h-4 w-4"/> Add Task</Button>
                            </CardHeader>
                            <CardContent>
                                <Tabs defaultValue="list">
                                    <TabsList className="mb-4">
                                        <TabsTrigger value="list">Task List</TabsTrigger>
                                        <TabsTrigger value="gantt">Gantt Chart</TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="list">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Task</TableHead>
                                                    <TableHead>Assignee</TableHead>
                                                    <TableHead>Timeline</TableHead>
                                                    <TableHead>Status</TableHead>
                                                    <TableHead><span className="sr-only">Actions</span></TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {projectTasks.map(task => {
                                                    const assignee = employees.find(e => e.id === task.assigneeId);
                                                    return (
                                                        <TableRow key={task.id}>
                                                            <TableCell className="font-medium">
                                                                <div className="flex flex-col">
                                                                    <span>{task.title}</span>
                                                                    <Badge variant={priorityVariant[task.priority]} className="capitalize w-fit mt-1">{task.priority}</Badge>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>{assignee?.name || 'Unassigned'}</TableCell>
                                                            <TableCell>{task.startDate && task.endDate ? `${format(parseISO(task.startDate), 'MMM d')} - ${format(parseISO(task.endDate), 'MMM d, yyyy')}` : 'N/A'}</TableCell>
                                                            <TableCell>
                                                                <Select value={task.status} onValueChange={(value: TaskStatus) => handleTaskStatusChange(task.id, value)}>
                                                                    <SelectTrigger className="h-8 w-[120px]">
                                                                        <SelectValue />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {Object.entries(statusDisplay).map(([key, value]) => (
                                                                            <SelectItem key={key} value={key as TaskStatus}>{value}</SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            </TableCell>
                                                            <TableCell>
                                                                <DropdownMenu>
                                                                    <DropdownMenuTrigger asChild>
                                                                        <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                                                                    </DropdownMenuTrigger>
                                                                    <DropdownMenuContent align="end">
                                                                        <DropdownMenuItem onClick={() => handleOpenTaskForm(task)}>Edit</DropdownMenuItem>
                                                                        <DropdownMenuItem className="text-destructive" onClick={() => setTaskToDelete(task)}>Delete</DropdownMenuItem>
                                                                    </DropdownMenuContent>
                                                                </DropdownMenu>
                                                            </TableCell>
                                                        </TableRow>
                                                    )
                                                })}
                                            </TableBody>
                                        </Table>
                                    </TabsContent>
                                    <TabsContent value="gantt">
                                        <GanttChart tasks={ganttTasks} />
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="lg:col-span-1 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Project Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-sm">
                                {project.client && <div className="flex items-center gap-2"><BriefcaseIcon className="h-4 w-4 text-muted-foreground" /><span className="font-medium">Client:</span><span>{project.client}</span></div>}
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
                        <DialogTitle>{taskToEdit ? 'Edit Task' : 'Add New Task'}</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmitTask)} className="space-y-4 py-4">
                            <FormField control={form.control} name="title" render={({ field }) => (
                                <FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <FormField control={form.control} name="description" render={({ field }) => (
                                <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                             <FormField control={form.control} name="assigneeId" render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Assign To</FormLabel>
                                    <Combobox
                                        options={employeeOptions}
                                        value={field.value}
                                        onValueChange={field.onChange}
                                        placeholder="Select a team member..."
                                        searchPlaceholder="Search team..."
                                        emptyText="No team member found."
                                    />
                                    <FormMessage />
                                </FormItem>
                            )}/>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                               <FormField control={form.control} name="dateRange" render={({ field }) => (
                                    <FormItem className="flex flex-col pt-2"><FormLabel>Task Timeline</FormLabel><FormControl><DateRangePicker date={field.value} setDate={field.onChange} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name="priority" render={({ field }) => (
                                    <FormItem><FormLabel>Priority</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                                            <SelectContent>
                                                <SelectItem value="Low">Low</SelectItem>
                                                <SelectItem value="Medium">Medium</SelectItem>
                                                <SelectItem value="High">High</SelectItem>
                                            </SelectContent>
                                        </Select><FormMessage />
                                    </FormItem>
                                )}/>
                            </div>
                            <DialogFooter>
                                <Button type="submit">{taskToEdit ? 'Save Changes' : 'Add Task'}</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!taskToDelete} onOpenChange={(open) => !open && setTaskToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>This action cannot be undone. This will permanently delete the task "{taskToDelete?.title}".</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteTask} className="bg-destructive hover:bg-destructive/90">Delete Task</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
