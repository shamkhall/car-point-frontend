"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronDown, ArrowLeft } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { getEvaluations, type EvaluationHistoryItem } from "@/lib/api";
import { cn } from "@/lib/utils";
import Link from "next/link";

const qualityLabels: Record<number, string> = { 0: "Good", 1: "Poor", 2: "Excellent" };
const qualityBadgeColors: Record<number, string> = {
  0: "bg-warning/20 text-warning-foreground",
  1: "bg-destructive/20 text-destructive",
  2: "bg-success/20 text-success",
};

const priceLabels: Record<number, string> = { 0: "Fair Price", 1: "Great Deal", 2: "Overpriced" };
const priceBadgeColors: Record<number, string> = {
  0: "bg-muted text-muted-foreground",
  1: "bg-success/20 text-success",
  2: "bg-destructive/20 text-destructive",
};

export default function HistoryPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [evaluations, setEvaluations] = useState<EvaluationHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    getEvaluations(page)
      .then((res) => {
        setEvaluations((prev) => (page === 1 ? res.data : [...prev, ...res.data]));
        setTotal(res.meta.total);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, page]);

  if (authLoading || !user) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const breakdownLabels = [
    { key: "mileageScore", label: "Mileage", max: 25 },
    { key: "reliabilityScore", label: "Reliability", max: 20 },
    { key: "ageScore", label: "Age", max: 15 },
    { key: "conditionScore", label: "Condition", max: 15 },
    { key: "depreciationScore", label: "Depreciation", max: 10 },
    { key: "transmissionScore", label: "Transmission", max: 5 },
    { key: "driveScore", label: "Drive", max: 5 },
    { key: "engineScore", label: "Engine", max: 5 },
  ] as const;

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="rounded-xl">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Evaluation History</h1>
            <p className="text-sm text-muted-foreground">{total} evaluation{total !== 1 ? "s" : ""}</p>
          </div>
        </div>

        {loading && evaluations.length === 0 ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : evaluations.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-lg mb-2">No evaluations yet</p>
            <p className="text-sm">Go evaluate a car to see it here!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {evaluations.map((item) => {
              const isExpanded = expandedId === item._id;
              const { result, request } = item;

              return (
                <div
                  key={item._id}
                  className="bg-card border border-border rounded-2xl overflow-hidden cursor-pointer transition-colors hover:border-primary/30"
                  onClick={() => setExpandedId(isExpanded ? null : item._id)}
                >
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold capitalize">
                        {request.brand} {request.model}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {request.year} · {request.price.toLocaleString()} AZN ·{" "}
                        {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn("px-2 py-1 rounded-full text-xs font-medium", qualityBadgeColors[result.qualityStatus])}>
                        {result.qualityScore}/100 {qualityLabels[result.qualityStatus]}
                      </span>
                      <span className={cn("px-2 py-1 rounded-full text-xs font-medium", priceBadgeColors[result.price.priceStatus])}>
                        {priceLabels[result.price.priceStatus]}
                      </span>
                      <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", isExpanded && "rotate-180")} />
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-border pt-4 space-y-3">
                      {result.price.average !== null && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Market Average</span>
                          <span className="font-medium">{result.price.average.toLocaleString()} AZN ({result.price.deviation > 0 ? "+" : ""}{result.price.deviation.toFixed(1)}%)</span>
                        </div>
                      )}
                      <div className="space-y-2">
                        {breakdownLabels.map(({ key, label, max }) => (
                          <div key={key} className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">{label}</span>
                              <span>{(result.scoreBreakdown as Record<string, number>)[key]}/{max}</span>
                            </div>
                            <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary rounded-full"
                                style={{ width: `${((result.scoreBreakdown as Record<string, number>)[key] / max) * 100}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {evaluations.length < total && (
              <Button
                variant="outline"
                className="w-full h-12 rounded-xl"
                onClick={(e) => { e.stopPropagation(); setPage((p) => p + 1); }}
                disabled={loading}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Load More
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
