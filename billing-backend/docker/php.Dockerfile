FROM php:8.2-fpm-bullseye

# System deps
RUN apt-get update && apt-get install -y \
    git unzip libzip-dev libpng-dev libicu-dev libxml2-dev libonig-dev \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath zip intl gd opcache \
    && rm -rf /var/lib/apt/lists/*

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# We keep code bind-mounted in dev; vendor will be cached to a volume.
# No COPY here so hot-reload works. We run composer in the container at start or via command.
EXPOSE 9000
CMD ["php-fpm", "-F"]
