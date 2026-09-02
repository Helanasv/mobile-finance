import {
  ArrowDownLeft,
  Briefcase,
  Bus,
  Clapperboard,
  Coffee,
  HeartPulse,
  Home,
  MoreHorizontal,
  PlusCircle,
  Repeat,
  ShoppingBag,
  ShoppingCart,
  Wallet,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  wallet: Wallet,
  briefcase: Briefcase,
  "arrow-down-left": ArrowDownLeft,
  "plus-circle": PlusCircle,
  "shopping-cart": ShoppingCart,
  coffee: Coffee,
  bus: Bus,
  home: Home,
  "heart-pulse": HeartPulse,
  "shopping-bag": ShoppingBag,
  repeat: Repeat,
  clapperboard: Clapperboard,
  "more-horizontal": MoreHorizontal,
};

export function CategoryIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const Icon = ICONS[name] ?? MoreHorizontal;
  return <Icon className={className} />;
}
