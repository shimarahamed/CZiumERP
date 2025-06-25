
'use client'

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { MoreHorizontal, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Header from "@/components/Header";
import { useToast } from "@/hooks/use-toast";
import { useAppContext } from '@/context/AppContext';
import type { Employee } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DatePicker } from '@/components/ui/date-picker';
import { format } from 'date-fns';

const employeeSchema = z.object({
  name: z.string().min(1, "Name is required."),
  email: z.string().email("Invalid email address."),
  jobTitle: z.string().min(1, "Job title is required."),
  department: z.string().min(1, "Department is required."),
  dateOfJoining: z.date({ required_error: "Date of joining is required." }),
  salary: z.coerce.number().min(0, "Salary must be non-negative"),
});

type EmployeeFormData = z.infer<typeof employeeSchema>;

export default function EmployeesPage() {
    const { employees, setEmployees, addActivityLog, user: currentUser, currencySymbol } = useAppContext();
    const { toast } = useToast();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [employeeToEdit, setEmployeeToEdit] = useState<Employee | null>(null);
    const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);

    const form = useForm<EmployeeFormData>({
        resolver: zodResolver(employeeSchema),
    });

    const canManage = currentUser?.role === 'admin' || currentUser?.role === 'manager';

    if (!canManage) {
        return (
            <div className="flex flex-col h-full">
                <Header title="Access Denied" />
                <main className="flex-1 overflow-auto p-4 md:p-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Permission Required</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p>You do not have permission to view or manage employees. Please contact an administrator.</p>
                        </CardContent>
                    </Card>
                </main>
            </div>
        );
    }

    const handleOpenForm = (employee: Employee | null = null) => {
        setEmployeeToEdit(employee);
        if (employee) {
            form.reset({
                ...employee,
                dateOfJoining: new Date(employee.dateOfJoining),
            });
        } else {
            form.reset({
                name: '',
                email: '',
                jobTitle: '',
                department: '',
                dateOfJoining: new Date(),
                salary: 0,
            });
        }
        setIsFormOpen(true);
    };

    const onSubmit = (data: EmployeeFormData) => {
        const employeeData = {
          ...data,
          dateOfJoining: format(data.dateOfJoining, 'yyyy-MM-dd'),
        };

        if (employeeToEdit) {
            const updatedEmployees = employees.map(e => e.id === employeeToEdit.id ? { ...e, ...employeeData } : e);
            setEmployees(updatedEmployees);
            toast({ title: "Employee Updated", description: `${data.name}'s details have been updated.` });
            addActivityLog('Employee Updated', `Updated employee record: ${data.name} (ID: ${employeeToEdit.id})`);
        } else {
            const newEmployee: Employee = {
                id: `emp-${Date.now()}`,
                avatar: `https://placehold.co/40x40`,
                ...employeeData,
            };
            setEmployees([newEmployee, ...employees]);
            toast({ title: "Employee Added", description: `${data.name} has been added.` });
            addActivityLog('Employee Added', `Added new employee record: ${data.name}`);
        }
        setIsFormOpen(false);
        setEmployeeToEdit(null);
    };
    
    const handleDelete = () => {
        if (!employeeToDelete) return;
        addActivityLog('Employee Deleted', `Deleted employee record: ${employeeToDelete.name} (ID: ${employeeToDelete.id})`);
        setEmployees(employees.filter(e => e.id !== employeeToDelete.id));
        toast({ title: "Employee Deleted", description: `${employeeToDelete.name}'s record has been deleted.` });
        setEmployeeToDelete(null);
    };

    return (
        <div className="flex flex-col h-full">
            <Header title="Employee Management" />
            <main className="flex-1 overflow-auto p-4 md:p-6">
                <Card>
                    <CardHeader>
                        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                            <div>
                                <CardTitle>Employees</CardTitle>
                                <CardDescription>Manage all employee information for your organization.</CardDescription>
                            </div>
                            <Button size="sm" className="gap-1 w-full md:w-auto" onClick={() => handleOpenForm()}>
                                <PlusCircle className="h-4 w-4" />
                                Add Employee
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Employee</TableHead>
                                    <TableHead>Job Title</TableHead>
                                    <TableHead className="hidden md:table-cell">Department</TableHead>
                                    <TableHead className="hidden md:table-cell">Date of Joining</TableHead>
                                    <TableHead><span className="sr-only">Actions</span></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {employees.map(employee => (
                                    <TableRow key={employee.id}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-3">
                                                <Avatar>
                                                    <AvatarImage src={employee.avatar} alt={employee.name} data-ai-hint="person user" />
                                                    <AvatarFallback>{employee.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col min-w-0">
                                                   <span className="truncate">{employee.name}</span>
                                                   <span className="text-sm text-muted-foreground truncate">{employee.email}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{employee.jobTitle}</TableCell>
                                        <TableCell className="hidden md:table-cell">{employee.department}</TableCell>
                                        <TableCell className="hidden md:table-cell">{format(new Date(employee.dateOfJoining), 'MMM d, yyyy')}</TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button aria-haspopup="true" size="icon" variant="ghost">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                        <span className="sr-only">Toggle menu</span>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => handleOpenForm(employee)}>Edit</DropdownMenuItem>
                                                    <DropdownMenuItem className="text-destructive" onClick={() => setEmployeeToDelete(employee)}>Delete</DropdownMenuItem>
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
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>{employeeToEdit ? 'Edit Employee' : 'Add New Employee'}</DialogTitle>
                        <DialogDescription>
                            {employeeToEdit ? "Update the employee's HR information." : 'Fill in the details to add a new employee to the organization.'}
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto px-2">
                             <FormField control={form.control} name="name" render={({ field }) => (
                                <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="email" render={({ field }) => (
                                <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField control={form.control} name="jobTitle" render={({ field }) => (
                                    <FormItem><FormLabel>Job Title</FormLabel><FormControl><Input {...field} placeholder="e.g. Store Manager" /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="department" render={({ field }) => (
                                    <FormItem><FormLabel>Department</FormLabel><FormControl><Input {...field} placeholder="e.g. Sales" /></FormControl><FormMessage /></FormItem>
                                )} />
                            </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField control={form.control} name="dateOfJoining" render={({ field }) => (
                                    <FormItem className="flex flex-col pt-2"><FormLabel>Date of Joining</FormLabel><FormControl><DatePicker date={field.value} setDate={field.onChange} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name="salary" render={({ field }) => (
                                    <FormItem><FormLabel>Salary ({currencySymbol})</FormLabel><FormControl><Input type="number" step="100" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                             </div>
                            
                            <DialogFooter>
                                <Button type="submit">{employeeToEdit ? 'Save Changes' : 'Add Employee'}</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!employeeToDelete} onOpenChange={(open) => !open && setEmployeeToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>This action cannot be undone. This will permanently delete the employee record.</AlertDialogDescription>
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
