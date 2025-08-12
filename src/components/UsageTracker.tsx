import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Crown, Zap, CheckCircle } from "lucide-react";
import { apiService } from "@/services/api";

interface UsageStatus {
  used: number;
  remaining: number;
  limit: number;
}

interface UpgradeInfo {
  price: string;
  features: string[];
}

interface UsageTrackerProps {
  onUpgradeClick?: () => void;
}

export function UsageTracker({ onUpgradeClick }: UsageTrackerProps) {
  const [usage, setUsage] = useState<UsageStatus | null>(null);
  const [upgrade, setUpgrade] = useState<UpgradeInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUsageStatus = async () => {
    try {
      const data = await apiService.getUsageStatus();

      if (data.success) {
        setUsage(data.usage);
        setUpgrade(data.upgrade);
      }
    } catch (error) {
      console.error("Failed to fetch usage status:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsageStatus();
  }, []);

  if (loading || !usage) {
    return null;
  }

  const usagePercentage = (usage.used / usage.limit) * 100;
  const isLimitReached = usage.remaining === 0;

  return (
    <Card
      className={`p-4 ${
        isLimitReached
          ? "bg-orange-50 border-orange-200"
          : "bg-blue-50 border-blue-200"
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Zap
            className={`w-4 h-4 ${
              isLimitReached ? "text-orange-600" : "text-blue-600"
            }`}
          />
          <span className="text-sm font-medium">
            {isLimitReached ? "Daily Limit Reached" : "Free Usage"}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">
          {usage.used}/{usage.limit} used today
        </span>
      </div>

      <Progress
        value={usagePercentage}
        className={`h-2 mb-3 ${
          isLimitReached ? "[&>div]:bg-orange-500" : "[&>div]:bg-blue-500"
        }`}
      />

      {isLimitReached ? (
        <div className="space-y-3">
          <p className="text-sm text-orange-700">
            You've used all your free analyses for today. Upgrade for unlimited
            access!
          </p>
          {upgrade && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-orange-800">
                  {upgrade.price}
                </span>
                <Button
                  size="sm"
                  className="bg-orange-600 hover:bg-orange-700"
                  onClick={onUpgradeClick}
                >
                  <Crown className="w-3 h-3 mr-1" />
                  Upgrade Now
                </Button>
              </div>
              <div className="text-xs space-y-1">
                {upgrade.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-green-600" />
                    <span className="text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <p className="text-sm text-blue-700">
          {usage.remaining} free{" "}
          {usage.remaining === 1 ? "analysis" : "analyses"} remaining today
        </p>
      )}
    </Card>
  );
}
