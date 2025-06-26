
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function GeneralLedgerPage() {
  return (
    <div className="flex flex-col h-full">
      <Header title="General Ledger" />
      <main className="flex-1 overflow-auto p-4 md:p-6">
        <Card>
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
            <CardDescription>This feature is under active development.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>A full general ledger, including accounts payable and receivable tracking, is currently being built. Please check back later!</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
