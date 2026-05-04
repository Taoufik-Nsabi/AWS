FROM php:8.2-fpm

# System dependencies and build tooling
RUN apt-get update && apt-get install -y \
    git \
    unzip \
    curl \
    nano \
    libzip-dev \
    libicu-dev \
    libxml2-dev \
    zlib1g-dev \
    gnupg2 \
    unixodbc-dev \
    g++ \
    make \
    autoconf \
    pkg-config \
    libonig-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install Microsoft ODBC driver
RUN curl -sSL https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor -o /usr/share/keyrings/microsoft.gpg \
    && echo "deb [arch=amd64 signed-by=/usr/share/keyrings/microsoft.gpg] https://packages.microsoft.com/debian/12/prod bookworm main" > /etc/apt/sources.list.d/mssql-release.list \
    && apt-get update \
    && ACCEPT_EULA=Y apt-get install -y msodbcsql18

# PHP extensions
RUN docker-php-ext-install intl mbstring opcache zip

# SQL Server drivers
RUN pecl install sqlsrv-5.12.0 pdo_sqlsrv-5.12.0 \
    && docker-php-ext-enable sqlsrv pdo_sqlsrv

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Install dependencies first for better layer caching
COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-interaction --no-scripts
RUN cp -a vendor /opt/vendor-cache
RUN sha256sum composer.lock | awk '{print $1}' > /opt/vendor-cache/.composer.lock.sha256

# Copy the rest of the project
COPY . .

RUN mkdir -p /var/www/html/var/cache/prod/vich_uploader \
    /var/www/html/var/log \
    /var/www/html/public/uploads \
    && chown -R www-data:www-data /var/www/html

RUN chown -R www-data:www-data /var/www/html

EXPOSE 9000

CMD ["php-fpm"]
