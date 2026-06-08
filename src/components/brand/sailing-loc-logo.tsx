import { Anchor } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type SailingLocLogoProps = {
  className?: string;
  variant?: "light" | "dark";
};

export function SailingLocLogo({
  className,
  variant = "dark",
}: SailingLocLogoProps) {
  const t = useTranslations("Common");

  return (
    <Link
      className={cn("flex items-center gap-2.5", className)}
      href="/"
    >
      <span
        className={cn(
          "flex size-9 items-center justify-center rounded-full text-white",
          variant === "light" ? "bg-white/15" : "bg-[#1a2b48]",
        )}
      >
        <Anchor aria-hidden className="size-4" />
      </span>
      <span
        className={cn(
          "text-lg font-semibold tracking-tight",
          variant === "light" ? "text-white" : "text-[#1a2b48]",
        )}
      >
        {t("brand_name")}
      </span>
    </Link>
  );
}
