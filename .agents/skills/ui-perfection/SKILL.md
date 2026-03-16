---
name: ui-perfection
description: Guidelines and standards for achieving visual excellence and consistency in the UI.
---

# UI Perfection Skill

This skill provides a set of standards and checklists to ensure that every UI change in the project meets the highest quality of visual design, consistency, and premium aesthetics.

## 🎨 Design System Fundamentals

### **Color System (OKLCH)**
- **Standard**: We use the OKLCH color space for all colors to ensure perceptual uniformity and modern aesthetics.
- **Usage**: Always use CSS variables (e.g., `var(--primary)`, `var(--background)`).
- **Standard Tokens**: 
  - `primary`: The brand accent.
  - `layout`: Base background for the main content area (`oklch(0.9850 0 0)`).
  - `border`: Standard border color (`oklch(0.9280 0.0060 264.5310)`).

### **Typography**
- **Sans-serif**: `Inter` is the primary font for all UI elements.
- **Monospace**: `DM Mono` for code, IDs, or technical data.
- **Hierarchy**: Use `leading-none` for titles and standard `leading-snug` or `leading-normal` for descriptions.

### **Spacing & Grid**
- **8px Grid**: All margins, paddings, and gaps must be multiples of 4px or 8px.
- **Standard Gaps**:
  - Main section gap: `32px` (`calc(var(--spacing) * 8)`).
  - Internal component gap: `16px` (`gap-4`).
  - Small item gap: `6px` (`gap-1.5`).
- **Standard Layout Padding**: `p-4 md:p-6 lg:p-6` for page content.

## ✨ Premium Aesthetic Patterns

- **Glassmorphism**: Use `backdrop-blur-sm` with semi-transparent backgrounds (e.g., `bg-layout/80`) for sticky headers and overlays.
- **Depth**: Use custom shadows like `shadow-sm` or `shadow-md` (defined via HSL in `globals.css`) for cards and popovers.
- **Rounding**: 
  - Main containers/headers: `rounded-t-xl`.
  - Cards: `rounded-xl`.
  - Buttons/Inputs/Sidebar items: `rounded-md` or `rounded-lg`.

## 🧱 Component & Navigation Patterns

### **Page Structure**
- **Layout**: Always wrap content in `DashboardLayout`, which provides the sticky header and scrollable area.
- **Header**: Use `PageHeader` with `title`, `description`, and `customActions`.
- **Wrapper**: Wrap page content in `PageWrapper` to handle standard padding and loading states.
- **Logo**: Standard logo usage is `<img src="/Logo.svg" className="ml-1 py-2 w-25 h-auto" />`.

### **Navigation & Sidebar**
- **External Links**: Mark external navigation items with `external: true` to handle them correctly in `nav-main/secondary`.
- **Badges**: Use the `badge` property in navigation data to highlight new features (e.g., `badge: "New"`).
- **Secondary Actions**: Place settings, billing, and developer hub items in `navSecondary` at the bottom of the sidebar.


### **Data Display**
- **DataTable**: Use the project's custom `DataTable` components for all lists.
- **Status Badges**: Use specific color-coded badges for statuses:
  - **Draft/Scheduled**: Gray (`bg-gray-100 text-gray-700`).
  - **Running**: Blue (`bg-blue-100 text-blue-700`).
  - **Active/Sent**: Green (`bg-green-100 text-green-700`).
  - **In Progress**: Blue/Indigo.
- **Iconography**: 
  - **Phosphor React**: Preferred for channel icons (SMS, Email, WhatsApp) with `weight="fill"`.
  - **Lucide**: Preferred for UI actions (Plus, Eye, Edit, Trash2, MoreHorizontal).

## 🎬 Animation Standards

- **Centralized Transitions**: **STRICT RULE**: Always import from `@/lib/transitions`.
- **Eases**: Use `smoothTransition` (`[0.25, 0.1, 0.25, 1]`) for high-impact transitions.
- **Page Transitions**: Use `pageVariants` with `initial="initial" animate="animate" exit="exit"`.
- **Staggering**: Use `staggerVariants` (0.1s delay) for lists and grids.

## 🏆 Role Model: Tables (from Campaigns Page)

Follow the `CampaignsPage` implementation for all list-heavy interfaces:

### **1. Architecture**
- **Component**: Use the custom `DataTable` found in `@/components/ui/data-table`.
- **Search**: Implement `searchConfig` with `placeholder` and `searchColumns`.
- **Views**: Use `views` prop to provide quick-filter tabs (e.g., "All", "Draft", "Sent").
- **Bulk Actions**: Use `DataTableSelectionHeader` to show "Delete" or "Duplicate" actions when rows are selected.

### **2. Row Implementation**
- **Interactions**: 
  - Entire row must be clickable (`navigate` on `onClick`).
  - Use `group hover:bg-muted/50 transition-colors` on `DataTableRow`.
- **Cells**:
  - Use `Highlight` for text that matches search queries.
  - Statuses must use standard `Badge` variants with explicit project colors (green for Active, blue for Running, gray for Draft).
  - Actions must be in a right-aligned `DropdownMenu` with a `MoreHorizontal` trigger (size: `h-8 w-8 p-0`).

## 🏆 Role Model: Cards (from Home Page)

Use these three specific patterns for card-based UI:

### **1. Metric Cards (SectionCards)**
- **Design**: Minimalist summary for KPIs.
- **Structure**: 
  - `CardDescription` at the top (gray).
  - `CardTitle` with `text-xl font-semibold tabular-nums`.
  - `Badge` (ml-auto) containing a trend icon (`TrendingUp/Down`) and percentage.
- **Implementation**: Wrap in `@container/card` for relative scaling.

### **2. Featured Content (FeaturedContentCard)**
- **Design**: High-impact "Discovery" cards or carousels.
- **Structure**: 
  - **Visual Area**: Top div with subtle background (e.g., `bg-blue-50/20`) and large centered icon.
  - **Content Area**: Metadata badge (e.g., "New"), bold `h3` title, and relaxed `p` for description.
  - **Footer**: `Button` (variant="outline") for primary CTA and optional pagination arrows.

### **3. Navigation Cards (ProductList)**
- **Design**: Clean entry points for different modules.
- **Structure**:
  - Small icon container (e.g., `rounded-md bg-orange-500`) with high-contrast icon.
  - Two-line text block: Bold title (`text-sm`) + secondary description (`text-xs`).
- **Interaction**: `hover:shadow-md transition-shadow`.

## ✅ Perfection Checklist

Before marking a UI task as complete, verify the following:
- [ ] **Role Models**: If it's a table, does it follow the Campaigns page? If it's a card, does it match one of the Home page patterns?
- [ ] **OKLCH Colors**: Are you using CSS variables only?
- [ ] **Grid Alignment**: Are all gaps and paddings multiples of 8px (where possible)?
- [ ] **Premium Feel**: Did you use `backdrop-blur` for sticky elements and `rounded-xl` for cards?
- [ ] **Icon Consistency**: Did you use Phosphor for channels and Lucide for actions?
- [ ] **Centralized Animations**: Are all animations imported from `@/lib/transitions`?
- [ ] **Loading States**: Are `PageWrapper` or `CardSkeleton` used for loading?
- [ ] **Responsiveness**: Checked on `md` and `sm` breakpoints?


