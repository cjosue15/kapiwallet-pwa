# Agent Guidelines for KapiWallet PWA

## Project Overview
KapiWallet is a personal finance tracking PWA built with React 19, TypeScript, Vite, and Supabase. It features transaction management, monthly overviews, insights/charts, and category tracking.

## Build/Lint/Test Commands

```bash
# Install dependencies (uses pnpm)
pnpm install

# Development server with HMR
pnpm dev

# Production build (TypeScript check + Vite build)
pnpm build

# Lint with ESLint
pnpm lint

# Preview production build locally
pnpm preview
```

**Running a single test:** No test framework is currently configured. If adding tests, use Vitest (already available as a peer dependency of Vite plugins).

## Code Style Guidelines

### TypeScript Configuration
- **Strict mode enabled** (`tsconfig.app.json:20`)
- `verbatimModuleSyntax: true` - use `import type` for type-only imports
- No unused locals or parameters allowed
- Target: ES2022 for app, ES2023 for node

### Imports
```typescript
// External imports first, then internal
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTransactions } from '../context/TransactionsContext';
import { fetchTransactionsByDateRange, type TransactionSummaryRecord } from '../lib/queries/transaction';

// Type-only imports use 'type' keyword
import type { PostgrestError } from '@supabase/supabase-js';
```

### Naming Conventions
- **Components**: PascalCase named exports (`export function TotalBalanceCard`)
- **Hooks**: camelCase with `use` prefix (`export function useMonthlyOverview`)
- **Interfaces/Types**: PascalCase, no "I" prefix
- **Variables/Functions**: camelCase
- **Constants**: camelCase or UPPER_SNAKE_CASE for true constants
- **Files**: kebab-case (`transaction-modal.tsx`, `use-monthly-overview.ts`)

### Component Structure
```typescript
interface ComponentNameProps {
  propA: string;
  loading: boolean;
}

export function ComponentName({ propA, loading }: ComponentNameProps) {
  // Hooks first (useMemo/useCallback for optimization)
  const computedValue = useMemo(() => { ... }, [dep]);
  
  // Render
  return (
    <div className="...">
      ...
    </div>
  );
}
```

### Context Pattern
```typescript
interface ContextValue {
  // typed interface
}

const Context = createContext<ContextValue | null>(null);

function useProvideContext(): ContextValue {
  // implementation with useState, useCallback, etc.
  return useMemo(() => ({ ... }), [...deps]);
}

export function ContextProvider({ children }: { children: ReactNode }) {
  const value = useProvideContext();
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useContext() {
  const context = useContext(Context);
  if (!context) {
    throw new Error('useContext must be used within a ContextProvider');
  }
  return context;
}
```

### Query/Database Pattern
Query functions return Supabase-style `{ data, error }`:
```typescript
export async function fetchTransactionsQuery() {
  const { data, error } = await supabase.from('transactions').select('...');
  return { data: data ?? [], error };
}
```

### Error Handling
- Use `console.error` for logging actual errors
- Display user-facing errors in Spanish (project language)
- Pattern: set loading state, perform operation, handle error, clear loading
```typescript
const [error, setError] = useState<string | null>(null);

const fetchData = useCallback(async () => {
  setLoading(true);
  setError(null);
  const { data, error } = await someQuery();
  if (error) {
    console.error('Error fetching data', error);
    setError('No se pudo cargar los datos.');
  }
  setLoading(false);
}, []);
```

### Tailwind CSS v4 Conventions
- Use `@theme` variables defined in `src/index.css` for brand colors
- Brand colors: `text-brand-text`, `bg-brand-background`, `bg-brand-card`, `text-brand-primary`
- Utility classes follow standard Tailwind pattern
- Custom styles in `src/index.css` for complex components (e.g., react-day-picker overrides)

### Styling Patterns
```typescript
// Inline styles for dynamic values
const dynamicColor = isPositive ? '#B4DE00' : '#E45865';

// Tailwind for static/complex classes
<div className="flex items-center p-4 rounded-[16px]" />
```

### File Organization
```
src/
├── components/      # Reusable UI components
├── context/        # React context providers
├── hooks/          # Custom React hooks
├── lib/
│   ├── queries/    # Database/query functions
│   └── supabase.ts # Supabase client
├── pages/          # Page-level components
├── App.tsx         # Root component
├── main.tsx        # Entry point
└── index.css      # Global styles + Tailwind
```

### React 19 Patterns
- Use `useCallback` and `useMemo` for performance optimization
- State initializer functions for complex initial state
- Return objects from hooks for related state
```typescript
const [totals, setTotals] = useState<MonthlyOverviewTotals>(() => ({
  totalIncome: 0,
  totalExpense: 0,
  balance: 0
}));
```

### Key Libraries
- **Routing**: react-router-dom v7
- **Icons**: lucide-react
- **Charts**: recharts
- **Date handling**: date-fns
- **Date picker**: react-day-picker
- **Backend**: @supabase/supabase-js
- **Styling**: Tailwind CSS v4 with @tailwindcss/vite plugin

### Environment Variables
- Prefix: `VITE_` (e.g., `VITE_SUPABASE_URL`)
- Required: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- Throw clear error if missing at startup (`src/lib/supabase.ts:6-9`)

## Design Guidelines (from frontend-design skill)
When building UI components:
- Dark theme with brand accent `#B4DE00` (lime green)
- Use JetBrains Mono for monospace/numeric displays
- Deep dark backgrounds (`#1A1B1B`, `#262727`)
- Rounded corners (12-16px radius typical)
- Subtle shadows with brand color tint
- Consistent 12px/13px font sizes for secondary text
