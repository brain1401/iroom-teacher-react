import { Button } from "@/components/ui/button";

import { PrinterIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function PrintButton(
  props: React.ComponentProps<"button"> & { children?: React.ReactNode },
) {
  return (
    <Button
      variant="outline"
      size="sm"
      className={cn(
        "text-xs px-2 py-1 bg-blue-500 text-white",
        props.className,
      )}
      {...props}
    >
      {props.children}
      <PrinterIcon className="w-4 h-4" />
    </Button>
  );
}
