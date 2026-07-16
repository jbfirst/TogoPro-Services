import {
  Wrench,
  Zap,
  Scissors,
  ChefHat,
  Car,
  Sparkles,
  HardHat,
  Hammer,
  Shirt,
  Laptop,
  type LucideProps,
} from "lucide-react";

const ICONS: Record<string, React.ComponentType<LucideProps>> = {
  Wrench,
  Zap,
  Scissors,
  ChefHat,
  Car,
  Sparkles,
  HardHat,
  Hammer,
  Shirt,
  Laptop,
};

export function CategoryIcon({ name, ...props }: { name: string } & LucideProps) {
  const Icon = ICONS[name] ?? Wrench;
  return <Icon {...props} />;
}
