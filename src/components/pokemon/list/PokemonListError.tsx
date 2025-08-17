import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ErrorSeverity = "info" | "warning" | "error" | "critical";

export function PokemonListError({
  message,
  severity,
}: {
  message: string;
  severity: ErrorSeverity;
}) {
  const errorStyles: Record<ErrorSeverity, string> = {
    info: "from-blue-500 to-blue-600",
    warning: "from-yellow-500 to-yellow-600",
    error: "from-red-500 to-red-600",
    critical: "from-red-600 to-red-800",
  };

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <Card className="border-destructive/50 bg-destructive/5">
        <CardHeader>
          <CardTitle
            className={cn(
              "text-center bg-gradient-to-r bg-clip-text text-transparent",
              errorStyles[severity],
            )}
          >
            오류가 발생했습니다
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">{message}</p>
        </CardContent>
      </Card>
    </div>
  );
}
