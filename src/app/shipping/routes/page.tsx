import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function RoutePlanningPage() {
  return (
    <div className="flex flex-col h-full">
      <Header title="Route Planning" />
      <main className="flex-1 overflow-auto p-4 md:p-6">
        <Card>
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
            <CardDescription>This feature is under active development.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Advanced route planning and optimization features are being developed. Soon, you will be able to generate efficient delivery routes for multiple shipments.</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
