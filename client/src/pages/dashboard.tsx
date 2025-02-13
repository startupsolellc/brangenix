import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { BrandCard } from "@/components/results/brand-card";
import { useToast } from "@/hooks/use-toast";
import { History } from "lucide-react";

export default function Dashboard() {
  const { toast } = useToast();
  const { data: brandHistory, isLoading } = useQuery({
    queryKey: ["/api/brand-names"],
    queryFn: async () => {
      const response = await fetch("/api/brand-names");
      if (!response.ok) {
        throw new Error("Failed to fetch brand history");
      }
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-center title">Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Stats Card */}
          <Card>
            <CardHeader>
              <CardTitle>Total Generations</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{brandHistory?.length || 0}</p>
            </CardContent>
          </Card>

          {/* Recent Activity Card */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {brandHistory?.slice(0, 3).map((history: any, index: number) => (
                  <div key={index} className="flex items-center gap-4">
                    <History className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Generated {history.generatedNames.length} names for category:{" "}
                        <span className="font-medium text-foreground">
                          {history.category}
                        </span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Keywords: {history.keywords.join(", ")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* History Section */}
        <section>
          <h2 className="text-2xl font-semibold mb-6">Generation History</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {brandHistory?.map((history: any, index: number) => (
              <div key={index} className="space-y-4">
                <Card className="p-4">
                  <p className="font-medium">Category: {history.category}</p>
                  <p className="text-sm text-muted-foreground">
                    Keywords: {history.keywords.join(", ")}
                  </p>
                </Card>
                {history.generatedNames.slice(0, 1).map((name: string, nameIndex: number) => (
                  <BrandCard key={nameIndex} name={name} />
                ))}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
