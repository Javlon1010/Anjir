# Anjir Web Sayti

Ushbu loyiha Anjir mahsulotlari uchun yaratilgan veb-sayt hisoblanadi.

## Render-ga joylash uchun qo'llanma

1. GitHub hisobingizga yangi repository yarating
2. Loyihangizni GitHub-ga yuklang:
   ```
   git init
   git add .
   git commit -m "Birinchi commit"
   git branch -M main
   git remote add origin SIZNING_REPOSITORY_LINKINGIZ
   git push -u origin main
   ```
3. Render.com saytiga kiring va yangi "Web Service" yarating
4. GitHub repositoryingizni tanlang
5. Quyidagi sozlamalarni tanlang:
   - Build Command: `npm install`
   - Start Command: `npm start`
6. Environment variableslarni `.env` fayldan qo'shing
7. "Create Web Service" tugmasini bosing

## Mahalliy ishga tushirish

1. `.env.example` faylidan nusxa oling va uni `.env` deb nomlang
2. Kerakli environment variablelarni to'ldiring
3. Quyidagi buyruqlarni bajarib dasturni ishga tushiring:
   ```
   npm install
   npm start
   ```

## Dastur haqida

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express
- Ma'lumotlar bazasi: MongoDB

## Muallif

Sizning ismingiz
