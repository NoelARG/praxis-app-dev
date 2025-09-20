# Page Layout System Reference

## Quick Commands
- **"Format this page according to the narrower page layout template"** = Use `PageShell` with `variant="narrow"` (max-w-3xl)
- **"Format this page according to the wider page layout template"** = Use `PageShell` with `variant="wide"` (max-w-6xl)

## Components Available

### PageShell
```tsx
import { PageShell } from '@/components/layout/PageShell';

<PageShell
  variant="narrow" | "wide"  // narrow = Daily Ledger style, wide = Heroes style
  title="Page Title"
  subtitle="Optional subtitle"
  subtitleIcon={SomeIcon}    // Optional Lucide icon
  headerRight={<div>...</div>} // Optional right-aligned content
  plainTitle={false}         // Optional: solid text instead of gradient
>
  {/* Page content */}
</PageShell>
```

### SectionHeader
```tsx
import { SectionHeader } from '@/components/layout/SectionHeader';

<SectionHeader icon={SomeIcon}>Section Title</SectionHeader>
```

## Layout Variants

### Narrow (Daily Ledger baseline)
- **Max width**: max-w-3xl
- **Use for**: Forms, single-column content, detailed views
- **Examples**: Daily Ledger, Today page, Settings pages

### Wide (Heroes baseline)  
- **Max width**: max-w-6xl
- **Use for**: Grids, multi-column content, dashboards
- **Examples**: Heroes page, Dashboard, Gallery views

## Standard Structure
```tsx
<PageShell variant="narrow" title="Page Title" subtitle="Subtitle" subtitleIcon={Icon}>
  <div className="space-y-12">
    <div>
      <SectionHeader icon={Icon}>Section Title</SectionHeader>
      {/* Section content */}
    </div>
    
    <div>
      <SectionHeader icon={Icon}>Another Section</SectionHeader>
      {/* More content */}
    </div>
  </div>
</PageShell>
```

## Key Features
- ✅ Consistent title/subtitle alignment across all pages
- ✅ Invisible spacer maintains alignment for future "Next" affordances
- ✅ Semantic theming (bg-background, text-foreground, etc.)
- ✅ Responsive padding (px-4 sm, px-8 md+)
- ✅ Section headers with icon squares and rule lines

