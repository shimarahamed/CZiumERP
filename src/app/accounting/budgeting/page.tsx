
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function BudgetingPage() {
  return (
    <div className="flex flex-col h-full">
      <Header title="Budgeting & Reporting" />
      <main className="flex-1 overflow-auto p-4 md:p-6">
        <Card>
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
            <CardDescription>This feature is under active development.</CardDescription>
          </Header>
          <CardContent>
            <p>The budgeting and advanced financial reporting module is currently being built. This will allow you to set financial targets and track your performance against them. Please check back later!</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
