# Advanced Custom UI Components - Documentation

## Overview
All UI components have been completely redesigned with advanced custom implementations, removing all Radix UI and shadcn dependencies. Each component features modern animations, glassmorphism effects, and micro-interactions.

---

## 🎨 Components

### 1. **Button Component** (`button.tsx`)

#### Features:
- **Ripple Effect** - Material Design-style ripple on click
- **6 Variants**: primary, secondary, ghost, destructive, outline, gradient
- **5 Sizes**: xs, sm, md, lg, xl, icon
- **Loading State** - Animated spinner
- **Icon Support** - Left/right icon positioning
- **Framer Motion** - Scale and press animations
- **Advanced shadows** with colored glows

#### Usage:
```tsx
import { Button } from '@/components/ui/button';

// Primary with ripple
<Button variant="primary" withRipple>Click Me</Button>

// Gradient variant
<Button variant="gradient" size="lg">Get Started</Button>

// With icon
<Button icon={<Icon />} iconPosition="left" isLoading>Loading</Button>

// Full width
<Button fullWidth variant="outline">Full Width Button</Button>
```

#### Variants:
- `primary` - Blue gradient with shadow glow
- `secondary` - White with glassmorphism
- `ghost` - Transparent with hover effect
- `destructive` - Red gradient with shadow glow
- `outline` - Border with hover fill
- `gradient` - Multi-color gradient (blue → purple → pink)

---

### 2. **Input Component** (`input.tsx`)

#### Features:
- **Floating Labels** - Material Design-style floating labels
- **3 Variants**: default, filled, outlined
- **Left/Right Icons** - Icon positioning support
- **Focus Border Animation** - Gradient border on focus
- **Error States** - Animated error messages with icons
- **Helper Text** - Additional context below input
- **Whil eFocus Scale** - Slight scale on focus

#### Usage:
```tsx
import { Input } from '@/components/ui/input';

// Standard input
<Input label="Email" placeholder="user@example.com" />

// Floating label
<Input label="Username" floatingLabel />

// With icons
<Input
  leftIcon={<Mail />}
  rightIcon={<Check />}
  placeholder="Email"
/>

// With error
<Input
  label="Password"
  error="Password must be 8+ characters"
  type="password"
/>

// Filled variant
<Input variant="filled" label="Search" />
```

#### Variants:
- `default` - Gray background with border
- `filled` - Solid background, bottom border only
- `outlined` - Transparent with border

---

### 3. **Card Component** (`Card.tsx`)

#### Features:
- **4 Variants**: default, glass, gradient, elevated
- **Glassmorphism** - Backdrop blur effect
- **Shimmering Effect** - Animated shimmer on glass variant
- **Hover Animations** - Lift and scale on hover
- **Sub-components**: CardHeader, CardBody, CardFooter

#### Usage:
```tsx
import { Card, CardHeader, CardBody, CardFooter } from '@/components/ui/Card';

// Glass card
<Card variant="glass">
  <CardHeader>
    <h3>Title</h3>
  </CardHeader>
  <CardBody>
    Content here
  </CardBody>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>

// Elevated card with click
<Card variant="elevated" onClick={() => handleClick()}>

  Content
</Card>

// No hover effect
<Card hover={false}>Static Card</Card>
```

#### Variants:
- `default` - White with subtle shadow
- `glass` - Glassmorphism with backdrop blur
- `gradient` - Gradient background (blue → purple)
- `elevated` - Maximum shadow elevation

---

### 4. **Modal Component** (`Modal.tsx`)

#### Features:
- **Backdrop Blur** - Blurred background
- **Spring Animations** - Smooth entrance/exit
- **5 Sizes**: sm, md, lg, xl, full
- **ESC Key Support** - Close on Escape
- **Body Scroll Lock** - Prevents background scrolling
- **Close Button** - Rotating close animation
- **Click Outside** - Optional close on backdrop click

#### Usage:
```tsx
import { Modal, ModalFooter } from '@/components/ui/Modal';

const [isOpen, setIsOpen] = useState(false);

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Confirm Action"
  size="md"
  showCloseButton
  closeOnBackdrop
>
  <p>Modal content here</p>

  <ModalFooter>
    <Button onClick={() => setIsOpen(false)}>Cancel</Button>
    <Button variant="primary">Confirm</Button>
  </ModalFooter>
</Modal>
```

#### Features:
- Auto-lock body scroll when open
- Keyboard shortcuts (ESC to close)
- Backdrop click to close (optional)
- Smooth spring animations
- Gradient header background

---

### 5. **Alert Component** (`Alert.tsx`)

#### Features:
- **4 Types**: success, error, warning, info
- **3 Variants**: filled, outlined, soft
- **Icons** - Auto icon per type (customizable)
- **Dismissible** - Optional close button
- **Animated Border** - Bottom border animation
- **Scale Animation** - Icon pulse effect

#### Usage:
```tsx
import { Alert } from '@/components/ui/Alert';

// Success alert
<Alert
  type="success"
  title="Success!"
  message="Your changes have been saved."
/>

// Error with custom content
<Alert type="error" dismissible onClose={() => {}}>
  <p>Custom error content</p>
</Alert>

// Filled variant
<Alert
  type="info"
  variant="filled"
  title="Information"
  message="Important update available"
/>

// With custom icon
<Alert
  type="warning"
  icon={<CustomIcon />}
  dismissible
/>
```

#### Types:
- `success` - Green with checkmark
- `error` - Red with alert circle
- `warning` - Orange with triangle
- `info` - Blue with info icon

#### Variants:
- `filled` - Solid background color
- `outlined` - White with colored border
- `soft` - Light colored background

---

## 🎭 Animation Features

### Framer Motion Implementations:

1. **Button**:
   - Ripple effect on click
   - Scale on hover (1.02x)
   - Press animation (0.98x)
   - Loading spinner rotation

2. **Input**:
   -  Label float animation
   - Focus border slide-in
   - Error message slide-in
   - Scale on focus (1.01x)

3. **Card**:
   - Entrance fade-in
   - Hover lift (-4px)
   - Shimmer animation (glass variant)
   - Scale on hover (1.01x)

4. **Modal**:
   - Backdrop fade-in
   - Content spring animation
   - Close button rotate (90°)
   - Scale effects

5. **Alert**:
   - Entrance animation (fade + scale)
   - Icon pulse (scale 1 → 1.2 → 1)
   - Border slide-in (scaleX)
   - Remove animation on dismiss

---

## 🎨 Design System

### Colors:
```css
Primary: Blue (#3B82F6 - #2563EB)
Secondary: Gray (#6B7280 - #4B5563)
Success: Green (#10B981 - #059669)
Error: Red (#EF4444 - #DC2626)
Warning: Orange (#F59E0B - #D97706)
Info: Blue (#3B82F6)
```

### Gradients:
```css
Primary Button: linear-gradient(to right, #2563EB, #1D4ED8)
Gradient Button: linear-gradient(to right, #3B82F6, #8B5CF6, #EC4899)
Focus Border: linear-gradient(to right, #3B82F6, #8B5CF6)
Card Gradient: linear-gradient(to bottom right, #EFF6FF, #FFF, #F3E8FF)
```

### Shadows:
```css
Button Primary: 0 10px 30px rgba(59, 130, 246, 0.3)
Button Hover: 0 15px 40px rgba(59, 130, 246, 0.4)
Card Default: 0 1px 3px rgba(0, 0, 0, 0.1)
Card Elevated: 0 20px 50px rgba(0, 0, 0, 0.15)
Modal: 0 25px 50px rgba(0, 0, 0, 0.25)
```

### Border Radius:
```css
lg: 0.5rem (8px)
xl: 0.75rem (12px)
2xl: 1rem (16px)
3xl: 1.5rem (24px)
```

---

## 🚀 Performance

### Optimizations:
- ✅ **useCallback** for event handlers
- ✅ **AnimatePresence** for smooth exits
- ✅ **Framer Motion** GPU-accelerated transforms
- ✅ **CSS containment** for layout
- ✅ **Conditional animations** based on user preferences
- ✅ **Cleanup functions** for timers and listeners

---

## 📱 Responsive Design

All components are fully responsive with:
- Mobile-first approach
- Touch-friendly hit areas (min 44x44px)
- Responsive text sizes
- Adaptive spacing
- Screen reader support
- Keyboard navigation

---

## ♿ Accessibility

### Features:
- ARIA labels on all interactive elements
- Focus indicators (ring-2)
- Keyboard navigation support
- Screen reader compatible
- Color contrast ratios (WCAG AA)
- Disabled state handling
- Error announcements

---

## 🔧 TypeScript Support

All components are fully typed with:
- Strict type checking
- Props interfaces exported
- Generic support where applicable
- Ref forwarding
- Event handler typing

---

## 📦 No External UI Dependencies

**Removed:**
- ❌ Radix UI
- ❌ shadcn/ui
- ❌ Headless UI

**Using Only:**
- ✅ Framer Motion (animations)
- ✅ Lucide React (icons)
- ✅ clsx (class management)
- ✅ Custom implementations

---

## 🎯 Key Improvements

1. **Ripple Effects** - Material Design-style interactions
2. **Glassmorphism** - Modern blur effects
3. **Floating Labels** - Material input style
4. **Spring Animations** - Natural motion
5. **Color Gradients** - Modern aesthetics
6. **Shadow Glows** - Depth and emphasis
7. **Micro-interactions** - Delightful UX
8. **Custom Icons** - Integrated animations

---

## 💡 Usage Tips

### Button:
- Use `variant="gradient"` for hero CTAs
- Enable `withRipple` for better feedback
- Use `icon` prop for icon buttons
- Set `fullWidth` for forms

### Input:
- Use `floatingLabel` for modern forms
- Add `leftIcon` for search inputs
- Use `variant="filled"` for dark themes
- Always provide `helperText` for context

### Card:
- Use `variant="glass"` for overlays
- Use `variant="elevated"` for importance
- Disable `hover` for static content
- Use sub-components for structure

### Modal:
- Use `size="full"` for complex forms
- Enable `closeOnBackdrop` for flexibility
- Always provide `title` for context
- Use `ModalFooter` for actions

### Alert:
- Use `variant="filled"` for critical alerts
- Make dismissible for non-critical
- Provide both `title` and `message`
- Use `type` appropriately

---

## 🎉 Summary

All UI components are now:
- ✅ **100% Custom** - No Radix UI or shadcn
- ✅ **Advanced Animations** - Framer Motion powered
- ✅ **Modern Design** - Glassmorphism, gradients
- ✅ **Fully Typed** - Complete TypeScript support
- ✅ **Accessible** - WCAG compliant
- ✅ **Responsive** - Mobile-first design
- ✅ **Performant** - GPU-accelerated
- ✅ **Production Ready** - Battle-tested patterns

---

*Built with ❤️ using React 19, Framer Motion, and Tailwind CSS 4.0*
