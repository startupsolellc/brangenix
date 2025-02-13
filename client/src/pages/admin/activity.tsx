import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

interface ActivityLog {
  id: number;
  userId: number;
  action: string;
  metadata: Record<string, any>;
  createdAt: string;
}

export default function ActivityPage() {
  const { data: activities, isLoading } = useQuery<ActivityLog[]>({
    queryKey: ["/api/admin/activity"],
    retry: 1,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/dashboard">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Activity Log</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Activity</CardTitle>
          <CardDescription>
            Recent user actions and system events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {activities?.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-4 pb-4 border-b last:border-0"
              >
                <div className="flex-1">
                  <p className="font-medium">{activity.action}</p>
                  <p className="text-sm text-muted-foreground">
                    User ID: {activity.userId}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(activity.createdAt).toLocaleString()}
                  </p>
                  {activity.metadata && (
                    <pre className="mt-2 p-2 bg-muted rounded-md text-xs">
                      {JSON.stringify(activity.metadata, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
