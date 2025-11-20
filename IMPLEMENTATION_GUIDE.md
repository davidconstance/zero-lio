# Quick Implementation Guide

## How to Use the Improved Components

### 1. Switch to Improved Main Entry Point

**Current:** `frontend/src/main.tsx`
**Improved:** `frontend/src/main-improved.tsx`

**To activate improvements:**

```bash
cd frontend/src
mv main.tsx main-old.tsx
mv main-improved.tsx main.tsx
```

Or update `vite.config.ts` to use `main-improved.tsx` as entry point.

---

### 2. Replace Old Components with New Ones

#### Button Component

**Old Pattern:**
```tsx
<button className="button" type="submit" onClick={handleClick}>
  Login
</button>
```

**New Pattern:**
```tsx
import Button from "../components/Button";

<Button
  variant="primary"
  size="large"
  fullWidth
  isLoading={isLoading}
  onClick={handleClick}
>
  Login
</Button>
```

**Variants:**
- `primary` - Main actions (blue)
- `secondary` - Alternative actions (white with border)
- `danger` - Destructive actions (red)
- `ghost` - Tertiary actions (transparent)

---

#### Input Component

**Old Pattern:**
```tsx
<div className={styles.input}>
  <input
    type="email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
  />
</div>
```

**New Pattern:**
```tsx
import Input from "../components/Input";

<Input
  label="Correo Electrónico"
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  onValidate={validateEmail}
  icon={<IoMail />}
  placeholder="tu@correo.com"
  helpText="Usaremos este correo para confirmaciones"
  required
/>
```

**Validation Function:**
```tsx
const validateEmail = (email: string) => {
  if (!email) return "El correo es requerido";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return "Ingresa un correo válido";
  return undefined;
};
```

---

#### Bottom Navigation

**Replace Menu component:**

**Old:**
```tsx
{isMenuOpen && <Menu />}
```

**New:**
```tsx
<BottomNav />
```

Add to all authenticated pages at the bottom:
```tsx
import BottomNav from "../components/BottomNav";

export default function MyPage() {
  return (
    <div className={styles.container}>
      {/* Page content */}
      <BottomNav />
    </div>
  );
}
```

**CSS requirement:**
```css
.container {
  padding-bottom: 70px; /* Space for bottom nav */
}
```

---

#### Empty State

**Use when lists are empty:**

```tsx
import EmptyState from "../components/EmptyState";
import { IoIosPin } from "react-icons/io5";

{canchas.length === 0 && (
  <EmptyState
    icon={<IoIosPin />}
    title="Sin canchas guardadas"
    description="Agrega canchas a favoritos para verlas aquí"
    actionLabel="Buscar Canchas"
    onAction={() => navigate("/canchas")}
  />
)}
```

---

### 3. Update Pages

#### Replace App.tsx (Auth) with Login/Register

**Old routing:**
```tsx
{ path: "/", element: <App /> }
```

**New routing:**
```tsx
{ path: "/", element: <Login /> },
{ path: "/register", element: <Register /> },
```

---

#### Replace Home.tsx with ImprovedHome.tsx

**In routing:**
```tsx
{
  path: "/canchas",
  element: (
    <RequireAuth>
      <ImprovedHome />
    </RequireAuth>
  ),
}
```

---

#### Replace Reserve.tsx with ImprovedReserve.tsx

**In routing:**
```tsx
{
  path: "/reservar",
  element: (
    <RequireAuth>
      <ImprovedReserve />
    </RequireAuth>
  ),
}
```

---

#### Replace MakeReview.tsx with ImprovedMakeReview.tsx

**In routing:**
```tsx
{
  path: "/comentar",
  element: (
    <RequireAuth>
      <ImprovedMakeReview />
    </RequireAuth>
  ),
}
```

---

#### Update Cancha.tsx with ImprovedCancha.tsx

**In parent components:**
```tsx
import Cancha from "../components/ImprovedCancha";
// or rename ImprovedCancha.tsx to Cancha.tsx
```

---

### 4. Add react-toastify CSS

**In main.tsx (or main-improved.tsx):**
```tsx
import "react-toastify/dist/ReactToastify.css";
```

---

### 5. Environment Variables

Create `.env` file in `frontend/`:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
```

**Update authentication.ts:**
```tsx
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  // ...
};
```

---

### 6. Remove Firebase Credentials from Git

**Critical security fix:**

```bash
# Remove from tracking
git rm --cached backend/api/firebase-credentials.json

# Add to .gitignore
echo "backend/api/firebase-credentials.json" >> .gitignore

# Use environment variable instead
export FIREBASE_CREDENTIALS=$(cat backend/api/firebase-credentials.json)
```

**Update backend/index.js:**
```javascript
var serviceAccount = process.env.FIREBASE_CREDENTIALS
  ? JSON.parse(process.env.FIREBASE_CREDENTIALS)
  : require('./api/firebase-credentials.json'); // fallback for local dev
```

---

## Testing Checklist

### Accessibility Testing

1. **Keyboard Navigation**
   ```
   - Tab through all interactive elements
   - Ensure visible focus indicators
   - No keyboard traps
   - Logical tab order
   ```

2. **Screen Reader (NVDA/JAWS)**
   ```
   - All images have alt text
   - Buttons have aria-labels
   - Form fields have labels
   - Errors are announced
   ```

3. **Color Contrast**
   ```
   - Use WebAIM contrast checker
   - All text meets 4.5:1 ratio
   - Focus indicators meet 3:1 ratio
   ```

4. **Touch Targets**
   ```
   - All buttons minimum 44x44px
   - Adequate spacing between targets
   - Test on actual mobile device
   ```

### Functional Testing

1. **Registration Flow**
   - Try invalid email → See error
   - Weak password → See specific error
   - Valid data → Account created
   - Auto-login after registration

2. **Reservation Flow**
   - No saved courts → See empty state
   - Select court → Proceed to date
   - Select past date → Prevented
   - Complete reservation → See success

3. **Review Flow**
   - Select court → Preview shown
   - Rate without text → Submit disabled
   - Complete form → Submit enabled
   - Submit → Redirect to community

4. **Navigation**
   - Bottom nav visible on all pages
   - Active state highlights current page
   - Tap each icon → Navigate correctly

---

## Common Patterns

### Loading States

```tsx
const [isLoading, setLoading] = useState(false);

const handleSubmit = async () => {
  setLoading(true);
  try {
    await someAsyncOperation();
    toast.success("Success!");
  } catch (error) {
    toast.error("Failed");
  } finally {
    setLoading(false);
  }
};

<Button isLoading={isLoading} onClick={handleSubmit}>
  Submit
</Button>
```

---

### Form Validation

```tsx
const [formData, setFormData] = useState({ email: "", password: "" });

const validateEmail = (email: string) => {
  if (!email) return "Required";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return "Invalid email";
  return undefined;
};

<Input
  label="Email"
  value={formData.email}
  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
  onValidate={validateEmail}
  required
/>
```

---

### Empty States

```tsx
{items.length === 0 ? (
  <EmptyState
    icon={<IoIcon />}
    title="No items"
    description="Add your first item to get started"
    actionLabel="Add Item"
    onAction={() => navigate("/add")}
  />
) : (
  <ItemsList items={items} />
)}
```

---

### Toast Notifications

```tsx
import { toast } from "react-toastify";

// Success
toast.success("Operation completed!");

// Error
toast.error("Something went wrong");

// Warning
toast.warning("Please check your input");

// Info
toast.info("Did you know...");
```

---

## Performance Tips

1. **Lazy Load Routes**
```tsx
const Login = lazy(() => import("./pages/Login"));
```

2. **Memoize Expensive Computations**
```tsx
const filteredCanchas = useMemo(
  () => canchas.filter(c => c.sport === selectedSport),
  [canchas, selectedSport]
);
```

3. **Debounce Search Input**
```tsx
const debouncedSearch = useMemo(
  () => debounce((query) => searchCanchas(query), 300),
  []
);
```

4. **Optimize Images**
```tsx
<img
  src="/image.jpg"
  loading="lazy"
  width="300"
  height="200"
  alt="Description"
/>
```

---

## Deployment Checklist

- [ ] Remove all console.log statements
- [ ] Update meta tags (title, description)
- [ ] Add robots.txt
- [ ] Add sitemap.xml
- [ ] Configure CSP headers
- [ ] Enable HTTPS
- [ ] Add analytics
- [ ] Test on real devices
- [ ] Run Lighthouse audit
- [ ] Check all environment variables
- [ ] Remove debug code
- [ ] Minify assets
- [ ] Enable compression
- [ ] Configure caching

---

## Support

For issues or questions about the improved components:
1. Check component PropTypes/TypeScript definitions
2. Review examples in this guide
3. Test in isolation
4. Check browser console for errors
5. Verify all imports are correct
