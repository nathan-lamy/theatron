import { cn } from "@/lib/utils";

const Skeleton = ({ className, ...props }: { className: string }) => {
  return (
    <div
      className={cn("bg-gray-300 animate-pulse rounded", className)}
      {...props}
    />
  );
};
Skeleton.displayName = "Skeleton";

export { Skeleton };
