@echo off
FOR /F "tokens=5" %%a in ('netstat -aon ^| findstr :3000') do taskkill /F /PID %%a
npx prisma db push --accept-data-loss
npx prisma generate
