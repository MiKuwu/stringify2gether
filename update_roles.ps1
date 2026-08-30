(Get-Content src/app/api/auth/[...nextauth]/route.ts) -replace '"FOUNDER"', '"ADMIN + FOUNDER"' | Set-Content src/app/api/auth/[...nextauth]/route.ts
(Get-Content src/app/admin/page.tsx) -replace 'session.user.role !== "ADMIN"\)', 'session.user.role !== "ADMIN" && session.user.role !== "ADMIN + FOUNDER")' | Set-Content src/app/admin/page.tsx
(Get-Content src/app/admin/categories/page.tsx) -replace 'session.user.role !== "ADMIN"\)', 'session.user.role !== "ADMIN" && session.user.role !== "ADMIN + FOUNDER")' | Set-Content src/app/admin/categories/page.tsx
(Get-Content src/components/Navbar.tsx) -replace 'session.user.role === "FOUNDER"', 'session.user.role === "ADMIN + FOUNDER"' | Set-Content src/components/Navbar.tsx

(Get-Content src/app/admin/users/page.tsx) -replace '"FOUNDER"', '"ADMIN + FOUNDER"' | Set-Content src/app/admin/users/page.tsx
(Get-Content src/app/admin/users/actions.ts) -replace '"FOUNDER"', '"ADMIN + FOUNDER"' | Set-Content src/app/admin/users/actions.ts

(Get-Content src/app/admin/posts/page.tsx) -replace '"FOUNDER"', '"ADMIN + FOUNDER"' | Set-Content src/app/admin/posts/page.tsx
(Get-Content src/app/admin/posts/actions.ts) -replace '"FOUNDER"', '"ADMIN + FOUNDER"' | Set-Content src/app/admin/posts/actions.ts

(Get-Content src/app/admin/reports/page.tsx) -replace '"FOUNDER"', '"ADMIN + FOUNDER"' | Set-Content src/app/admin/reports/page.tsx
(Get-Content src/app/admin/reports/actions.ts) -replace '"FOUNDER"', '"ADMIN + FOUNDER"' | Set-Content src/app/admin/reports/actions.ts

(Get-Content src/app/profile/page.tsx) -replace 'ID Game:', 'UID:' | Set-Content src/app/profile/page.tsx
