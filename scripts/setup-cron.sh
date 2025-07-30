#!/bin/bash

# Скрипт настройки автоматических резервных копий через cron

set -e

# Цвета для вывода
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

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

# Получение текущей директории проекта
PROJECT_DIR=$(pwd)
BACKUP_SCRIPT="$PROJECT_DIR/scripts/backup.sh"

# Проверка существования скрипта бэкапа
check_backup_script() {
    if [[ ! -f "$BACKUP_SCRIPT" ]]; then
        error "Скрипт backup.sh не найден в $BACKUP_SCRIPT"
    fi
    
    if [[ ! -x "$BACKUP_SCRIPT" ]]; then
        log "Установка прав выполнения для скрипта backup.sh..."
        chmod +x "$BACKUP_SCRIPT"
    fi
}

# Настройка ежедневных резервных копий
setup_daily_backup() {
    log "Настройка ежедневных резервных копий..."
    
    local cron_line="0 2 * * * cd $PROJECT_DIR && $BACKUP_SCRIPT --quiet >/dev/null 2>&1"
    
    # Проверка существования задачи
    if crontab -l 2>/dev/null | grep -F "$BACKUP_SCRIPT" > /dev/null; then
        warn "Задача резервного копирования уже существует в crontab"
        return 0
    fi
    
    # Добавление задачи в crontab
    (crontab -l 2>/dev/null; echo "$cron_line") | crontab -
    
    log "✅ Ежедневные резервные копии настроены (каждый день в 02:00)"
}

# Настройка еженедельных резервных копий
setup_weekly_backup() {
    log "Настройка еженедельных резервных копий..."
    
    local cron_line="0 3 * * 0 cd $PROJECT_DIR && $BACKUP_SCRIPT --quiet >/dev/null 2>&1"
    
    # Проверка существования задачи
    if crontab -l 2>/dev/null | grep -F "0 3 * * 0.*$BACKUP_SCRIPT" > /dev/null; then
        warn "Еженедельная задача резервного копирования уже существует"
        return 0
    fi
    
    # Добавление задачи в crontab
    (crontab -l 2>/dev/null; echo "$cron_line") | crontab -
    
    log "✅ Еженедельные резервные копии настроены (воскресенье в 03:00)"
}

# Настройка логирования cron
setup_cron_logging() {
    log "Настройка логирования cron..."
    
    # Создание директории для логов
    local log_dir="/var/log/dental-backup"
    if [[ ! -d "$log_dir" ]]; then
        sudo mkdir -p "$log_dir"
        sudo chown $USER:$USER "$log_dir"
    fi
    
    # Создание скрипта-обёртки с логированием
    local wrapper_script="$PROJECT_DIR/scripts/backup-wrapper.sh"
    
    cat > "$wrapper_script" << 'EOF'
#!/bin/bash

# Обёртка для backup.sh с логированием

LOG_DIR="/var/log/dental-backup"
LOG_FILE="$LOG_DIR/backup-$(date +%Y%m).log"
PROJECT_DIR="$(dirname "$(dirname "$(readlink -f "$0")")")"
BACKUP_SCRIPT="$PROJECT_DIR/scripts/backup.sh"

# Создание директории для логов
mkdir -p "$LOG_DIR"

# Запуск резервного копирования с логированием
echo "$(date '+%Y-%m-%d %H:%M:%S') - Запуск автоматического резервного копирования" >> "$LOG_FILE"

if cd "$PROJECT_DIR" && "$BACKUP_SCRIPT" --quiet >> "$LOG_FILE" 2>&1; then
    echo "$(date '+%Y-%m-%d %H:%M:%S') - Резервное копирование завершено успешно" >> "$LOG_FILE"
    exit 0
else
    echo "$(date '+%Y-%m-%d %H:%M:%S') - Ошибка резервного копирования" >> "$LOG_FILE"
    exit 1
fi
EOF
    
    chmod +x "$wrapper_script"
    
    log "✅ Логирование cron настроено: $log_dir"
}

# Настройка ротации логов
setup_log_rotation() {
    log "Настройка ротации логов..."
    
    local logrotate_config="/etc/logrotate.d/dental-backup"
    
    # Создание конфигурации logrotate
    sudo tee "$logrotate_config" > /dev/null << 'EOF'
/var/log/dental-backup/*.log {
    monthly
    rotate 12
    compress
    delaycompress
    missingok
    notifempty
    create 644 $USER $USER
}
EOF
    
    log "✅ Ротация логов настроена"
}

# Тестирование резервного копирования
test_backup() {
    log "Тестирование резервного копирования..."
    
    if "$BACKUP_SCRIPT" --db-only --quiet; then
        log "✅ Тестовое резервное копирование прошло успешно"
    else
        error "Ошибка тестового резервного копирования"
    fi
}

# Показ текущих задач cron
show_cron_jobs() {
    echo ""
    echo "📋 Текущие задачи cron для пользователя $USER:"
    echo "=============================================="
    
    if crontab -l 2>/dev/null | grep -v "^#" | grep -v "^$"; then
        crontab -l 2>/dev/null | grep -v "^#" | grep -v "^$" | while read line; do
            echo "  $line"
        done
    else
        echo "  Задачи не найдены"
    fi
    echo ""
}

# Удаление задач cron
remove_cron_jobs() {
    log "Удаление задач резервного копирования из cron..."
    
    local temp_cron=$(mktemp)
    
    # Создание нового crontab без наших задач
    crontab -l 2>/dev/null | grep -v "$BACKUP_SCRIPT" > "$temp_cron" || true
    crontab "$temp_cron"
    rm "$temp_cron"
    
    log "✅ Задачи резервного копирования удалены"
}

# Помощь
show_help() {
    echo "Настройка автоматических резервных копий для системы учёта пациентов"
    echo ""
    echo "Использование: $0 КОМАНДА"
    echo ""
    echo "Команды:"
    echo "  install                 Установить автоматические резервные копии"
    echo "  daily                   Настроить только ежедневные резервные копии"
    echo "  weekly                  Настроить только еженедельные резервные копии"
    echo "  test                    Протестировать резервное копирование"
    echo "  status                  Показать текущие задачи cron"
    echo "  remove                  Удалить автоматические резервные копии"
    echo "  logs                    Показать логи резервного копирования"
    echo ""
    echo "Примеры:"
    echo "  $0 install              Полная установка автоматических резервных копий"
    echo "  $0 daily                Только ежедневные резервные копии в 02:00"
    echo "  $0 test                 Тестовое резервное копирование"
    echo ""
}

# Показ логов
show_logs() {
    local log_dir="/var/log/dental-backup"
    
    if [[ ! -d "$log_dir" ]]; then
        warn "Директория логов не найдена: $log_dir"
        return 1
    fi
    
    echo "📋 Логи резервного копирования:"
    echo "==============================="
    
    # Поиск файлов логов
    local log_files=($(find "$log_dir" -name "backup-*.log" -type f | sort -r))
    
    if [[ ${#log_files[@]} -eq 0 ]]; then
        echo "Логи не найдены"
        return 0
    fi
    
    # Показ последнего лога
    local latest_log="${log_files[0]}"
    echo "Последний лог: $latest_log"
    echo ""
    
    if [[ -f "$latest_log" ]]; then
        tail -20 "$latest_log"
    fi
    
    echo ""
    echo "Доступные логи:"
    for log_file in "${log_files[@]}"; do
        local file_size=$(du -h "$log_file" | cut -f1)
        local file_date=$(stat -c %y "$log_file" | cut -d' ' -f1)
        echo "  $log_file ($file_size, $file_date)"
    done
}

# Основная функция
main() {
    if [[ $# -eq 0 ]]; then
        show_help
        exit 1
    fi
    
    local command="$1"
    
    case "$command" in
        install)
            check_backup_script
            setup_daily_backup
            setup_weekly_backup
            setup_cron_logging
            setup_log_rotation
            test_backup
            show_cron_jobs
            echo "🎉 Автоматические резервные копии настроены!"
            echo ""
            echo "📅 Расписание:"
            echo "   • Ежедневно в 02:00 - полная резервная копия"
            echo "   • Еженедельно в 03:00 (воскресенье) - дополнительная копия"
            echo ""
            echo "📁 Логи: /var/log/dental-backup/"
            echo "🔍 Просмотр логов: $0 logs"
            ;;
        daily)
            check_backup_script
            setup_daily_backup
            setup_cron_logging
            test_backup
            show_cron_jobs
            ;;
        weekly)
            check_backup_script
            setup_weekly_backup
            setup_cron_logging
            test_backup
            show_cron_jobs
            ;;
        test)
            check_backup_script
            test_backup
            ;;
        status)
            show_cron_jobs
            ;;
        remove)
            remove_cron_jobs
            show_cron_jobs
            ;;
        logs)
            show_logs
            ;;
        -h|--help|help)
            show_help
            ;;
        *)
            error "Неизвестная команда: $command. Используйте '$0 --help' для справки."
            ;;
    esac
}

# Проверка запуска от root
if [[ $EUID -eq 0 ]]; then
    error "Не запускайте этот скрипт от имени root!"
fi

# Запуск
main "$@" 

# Скрипт настройки автоматических резервных копий через cron

set -e

# Цвета для вывода
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

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

# Получение текущей директории проекта
PROJECT_DIR=$(pwd)
BACKUP_SCRIPT="$PROJECT_DIR/scripts/backup.sh"

# Проверка существования скрипта бэкапа
check_backup_script() {
    if [[ ! -f "$BACKUP_SCRIPT" ]]; then
        error "Скрипт backup.sh не найден в $BACKUP_SCRIPT"
    fi
    
    if [[ ! -x "$BACKUP_SCRIPT" ]]; then
        log "Установка прав выполнения для скрипта backup.sh..."
        chmod +x "$BACKUP_SCRIPT"
    fi
}

# Настройка ежедневных резервных копий
setup_daily_backup() {
    log "Настройка ежедневных резервных копий..."
    
    local cron_line="0 2 * * * cd $PROJECT_DIR && $BACKUP_SCRIPT --quiet >/dev/null 2>&1"
    
    # Проверка существования задачи
    if crontab -l 2>/dev/null | grep -F "$BACKUP_SCRIPT" > /dev/null; then
        warn "Задача резервного копирования уже существует в crontab"
        return 0
    fi
    
    # Добавление задачи в crontab
    (crontab -l 2>/dev/null; echo "$cron_line") | crontab -
    
    log "✅ Ежедневные резервные копии настроены (каждый день в 02:00)"
}

# Настройка еженедельных резервных копий
setup_weekly_backup() {
    log "Настройка еженедельных резервных копий..."
    
    local cron_line="0 3 * * 0 cd $PROJECT_DIR && $BACKUP_SCRIPT --quiet >/dev/null 2>&1"
    
    # Проверка существования задачи
    if crontab -l 2>/dev/null | grep -F "0 3 * * 0.*$BACKUP_SCRIPT" > /dev/null; then
        warn "Еженедельная задача резервного копирования уже существует"
        return 0
    fi
    
    # Добавление задачи в crontab
    (crontab -l 2>/dev/null; echo "$cron_line") | crontab -
    
    log "✅ Еженедельные резервные копии настроены (воскресенье в 03:00)"
}

# Настройка логирования cron
setup_cron_logging() {
    log "Настройка логирования cron..."
    
    # Создание директории для логов
    local log_dir="/var/log/dental-backup"
    if [[ ! -d "$log_dir" ]]; then
        sudo mkdir -p "$log_dir"
        sudo chown $USER:$USER "$log_dir"
    fi
    
    # Создание скрипта-обёртки с логированием
    local wrapper_script="$PROJECT_DIR/scripts/backup-wrapper.sh"
    
    cat > "$wrapper_script" << 'EOF'
#!/bin/bash

# Обёртка для backup.sh с логированием

LOG_DIR="/var/log/dental-backup"
LOG_FILE="$LOG_DIR/backup-$(date +%Y%m).log"
PROJECT_DIR="$(dirname "$(dirname "$(readlink -f "$0")")")"
BACKUP_SCRIPT="$PROJECT_DIR/scripts/backup.sh"

# Создание директории для логов
mkdir -p "$LOG_DIR"

# Запуск резервного копирования с логированием
echo "$(date '+%Y-%m-%d %H:%M:%S') - Запуск автоматического резервного копирования" >> "$LOG_FILE"

if cd "$PROJECT_DIR" && "$BACKUP_SCRIPT" --quiet >> "$LOG_FILE" 2>&1; then
    echo "$(date '+%Y-%m-%d %H:%M:%S') - Резервное копирование завершено успешно" >> "$LOG_FILE"
    exit 0
else
    echo "$(date '+%Y-%m-%d %H:%M:%S') - Ошибка резервного копирования" >> "$LOG_FILE"
    exit 1
fi
EOF
    
    chmod +x "$wrapper_script"
    
    log "✅ Логирование cron настроено: $log_dir"
}

# Настройка ротации логов
setup_log_rotation() {
    log "Настройка ротации логов..."
    
    local logrotate_config="/etc/logrotate.d/dental-backup"
    
    # Создание конфигурации logrotate
    sudo tee "$logrotate_config" > /dev/null << 'EOF'
/var/log/dental-backup/*.log {
    monthly
    rotate 12
    compress
    delaycompress
    missingok
    notifempty
    create 644 $USER $USER
}
EOF
    
    log "✅ Ротация логов настроена"
}

# Тестирование резервного копирования
test_backup() {
    log "Тестирование резервного копирования..."
    
    if "$BACKUP_SCRIPT" --db-only --quiet; then
        log "✅ Тестовое резервное копирование прошло успешно"
    else
        error "Ошибка тестового резервного копирования"
    fi
}

# Показ текущих задач cron
show_cron_jobs() {
    echo ""
    echo "📋 Текущие задачи cron для пользователя $USER:"
    echo "=============================================="
    
    if crontab -l 2>/dev/null | grep -v "^#" | grep -v "^$"; then
        crontab -l 2>/dev/null | grep -v "^#" | grep -v "^$" | while read line; do
            echo "  $line"
        done
    else
        echo "  Задачи не найдены"
    fi
    echo ""
}

# Удаление задач cron
remove_cron_jobs() {
    log "Удаление задач резервного копирования из cron..."
    
    local temp_cron=$(mktemp)
    
    # Создание нового crontab без наших задач
    crontab -l 2>/dev/null | grep -v "$BACKUP_SCRIPT" > "$temp_cron" || true
    crontab "$temp_cron"
    rm "$temp_cron"
    
    log "✅ Задачи резервного копирования удалены"
}

# Помощь
show_help() {
    echo "Настройка автоматических резервных копий для системы учёта пациентов"
    echo ""
    echo "Использование: $0 КОМАНДА"
    echo ""
    echo "Команды:"
    echo "  install                 Установить автоматические резервные копии"
    echo "  daily                   Настроить только ежедневные резервные копии"
    echo "  weekly                  Настроить только еженедельные резервные копии"
    echo "  test                    Протестировать резервное копирование"
    echo "  status                  Показать текущие задачи cron"
    echo "  remove                  Удалить автоматические резервные копии"
    echo "  logs                    Показать логи резервного копирования"
    echo ""
    echo "Примеры:"
    echo "  $0 install              Полная установка автоматических резервных копий"
    echo "  $0 daily                Только ежедневные резервные копии в 02:00"
    echo "  $0 test                 Тестовое резервное копирование"
    echo ""
}

# Показ логов
show_logs() {
    local log_dir="/var/log/dental-backup"
    
    if [[ ! -d "$log_dir" ]]; then
        warn "Директория логов не найдена: $log_dir"
        return 1
    fi
    
    echo "📋 Логи резервного копирования:"
    echo "==============================="
    
    # Поиск файлов логов
    local log_files=($(find "$log_dir" -name "backup-*.log" -type f | sort -r))
    
    if [[ ${#log_files[@]} -eq 0 ]]; then
        echo "Логи не найдены"
        return 0
    fi
    
    # Показ последнего лога
    local latest_log="${log_files[0]}"
    echo "Последний лог: $latest_log"
    echo ""
    
    if [[ -f "$latest_log" ]]; then
        tail -20 "$latest_log"
    fi
    
    echo ""
    echo "Доступные логи:"
    for log_file in "${log_files[@]}"; do
        local file_size=$(du -h "$log_file" | cut -f1)
        local file_date=$(stat -c %y "$log_file" | cut -d' ' -f1)
        echo "  $log_file ($file_size, $file_date)"
    done
}

# Основная функция
main() {
    if [[ $# -eq 0 ]]; then
        show_help
        exit 1
    fi
    
    local command="$1"
    
    case "$command" in
        install)
            check_backup_script
            setup_daily_backup
            setup_weekly_backup
            setup_cron_logging
            setup_log_rotation
            test_backup
            show_cron_jobs
            echo "🎉 Автоматические резервные копии настроены!"
            echo ""
            echo "📅 Расписание:"
            echo "   • Ежедневно в 02:00 - полная резервная копия"
            echo "   • Еженедельно в 03:00 (воскресенье) - дополнительная копия"
            echo ""
            echo "📁 Логи: /var/log/dental-backup/"
            echo "🔍 Просмотр логов: $0 logs"
            ;;
        daily)
            check_backup_script
            setup_daily_backup
            setup_cron_logging
            test_backup
            show_cron_jobs
            ;;
        weekly)
            check_backup_script
            setup_weekly_backup
            setup_cron_logging
            test_backup
            show_cron_jobs
            ;;
        test)
            check_backup_script
            test_backup
            ;;
        status)
            show_cron_jobs
            ;;
        remove)
            remove_cron_jobs
            show_cron_jobs
            ;;
        logs)
            show_logs
            ;;
        -h|--help|help)
            show_help
            ;;
        *)
            error "Неизвестная команда: $command. Используйте '$0 --help' для справки."
            ;;
    esac
}

# Проверка запуска от root
if [[ $EUID -eq 0 ]]; then
    error "Не запускайте этот скрипт от имени root!"
fi

# Запуск
main "$@" 