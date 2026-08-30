@echo off
FOR /F "tokens=5" %%a in ('netstat -aon ^| findstr :3000') do taskkill /F /PID %%a
npx prisma db push --force-reset
npx prisma generate
