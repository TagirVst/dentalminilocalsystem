#!/bin/bash

# Скрипт резервного копирования для системы учёта пациентов стоматологии

set -e

# Цвета для вывода
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Функции для вывода
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

warn() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

# Настройки по умолчанию
BACKUP_DIR="/var/backups/dental-system"
DB_NAME="dental_backup"
DB_USER="dental_user"
RETENTION_DAYS=30

# Создание директории для бэкапов
create_backup_dir() {
    if [[ ! -d "$BACKUP_DIR" ]]; then
        sudo mkdir -p "$BACKUP_DIR"
        sudo chown $USER:$USER "$BACKUP_DIR"
        log "Создана директория для бэкапов: $BACKUP_DIR"
    fi
}

# Резервное копирование базы данных
backup_database() {
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_file="$BACKUP_DIR/dental_db_backup_$timestamp.sql"
    
    log "Создание резервной копии базы данных..."
    
    # Получение пароля из .env файла
    if [[ -f "server/.env" ]]; then
        DB_PASSWORD=$(grep "DB_PASSWORD=" server/.env | cut -d'=' -f2)
        export PGPASSWORD="$DB_PASSWORD"
    else
        error "Файл server/.env не найден"
    fi
    
    # Создание бэкапа
    pg_dump -h localhost -U "$DB_USER" "$DB_NAME" > "$backup_file"
    
    if [[ -f "$backup_file" ]]; then
        # Сжатие бэкапа
        gzip "$backup_file"
        backup_file="${backup_file}.gz"
        
        local file_size=$(du -h "$backup_file" | cut -f1)
        log "✅ База данных сохранена: $backup_file ($file_size)"
        echo "$backup_file"
    else
        error "Ошибка создания резервной копии базы данных"
    fi
    
    unset PGPASSWORD
}

# Резервное копирование файлов приложения
backup_application() {
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_file="$BACKUP_DIR/dental_app_backup_$timestamp.tar.gz"
    
    log "Создание резервной копии файлов приложения..."
    
    # Создание архива с исключением node_modules и других ненужных файлов
    tar -czf "$backup_file" \
        --exclude='node_modules' \
        --exclude='client/build' \
        --exclude='sessions' \
        --exclude='.git' \
        --exclude='*.log' \
        -C .. "$(basename "$(pwd)")"
    
    if [[ -f "$backup_file" ]]; then
        local file_size=$(du -h "$backup_file" | cut -f1)
        log "✅ Файлы приложения сохранены: $backup_file ($file_size)"
        echo "$backup_file"
    else
        error "Ошибка создания резервной копии файлов"
    fi
}

# Удаление старых бэкапов
cleanup_old_backups() {
    log "Удаление резервных копий старше $RETENTION_DAYS дней..."
    
    local deleted_count=0
    
    # Удаление старых файлов
    if [[ -d "$BACKUP_DIR" ]]; then
        while IFS= read -r -d '' file; do
            rm "$file"
            ((deleted_count++))
        done < <(find "$BACKUP_DIR" -name "dental_*_backup_*.sql.gz" -mtime +$RETENTION_DAYS -print0 2>/dev/null)
        
        while IFS= read -r -d '' file; do
            rm "$file"
            ((deleted_count++))
        done < <(find "$BACKUP_DIR" -name "dental_*_backup_*.tar.gz" -mtime +$RETENTION_DAYS -print0 2>/dev/null)
    fi
    
    if [[ $deleted_count -gt 0 ]]; then
        log "✅ Удалено старых файлов: $deleted_count"
    else
        log "✅ Старые файлы не найдены"
    fi
}

# Проверка дискового пространства
check_disk_space() {
    local available_space=$(df "$BACKUP_DIR" | awk 'NR==2 {print $4}')
    local available_gb=$((available_space / 1024 / 1024))
    
    if [[ $available_gb -lt 1 ]]; then
        warn "Мало свободного места: ${available_gb}GB"
        warn "Рекомендуется освободить место или изменить директорию бэкапов"
    fi
}

# Отправка уведомления (заглушка для будущего расширения)
send_notification() {
    local status=$1
    local message=$2
    
    # Здесь можно добавить отправку уведомлений по email, Telegram и т.д.
    log "Уведомление: $status - $message"
}

# Основная функция
main() {
    local backup_type="full"
    local quiet_mode=false
    
    # Парсинг аргументов
    while [[ $# -gt 0 ]]; do
        case $1 in
            --db-only)
                backup_type="db"
                shift
                ;;
            --app-only)
                backup_type="app"
                shift
                ;;
            --retention)
                RETENTION_DAYS="$2"
                shift 2
                ;;
            --backup-dir)
                BACKUP_DIR="$2"
                shift 2
                ;;
            -q|--quiet)
                quiet_mode=true
                shift
                ;;
            -h|--help)
                echo "Скрипт резервного копирования системы учёта пациентов"
                echo ""
                echo "Использование: $0 [опции]"
                echo ""
                echo "Опции:"
                echo "  --db-only              Только резервная копия базы данных"
                echo "  --app-only             Только резервная копия файлов приложения"
                echo "  --retention DAYS       Количество дней хранения (по умолчанию: 30)"
                echo "  --backup-dir DIR       Директория для бэкапов (по умолчанию: /var/backups/dental-system)"
                echo "  -q, --quiet            Тихий режим"
                echo "  -h, --help             Показать эту справку"
                echo ""
                exit 0
                ;;
            *)
                error "Неизвестная опция: $1"
                ;;
        esac
    done
    
    # Перенаправление вывода в тихом режиме
    if [[ "$quiet_mode" == true ]]; then
        exec 3>&1 4>&2
        exec 1>/dev/null 2>/dev/null
    fi
    
    # Проверка зависимостей
    if ! command -v pg_dump &> /dev/null; then
        error "pg_dump не найден. Установите PostgreSQL клиент."
    fi
    
    if ! command -v tar &> /dev/null; then
        error "tar не найден. Установите tar."
    fi
    
    # Создание директории для бэкапов
    create_backup_dir
    
    # Проверка дискового пространства
    check_disk_space
    
    # Выполнение бэкапа
    local db_backup_file=""
    local app_backup_file=""
    local start_time=$(date +%s)
    
    case $backup_type in
        "db")
            db_backup_file=$(backup_database)
            ;;
        "app")
            app_backup_file=$(backup_application)
            ;;
        "full")
            db_backup_file=$(backup_database)
            app_backup_file=$(backup_application)
            ;;
    esac
    
    # Удаление старых бэкапов
    cleanup_old_backups
    
    # Вычисление времени выполнения
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    # Восстановление вывода в тихом режиме
    if [[ "$quiet_mode" == true ]]; then
        exec 1>&3 2>&4
        exec 3>&- 4>&-
    fi
    
    # Итоговый отчёт
    echo ""
    echo "🎉 Резервное копирование завершено успешно!"
    echo "   Время выполнения: ${duration} секунд"
    [[ -n "$db_backup_file" ]] && echo "   База данных: $db_backup_file"
    [[ -n "$app_backup_file" ]] && echo "   Файлы приложения: $app_backup_file"
    echo "   Директория бэкапов: $BACKUP_DIR"
    echo ""
    
    # Отправка уведомления об успешном завершении
    send_notification "SUCCESS" "Резервное копирование завершено за ${duration}с"
}

# Обработка ошибок
trap 'send_notification "ERROR" "Резервное копирование прервано"; error "Резервное копирование прервано"' INT TERM

# Запуск
main "$@" 

# Скрипт резервного копирования для системы учёта пациентов стоматологии

set -e

# Цвета для вывода
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Функции для вывода
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

warn() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

# Настройки по умолчанию
BACKUP_DIR="/var/backups/dental-system"
DB_NAME="dental_backup"
DB_USER="dental_user"
RETENTION_DAYS=30

# Создание директории для бэкапов
create_backup_dir() {
    if [[ ! -d "$BACKUP_DIR" ]]; then
        sudo mkdir -p "$BACKUP_DIR"
        sudo chown $USER:$USER "$BACKUP_DIR"
        log "Создана директория для бэкапов: $BACKUP_DIR"
    fi
}

# Резервное копирование базы данных
backup_database() {
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_file="$BACKUP_DIR/dental_db_backup_$timestamp.sql"
    
    log "Создание резервной копии базы данных..."
    
    # Получение пароля из .env файла
    if [[ -f "server/.env" ]]; then
        DB_PASSWORD=$(grep "DB_PASSWORD=" server/.env | cut -d'=' -f2)
        export PGPASSWORD="$DB_PASSWORD"
    else
        error "Файл server/.env не найден"
    fi
    
    # Создание бэкапа
    pg_dump -h localhost -U "$DB_USER" "$DB_NAME" > "$backup_file"
    
    if [[ -f "$backup_file" ]]; then
        # Сжатие бэкапа
        gzip "$backup_file"
        backup_file="${backup_file}.gz"
        
        local file_size=$(du -h "$backup_file" | cut -f1)
        log "✅ База данных сохранена: $backup_file ($file_size)"
        echo "$backup_file"
    else
        error "Ошибка создания резервной копии базы данных"
    fi
    
    unset PGPASSWORD
}

# Резервное копирование файлов приложения
backup_application() {
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_file="$BACKUP_DIR/dental_app_backup_$timestamp.tar.gz"
    
    log "Создание резервной копии файлов приложения..."
    
    # Создание архива с исключением node_modules и других ненужных файлов
    tar -czf "$backup_file" \
        --exclude='node_modules' \
        --exclude='client/build' \
        --exclude='sessions' \
        --exclude='.git' \
        --exclude='*.log' \
        -C .. "$(basename "$(pwd)")"
    
    if [[ -f "$backup_file" ]]; then
        local file_size=$(du -h "$backup_file" | cut -f1)
        log "✅ Файлы приложения сохранены: $backup_file ($file_size)"
        echo "$backup_file"
    else
        error "Ошибка создания резервной копии файлов"
    fi
}

# Удаление старых бэкапов
cleanup_old_backups() {
    log "Удаление резервных копий старше $RETENTION_DAYS дней..."
    
    local deleted_count=0
    
    # Удаление старых файлов
    if [[ -d "$BACKUP_DIR" ]]; then
        while IFS= read -r -d '' file; do
            rm "$file"
            ((deleted_count++))
        done < <(find "$BACKUP_DIR" -name "dental_*_backup_*.sql.gz" -mtime +$RETENTION_DAYS -print0 2>/dev/null)
        
        while IFS= read -r -d '' file; do
            rm "$file"
            ((deleted_count++))
        done < <(find "$BACKUP_DIR" -name "dental_*_backup_*.tar.gz" -mtime +$RETENTION_DAYS -print0 2>/dev/null)
    fi
    
    if [[ $deleted_count -gt 0 ]]; then
        log "✅ Удалено старых файлов: $deleted_count"
    else
        log "✅ Старые файлы не найдены"
    fi
}

# Проверка дискового пространства
check_disk_space() {
    local available_space=$(df "$BACKUP_DIR" | awk 'NR==2 {print $4}')
    local available_gb=$((available_space / 1024 / 1024))
    
    if [[ $available_gb -lt 1 ]]; then
        warn "Мало свободного места: ${available_gb}GB"
        warn "Рекомендуется освободить место или изменить директорию бэкапов"
    fi
}

# Отправка уведомления (заглушка для будущего расширения)
send_notification() {
    local status=$1
    local message=$2
    
    # Здесь можно добавить отправку уведомлений по email, Telegram и т.д.
    log "Уведомление: $status - $message"
}

# Основная функция
main() {
    local backup_type="full"
    local quiet_mode=false
    
    # Парсинг аргументов
    while [[ $# -gt 0 ]]; do
        case $1 in
            --db-only)
                backup_type="db"
                shift
                ;;
            --app-only)
                backup_type="app"
                shift
                ;;
            --retention)
                RETENTION_DAYS="$2"
                shift 2
                ;;
            --backup-dir)
                BACKUP_DIR="$2"
                shift 2
                ;;
            -q|--quiet)
                quiet_mode=true
                shift
                ;;
            -h|--help)
                echo "Скрипт резервного копирования системы учёта пациентов"
                echo ""
                echo "Использование: $0 [опции]"
                echo ""
                echo "Опции:"
                echo "  --db-only              Только резервная копия базы данных"
                echo "  --app-only             Только резервная копия файлов приложения"
                echo "  --retention DAYS       Количество дней хранения (по умолчанию: 30)"
                echo "  --backup-dir DIR       Директория для бэкапов (по умолчанию: /var/backups/dental-system)"
                echo "  -q, --quiet            Тихий режим"
                echo "  -h, --help             Показать эту справку"
                echo ""
                exit 0
                ;;
            *)
                error "Неизвестная опция: $1"
                ;;
        esac
    done
    
    # Перенаправление вывода в тихом режиме
    if [[ "$quiet_mode" == true ]]; then
        exec 3>&1 4>&2
        exec 1>/dev/null 2>/dev/null
    fi
    
    # Проверка зависимостей
    if ! command -v pg_dump &> /dev/null; then
        error "pg_dump не найден. Установите PostgreSQL клиент."
    fi
    
    if ! command -v tar &> /dev/null; then
        error "tar не найден. Установите tar."
    fi
    
    # Создание директории для бэкапов
    create_backup_dir
    
    # Проверка дискового пространства
    check_disk_space
    
    # Выполнение бэкапа
    local db_backup_file=""
    local app_backup_file=""
    local start_time=$(date +%s)
    
    case $backup_type in
        "db")
            db_backup_file=$(backup_database)
            ;;
        "app")
            app_backup_file=$(backup_application)
            ;;
        "full")
            db_backup_file=$(backup_database)
            app_backup_file=$(backup_application)
            ;;
    esac
    
    # Удаление старых бэкапов
    cleanup_old_backups
    
    # Вычисление времени выполнения
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    # Восстановление вывода в тихом режиме
    if [[ "$quiet_mode" == true ]]; then
        exec 1>&3 2>&4
        exec 3>&- 4>&-
    fi
    
    # Итоговый отчёт
    echo ""
    echo "🎉 Резервное копирование завершено успешно!"
    echo "   Время выполнения: ${duration} секунд"
    [[ -n "$db_backup_file" ]] && echo "   База данных: $db_backup_file"
    [[ -n "$app_backup_file" ]] && echo "   Файлы приложения: $app_backup_file"
    echo "   Директория бэкапов: $BACKUP_DIR"
    echo ""
    
    # Отправка уведомления об успешном завершении
    send_notification "SUCCESS" "Резервное копирование завершено за ${duration}с"
}

# Обработка ошибок
trap 'send_notification "ERROR" "Резервное копирование прервано"; error "Резервное копирование прервано"' INT TERM

# Запуск
main "$@" 