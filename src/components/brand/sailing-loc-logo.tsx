import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

/**
 * Intrinsic size of the trimmed wordmark. `next/image` needs it for the aspect
 * ratio; the height class on the element is what actually sizes it.
 */
const WORDMARK_WIDTH = 447;
const WORDMARK_HEIGHT = 118;

type SailingLocLogoProps = {
  className?: string;
  /**
   * Surface the logo sits on — `light` means light-on-dark. The brand exists in
   * navy and coral only, so a dark surface gets the variant whose navy ink has
   * been repainted white by `npm run build:brand`. The coral sail is identical
   * in both, and no CSS filter is involved.
   */
  variant?: "light" | "dark";
};

export function SailingLocLogo({
  className,
  variant = "dark",
}: SailingLocLogoProps) {
  const t = useTranslations("Common");

  return (
    <Link
      className={cn(
        "inline-flex shrink-0 items-center rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D68A6E] focus-visible:ring-offset-2",
        className,
      )}
      href="/"
    >
      <Image
        //? The wordmark spells the brand name, so the accessible name is the
        //? brand name — not a description of the drawing.
        alt={t("brand_name")}
        className="h-8 w-auto sm:h-9"
        height={WORDMARK_HEIGHT}
        priority
        //? Height-constrained, so the rendered width is ~121-136px. Without
        //? this the optimizer would serve a 1080px candidate for a 36px-tall
        //? logo on every page.
        sizes="136px"
        src={
          variant === "light"
            ? "/images/brand/logo-wordmark-light.png"
            : "/images/brand/logo-wordmark.png"
        }
        width={WORDMARK_WIDTH}
      />
    </Link>
  );
}
