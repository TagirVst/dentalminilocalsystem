#!/bin/bash

# Резервная система учёта пациентов стоматологии
# Скрипт автоматической установки для Ubuntu 22.04

# Отключаем остановку при ошибке для лучшей обработки
set +e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Функция для вывода сообщений
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    if [[ "$CONTINUE_ON_ERROR" != "true" ]]; then
        exit 1
    fi
}

info() {
    echo -e "${BLUE}[INFO] $1${NC}"
}

success() {
    echo -e "${GREEN}[SUCCESS] $1${NC}"
}

# Функция безопасного выполнения команд
safe_execute() {
    local cmd="$1"
    local description="$2"
    local continue_on_error="${3:-false}"
    
    log "Выполнение: $description"
    if eval "$cmd"; then
        success "$description - выполнено успешно"
        return 0
    else
        local exit_code=$?
        if [[ "$continue_on_error" == "true" ]]; then
            warn "$description - ошибка (код: $exit_code), продолжаем..."
            return $exit_code
        else
            error "$description - критическая ошибка (код: $exit_code)"
            return $exit_code
        fi
    fi
}

# Проверка прав
check_permissions() {
    log "Проверка прав доступа..."
    
    # Проверяем, можем ли мы использовать sudo
    if ! sudo -n true 2>/dev/null; then
        if [[ $EUID -ne 0 ]]; then
            warn "Для установки потребуются права администратора"
            if [[ "$AUTO_YES" != "true" ]]; then
                read -p "Продолжить? (y/N): " -r
                if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                    exit 0
                fi
            fi
        fi
    fi
    
    success "Права проверены"
}

# Проверка операционной системы
check_os() {
    log "Проверка операционной системы..."
    
    if [[ ! -f /etc/os-release ]]; then
        error "Невозможно определить операционную систему"
        return 1
    fi
    
    . /etc/os-release
    
    if [[ "$ID" != "ubuntu" ]]; then
        warn "Этот скрипт предназначен для Ubuntu. Обнаружена: $ID"
        if [[ "$AUTO_YES" != "true" ]]; then
            read -p "Продолжить? (y/N): " -r
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                exit 1
            fi
        fi
    fi
    
    # Более мягкая проверка версии
    if [[ "$VERSION_ID" != "22.04" ]]; then
        warn "Рекомендуется Ubuntu 22.04. Обнаружена версия: $VERSION_ID"
        if [[ "$AUTO_YES" != "true" ]]; then
            read -p "Продолжить? (y/N): " -r
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                exit 1
            fi
        fi
    fi
    
    success "Операционная система: Ubuntu $VERSION_ID"
}

# Обновление системы
update_system() {
    if [[ "$SKIP_UPDATE" == "true" ]]; then
        info "Пропуск обновления системы"
        return 0
    fi
    
    log "Обновление системы..."
    
    # Обновляем только если не обновлялись недавно
    local last_update=""
    if [[ -f /var/cache/apt/pkgcache.bin ]]; then
        last_update=$(stat -c %Y /var/cache/apt/pkgcache.bin)
        local current_time=$(date +%s)
        local hours_since_update=$(( (current_time - last_update) / 3600 ))
        
        if [[ $hours_since_update -lt 24 ]]; then
            info "Система обновлялась менее 24 часов назад, пропускаем обновление"
            return 0
        fi
    fi
    
    safe_execute "sudo apt update" "Обновление списка пакетов"
    safe_execute "sudo apt upgrade -y" "Обновление пакетов" "true"
    safe_execute "sudo apt install -y curl wget gnupg2 software-properties-common git bc" "Установка базовых пакетов"
    
    success "Система обновлена"
}

# Установка Node.js 18
install_nodejs() {
    log "Проверка и установка Node.js 18..."
    
    # Проверка существующей установки
    if command -v node &> /dev/null; then
        local node_version=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
        if [[ "$node_version" -ge 18 ]]; then
            success "Node.js уже установлен (версия: $(node -v))"
            return 0
        else
            warn "Обнаружена старая версия Node.js ($(node -v)). Обновляем..."
        fi
    fi
    
    # Установка Node.js 18
    log "Установка Node.js 18..."
    safe_execute "curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -" "Добавление репозитория NodeSource"
    safe_execute "sudo apt-get install -y nodejs" "Установка Node.js"
    
    # Проверка установки
    if command -v node &> /dev/null && command -v npm &> /dev/null; then
        success "Node.js установлен: $(node -v), NPM: $(npm -v)"
    else
        error "Ошибка установки Node.js"
        return 1
    fi
}

# Установка PostgreSQL
install_postgresql() {
    log "Проверка и установка PostgreSQL..."
    
    # Проверка существующей установки
    if command -v psql &> /dev/null; then
        if sudo systemctl is-active --quiet postgresql; then
            success "PostgreSQL уже установлен и запущен"
            return 0
        else
            log "PostgreSQL установлен, запускаем сервис..."
            safe_execute "sudo systemctl start postgresql" "Запуск PostgreSQL"
            safe_execute "sudo systemctl enable postgresql" "Включение автозапуска PostgreSQL"
            success "PostgreSQL запущен"
            return 0
        fi
    fi
    
    # Установка PostgreSQL
    safe_execute "sudo apt install -y postgresql postgresql-contrib" "Установка PostgreSQL"
    safe_execute "sudo systemctl start postgresql" "Запуск PostgreSQL"
    safe_execute "sudo systemctl enable postgresql" "Включение автозапуска PostgreSQL"
    
    success "PostgreSQL установлен и запущен"
}

# Настройка базы данных
setup_database() {
    log "Настройка базы данных..."
    
    # Проверка существования базы данных
    local db_exists=$(sudo -u postgres psql -lqt 2>/dev/null | cut -d \| -f 1 | grep -wq dental_backup && echo "exists" || echo "not_exists")
    
    if [[ "$db_exists" == "exists" ]]; then
        success "База данных dental_backup уже существует"
        # Попытка получить пароль из существующего .env файла
        if [[ -f "server/.env" ]]; then
            local existing_password=$(grep "DB_PASSWORD=" server/.env 2>/dev/null | cut -d'=' -f2)
            if [[ -n "$existing_password" ]]; then
                echo "$existing_password" > /tmp/dental_db_password
                info "Используется существующий пароль базы данных"
                return 0
            fi
        fi
    fi
    
    # Генерация случайного пароля для БД
    local db_password=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
    
    if [[ "$db_exists" != "exists" ]]; then
        # Создание базы данных и пользователя
        log "Создание базы данных и пользователя..."
        sudo -u postgres psql << EOF
CREATE DATABASE dental_backup;
CREATE USER dental_user WITH PASSWORD '$db_password';
GRANT ALL PRIVILEGES ON DATABASE dental_backup TO dental_user;
ALTER USER dental_user CREATEDB;
\q
EOF
        
        if [[ $? -eq 0 ]]; then
            success "База данных и пользователь созданы"
        else
            error "Ошибка создания базы данных"
            return 1
        fi
    fi
    
    # Сохранение пароля для дальнейшего использования
    echo "$db_password" > /tmp/dental_db_password
}

# Установка зависимостей проекта
install_dependencies() {
    log "Установка зависимостей проекта..."
    
    # Проверка наличия package.json в корне
    if [[ ! -f "package.json" ]]; then
        error "Файл package.json не найден. Убедитесь, что вы находитесь в корневой директории проекта."
        return 1
    fi
    
    # Установка зависимостей корневого проекта
    if [[ ! -d "node_modules" ]] || [[ "package.json" -nt "node_modules" ]]; then
        safe_execute "npm install" "Установка корневых зависимостей"
    else
        info "Корневые зависимости уже установлены"
    fi
    
    # Установка зависимостей для сервера
    if [[ -d "server" ]]; then
        cd server
        if [[ ! -d "node_modules" ]] || [[ "package.json" -nt "node_modules" ]]; then
            safe_execute "npm install" "Установка зависимостей сервера"
        else
            info "Зависимости сервера уже установлены"
        fi
        cd ..
    else
        error "Директория server не найдена"
        return 1
    fi
    
    # Установка зависимостей для клиента
    if [[ -d "client" ]]; then
        cd client
        if [[ ! -d "node_modules" ]] || [[ "package.json" -nt "node_modules" ]]; then
            safe_execute "npm install" "Установка зависимостей клиента"
        else
            info "Зависимости клиента уже установлены"
        fi
        cd ..
    else
        error "Директория client не найдена"
        return 1
    fi
    
    success "Зависимости установлены"
}

# Настройка переменных окружения
setup_environment() {
    log "Настройка переменных окружения..."
    
    local db_password=""
    if [[ -f /tmp/dental_db_password ]]; then
        db_password=$(cat /tmp/dental_db_password)
    else
        db_password=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
    fi
    
    local session_secret=$(openssl rand -base64 64 | tr -d "=+/" | cut -c1-50)
    
    # Создание .env файла только если он не существует или отличается
    local env_content="NODE_ENV=production
PORT=5000
HOST=0.0.0.0

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=dental_backup
DB_USER=dental_user
DB_PASSWORD=$db_password

# Session
SESSION_SECRET=$session_secret"
    
    if [[ ! -f "server/.env" ]] || ! echo "$env_content" | cmp -s - "server/.env"; then
        echo "$env_content" > server/.env
        log "Файл .env обновлен"
    else
        info "Файл .env уже актуален"
    fi
    
    success "Переменные окружения настроены"
    
    # Удаление временного файла с паролем
    rm -f /tmp/dental_db_password
}

# Запуск миграций и seeders
setup_database_data() {
    log "Запуск миграций и заполнение данными..."
    
    cd server
    
    # Проверка подключения к БД и выполнение миграций
    if safe_execute "npm run migrate" "Выполнение миграций базы данных" "true"; then
        success "Миграции выполнены успешно"
    else
        warn "Ошибка выполнения миграций (возможно, уже выполнены)"
    fi
    
    # Заполнение начальными данными
    if safe_execute "npm run seed" "Заполнение базы начальными данными" "true"; then
        success "База данных заполнена начальными данными"
    else
        warn "Ошибка заполнения данными (возможно, данные уже существуют)"
    fi
    
    cd ..
    
    success "База данных настроена"
}

# Сборка frontend приложения
build_frontend() {
    if [[ "$DEV_MODE" == "true" ]]; then
        info "Пропуск сборки frontend в режиме разработки"
        return 0
    fi
    
    log "Сборка frontend приложения..."
    
    cd client
    
    # Проверяем, нужно ли пересобирать
    if [[ -d "build" ]] && [[ "build" -nt "src" ]] && [[ "build" -nt "package.json" ]]; then
        info "Frontend уже собран и актуален"
        cd ..
        return 0
    fi
    
    safe_execute "npm run build" "Сборка React приложения"
    cd ..
    
    success "Frontend собран"
}

# Настройка systemd сервиса
setup_systemd_service() {
    if [[ "$DEV_MODE" == "true" ]]; then
        info "Пропуск настройки systemd сервиса в режиме разработки"
        return 0
    fi
    
    log "Настройка systemd сервиса..."
    
    local current_user=$(whoami)
    local project_path=$(pwd)
    local node_path=$(which node)
    local npm_path=$(which npm)
    
    # Проверяем, существует ли уже сервис
    if systemctl list-unit-files | grep -q "dental-backup.service"; then
        info "Сервис dental-backup уже существует, обновляем..."
        sudo systemctl stop dental-backup 2>/dev/null || true
    fi
    
    # Создание файла сервиса
    sudo tee /etc/systemd/system/dental-backup.service > /dev/null << EOF
[Unit]
Description=Dental Backup System
After=network.target postgresql.service
Wants=postgresql.service

[Service]
Type=simple
User=$current_user
WorkingDirectory=$project_path
Environment=NODE_ENV=production
Environment=PATH=/usr/bin:/usr/local/bin:$PATH
ExecStart=$npm_path start
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=dental-backup

[Install]
WantedBy=multi-user.target
EOF

    # Перезагрузка systemd и включение сервиса
    safe_execute "sudo systemctl daemon-reload" "Перезагрузка systemd"
    safe_execute "sudo systemctl enable dental-backup" "Включение автозапуска сервиса"
    
    success "Systemd сервис настроен"
}

# Настройка файрвола
setup_firewall() {
    if [[ "$SKIP_FIREWALL" == "true" ]]; then
        info "Пропуск настройки файрвола"
        return 0
    fi
    
    log "Настройка файрвола..."
    
    # Проверка статуса UFW
    if command -v ufw &> /dev/null; then
        # Проверяем, не настроен ли уже файрвол
        local ufw_status=$(sudo ufw status | head -1)
        if [[ "$ufw_status" == *"active"* ]]; then
            info "UFW уже активен, добавляем правила..."
        fi
        
        # Добавляем правила только если их еще нет
        sudo ufw allow 22/tcp comment 'SSH' 2>/dev/null || true
        sudo ufw allow 5000/tcp comment 'Dental Backup System' 2>/dev/null || true
        sudo ufw allow from 192.168.0.0/16 to any port 5000 comment 'Local network access' 2>/dev/null || true
        
        # Включаем UFW если он не активен
        if [[ "$ufw_status" != *"active"* ]]; then
            safe_execute "sudo ufw --force enable" "Включение UFW"
        fi
        
        success "Файрвол настроен"
    else
        warn "UFW не установлен. Рекомендуется настроить файрвол вручную."
    fi
}

# Запуск системы
start_system() {
    if [[ "$DEV_MODE" == "true" ]]; then
        info "В режиме разработки сервис не запускается автоматически"
        return 0
    fi
    
    log "Запуск системы..."
    
    # Остановка сервиса если запущен
    sudo systemctl stop dental-backup 2>/dev/null || true
    
    # Запуск сервиса
    safe_execute "sudo systemctl start dental-backup" "Запуск сервиса dental-backup"
    
    # Ожидание запуска
    sleep 5
    
    # Проверка статуса
    if sudo systemctl is-active --quiet dental-backup; then
        success "Система успешно запущена"
        
        # Получение IP адреса
        local local_ip=$(hostname -I | awk '{print $1}' 2>/dev/null || echo "localhost")
        
        echo ""
        echo "🎉 УСТАНОВКА ЗАВЕРШЕНА УСПЕШНО!"
        echo ""
        echo "📋 Информация о системе:"
        echo "   • Локальный доступ: http://localhost:5000"
        if [[ "$local_ip" != "localhost" ]]; then
            echo "   • Сетевой доступ: http://$local_ip:5000"
        fi
        echo "   • Статус сервиса: $(sudo systemctl is-active dental-backup)"
        echo ""
        echo "👥 Тестовые аккаунты:"
        echo "   • Врач:         doctor1 / 123456"
        echo "   • Администратор: admin   / 123456"
        echo "   • Управляющий:   manager / 123456"
        echo ""
        echo "🔧 Управление системой:"
        echo "   • Статус:       sudo systemctl status dental-backup"
        echo "   • Остановка:    sudo systemctl stop dental-backup"
        echo "   • Запуск:       sudo systemctl start dental-backup"
        echo "   • Перезапуск:   sudo systemctl restart dental-backup"
        echo "   • Логи:         sudo journalctl -u dental-backup -f"
        echo ""
        echo "💾 Резервное копирование:"
        echo "   pg_dump -h localhost -U dental_user dental_backup > backup_\$(date +%Y%m%d_%H%M%S).sql"
        echo ""
    else
        error "Ошибка запуска системы. Проверьте логи: sudo journalctl -u dental-backup -xe"
        return 1
    fi
}

# Функция проверки требований
check_requirements() {
    log "Проверка системных требований..."
    
    # Проверка RAM (минимум 1GB, рекомендуется 2GB)
    local total_ram=$(free -m | awk 'NR==2{printf "%.1f", $2/1024}')
    if (( $(echo "$total_ram < 1" | bc -l) )); then
        error "Недостаточно оперативной памяти: ${total_ram}GB (минимум 1GB)"
        return 1
    elif (( $(echo "$total_ram < 2" | bc -l) )); then
        warn "Мало оперативной памяти: ${total_ram}GB (рекомендуется 2GB)"
    fi
    
    # Проверка свободного места (минимум 3GB)
    local available_space=$(df -BG . 2>/dev/null | awk 'NR==2 {print $4}' | sed 's/G//' || echo "10")
    if [[ $available_space -lt 3 ]]; then
        warn "Мало свободного места: ${available_space}GB (рекомендуется минимум 3GB)"
    fi
    
    success "Системные требования: RAM ${total_ram}GB, Диск ${available_space}GB"
}

# Функция отображения помощи
show_help() {
    echo "Установщик резервной системы учёта пациентов стоматологии"
    echo ""
    echo "Использование: $0 [опции]"
    echo ""
    echo "Опции:"
    echo "  -h, --help              Показать эту справку"
    echo "  -y, --yes               Автоматически отвечать 'да' на все вопросы"
    echo "  --skip-update           Пропустить обновление системы"
    echo "  --skip-firewall         Пропустить настройку файрвола"
    echo "  --dev-mode              Установка в режиме разработки"
    echo "  --continue-on-error     Продолжать при некритических ошибках"
    echo ""
    echo "Пример:"
    echo "  $0                      Обычная установка"
    echo "  $0 -y                   Автоматическая установка"
    echo "  $0 --dev-mode           Установка для разработки"
    echo "  $0 -y --skip-update     Быстрая установка без обновлений"
    echo ""
}

# Главная функция
main() {
    # Парсинг аргументов
    AUTO_YES=false
    SKIP_UPDATE=false
    SKIP_FIREWALL=false
    DEV_MODE=false
    CONTINUE_ON_ERROR=false
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_help
                exit 0
                ;;
            -y|--yes)
                AUTO_YES=true
                shift
                ;;
            --skip-update)
                SKIP_UPDATE=true
                shift
                ;;
            --skip-firewall)
                SKIP_FIREWALL=true
                shift
                ;;
            --dev-mode)
                DEV_MODE=true
                shift
                ;;
            --continue-on-error)
                CONTINUE_ON_ERROR=true
                shift
                ;;
            *)
                error "Неизвестная опция: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    # Заголовок
    echo ""
    echo "🦷 Установщик резервной системы учёта пациентов стоматологии"
    echo "=================================================================="
    echo ""
    
    # Подтверждение установки
    if [[ "$AUTO_YES" != true ]]; then
        info "Эта процедура установит полную систему учёта пациентов стоматологии."
        info "Будут установлены: Node.js, PostgreSQL, настроена база данных и запущен сервис."
        echo ""
        read -p "Продолжить установку? (y/N): " -r
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "Установка отменена."
            exit 0
        fi
        echo ""
    fi
    
    # Обработка ошибок
    trap 'error "Установка прервана сигналом"' INT TERM
    
    # Выполнение установки
    check_permissions
    check_os
    check_requirements
    
    if [[ "$SKIP_UPDATE" != true ]]; then
        update_system
    fi
    
    install_nodejs
    install_postgresql
    setup_database
    install_dependencies
    setup_environment
    setup_database_data
    
    if [[ "$DEV_MODE" != true ]]; then
        build_frontend
        setup_systemd_service
        
        if [[ "$SKIP_FIREWALL" != true ]]; then
            setup_firewall
        fi
        
        start_system
    else
        success "Установка в режиме разработки завершена"
        echo ""
        echo "Для запуска в режиме разработки:"
        echo "  npm run dev              # Запуск сервера и клиента"
        echo "  npm run server:dev       # Только сервер"
        echo "  npm run client:dev       # Только клиент"
        echo ""
    fi
}

# Обработка сигналов
trap 'error "Установка прервана пользователем"' INT TERM

# Запуск главной функции
main "$@"
