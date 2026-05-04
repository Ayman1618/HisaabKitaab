// Per-category colour, gradient, icon, and label tokens
export const CategoryMeta: Record<
  string,
  { label: string; icon: string; color: string; bg: string; gradient: [string, string] }
> = {
  FOOD: {
    label: 'Food & Dining',
    icon: 'restaurant',
    color: '#FF6B6B',
    bg: 'rgba(255, 107, 107, 0.12)',
    gradient: ['#FF6B6B', '#FF8E53'],
  },
  TRAVEL: {
    label: 'Travel',
    icon: 'car-sport',
    color: '#4ECDC4',
    bg: 'rgba(78, 205, 196, 0.12)',
    gradient: ['#4ECDC4', '#45B7D1'],
  },
  SHOPPING: {
    label: 'Shopping',
    icon: 'bag-handle',
    color: '#A78BFA',
    bg: 'rgba(167, 139, 250, 0.12)',
    gradient: ['#A78BFA', '#7C3AED'],
  },
  BILLS: {
    label: 'Bills & Utilities',
    icon: 'receipt',
    color: '#F59E0B',
    bg: 'rgba(245, 158, 11, 0.12)',
    gradient: ['#F59E0B', '#EF4444'],
  },
  ENTERTAINMENT: {
    label: 'Entertainment',
    icon: 'film',
    color: '#EC4899',
    bg: 'rgba(236, 72, 153, 0.12)',
    gradient: ['#EC4899', '#8B5CF6'],
  },
  SALARY: {
    label: 'Salary',
    icon: 'briefcase',
    color: '#1FD88F',
    bg: 'rgba(31, 216, 143, 0.12)',
    gradient: ['#1FD88F', '#059669'],
  },
  OTHER: {
    label: 'Other',
    icon: 'ellipse',
    color: '#6B7280',
    bg: 'rgba(107, 114, 128, 0.12)',
    gradient: ['#6B7280', '#4B5563'],
  },
};

export const getCategoryMeta = (category: string) =>
  CategoryMeta[category] ?? CategoryMeta.OTHER;
