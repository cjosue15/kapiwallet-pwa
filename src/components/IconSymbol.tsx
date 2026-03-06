import {
  Home,
  BarChart3,
  Clock,
  Grid3X3,
  ChevronRight,
  ChevronLeft,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Calendar,
  Search,
  Plus,
  X,
  Check,
  Menu,
  LayoutGrid,
  Trash2,
  Pencil,
  MoreHorizontal,
  MoreVertical,
  Wallet,
  CreditCard,
  Banknote,
  HelpCircle,
  type LucideIcon
} from 'lucide-react';

interface IconSymbolProps {
  size?: number;
  name: string;
  color?: string;
  className?: string;
}

export function IconSymbol({ size = 24, name, color = '#fff', className = '' }: IconSymbolProps) {
  const iconMap: Record<string, LucideIcon> = {
    'house.fill': Home,
    'chart.bar.fill': BarChart3,
    'clock.fill': Clock,
    'square.grid.2x2': Grid3X3,
    'chevron.right': ChevronRight,
    'chevron.forward': ChevronRight,
    'arrow-back': ChevronLeft,
    'arrow-up': ArrowUp,
    'arrow-down': ArrowDown,
    'refresh': RefreshCw,
    'refresh-outline': RefreshCw,
    'calendar': Calendar,
    'calendar-outline': Calendar,
    'search': Search,
    'add': Plus,
    'close': X,
    'checkmark': Check,
    'menu': Menu,
    'apps': LayoutGrid,
    'trash': Trash2,
    'create': Pencil,
    'ellipsis-horizontal': MoreHorizontal,
    'ellipsis-vertical': MoreVertical,
    'wallet': Wallet,
    'card': CreditCard,
    'cash': Banknote,
    'wallet-outline': Wallet,
  };

  const IconComponent = iconMap[name];

  if (!IconComponent) {
    console.warn(`Icon "${name}" not found, using default`);
    return <HelpCircle size={size} color={color} className={className} />;
  }

  return <IconComponent size={size} color={color} className={className} />;
}
