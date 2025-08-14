git clone <repo> C:\billing-app
cd C:\billing-app
docker compose up -d db api-php api
docker compose exec api-php bash -lc "cp -n .env.example .env || true; COMPOSER_MEMORY_LIMIT=-1 composer install; php artisan key:generate; php artisan config:clear"
# (Optional) import dumps as in step 4
docker compose up --build ui
# Open: http://localhost:8000  and  http://localhost:19006
