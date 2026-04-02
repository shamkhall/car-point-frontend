import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  withLink?: boolean;
}

export function Logo({ className, withLink = true }: LogoProps) {
  const content = (
    <div className={cn("flex items-baseline font-extrabold tracking-tighter text-xl", className)}>
      <span>Kapot</span>
      <span className="text-primary w-1.5 h-1.5 ml-[1px] bg-foreground rounded-full inline-block" />
    </div>
  );

  if (withLink) {
    return (
      <Link href="/" className="hover:opacity-80 transition-opacity">
        {content}
      </Link>
    );
  }

  return content;
}
