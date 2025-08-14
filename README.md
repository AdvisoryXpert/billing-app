cp .env.example .env
composer install
php artisan key:generate

# set DB creds in .env, then
php artisan migrate --seed
php artisan storage:link

php artisan serve


this is sanity check after larvel set up php artisan --version
php -v
composer -V
php artisan route:list
php artisan tinker
