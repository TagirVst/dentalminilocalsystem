#!/bin/bash

# Скрипт управления резервной системой учёта пациентов стоматологии

# Цвета для вывода
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SERVICE_NAME="dental-backup"

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

info() {
    echo -e "${BLUE}[INFO] $1${NC}"
}

# Проверка статуса сервиса
check_service_status() {
    if systemctl is-active --quiet "$SERVICE_NAME"; then
        echo "running"
    else
        echo "stopped"
    fi
}

# Команда: статус
status() {
    echo "🦷 Статус резервной системы учёта пациентов стоматологии"
    echo "=========================================================="
    echo ""
    
    # Статус сервиса
    local service_status=$(check_service_status)
    if [[ "$service_status" == "running" ]]; then
        echo -e "Статус сервиса: ${GREEN}Запущен${NC}"
    else
        echo -e "Статус сервиса: ${RED}Остановлен${NC}"
    fi
    
    # Информация о сервисе
    echo "Имя сервиса: $SERVICE_NAME"
    echo "Пользователь: $(systemctl show -p User --value $SERVICE_NAME 2>/dev/null || echo 'unknown')"
    echo "Рабочая директория: $(systemctl show -p WorkingDirectory --value $SERVICE_NAME 2>/dev/null || echo 'unknown')"
    
    # Время работы
    if [[ "$service_status" == "running" ]]; then
        local uptime=$(systemctl show -p ActiveEnterTimestamp --value $SERVICE_NAME 2>/dev/null)
        if [[ -n "$uptime" ]]; then
            echo "Время запуска: $uptime"
        fi
    fi
    
    echo ""
    
    # Статус PostgreSQL
    if systemctl is-active --quiet postgresql; then
        echo -e "PostgreSQL: ${GREEN}Запущен${NC}"
    else
        echo -e "PostgreSQL: ${RED}Остановлен${NC}"
    fi
    
    # Проверка портов
    echo ""
    echo "Сетевые подключения:"
    if netstat -tuln 2>/dev/null | grep -q ":5000 "; then
        echo -e "Порт 5000: ${GREEN}Открыт${NC}"
    else
        echo -e "Порт 5000: ${RED}Закрыт${NC}"
    fi
    
    if netstat -tuln 2>/dev/null | grep -q ":5432 "; then
        echo -e "Порт 5432 (PostgreSQL): ${GREEN}Открыт${NC}"
    else
        echo -e "Порт 5432 (PostgreSQL): ${RED}Закрыт${NC}"
    fi
    
    # Использование ресурсов
    echo ""
    echo "Ресурсы системы:"
    echo "RAM: $(free -h | awk 'NR==2{printf "Использовано: %s из %s (%.1f%%)", $3, $2, $3/$2*100}')"
    echo "Диск: $(df -h . | awk 'NR==2{printf "Использовано: %s из %s (%s)", $3, $2, $5}')"
    
    # URL доступа
    echo ""
    echo "URL доступа:"
    local local_ip=$(hostname -I | awk '{print $1}')
    echo "• Локальный IP: http://$local_ip:5000"
    echo "• Настроенный IP: http://192.168.2.67:5000"
}

# Команда: запуск
start() {
    local service_status=$(check_service_status)
    
    if [[ "$service_status" == "running" ]]; then
        warn "Сервис уже запущен"
        return 0
    fi
    
    log "Запуск системы..."
    
    # Проверка зависимостей
    if ! systemctl is-active --quiet postgresql; then
        log "Запуск PostgreSQL..."
        sudo systemctl start postgresql
    fi
    
    # Запуск основного сервиса
    sudo systemctl start "$SERVICE_NAME"
    
    # Ожидание запуска
    sleep 3
    
    if [[ $(check_service_status) == "running" ]]; then
        log "✅ Система успешно запущена"
        
        # Проверка доступности
        local max_attempts=10
        local attempt=1
        
        while [[ $attempt -le $max_attempts ]]; do
            if curl -s -o /dev/null -w "%{http_code}" http://localhost:5000 | grep -q "200\|302\|404"; then
                log "✅ Веб-интерфейс доступен"
                break
            fi
            
            if [[ $attempt -eq $max_attempts ]]; then
                warn "Веб-интерфейс недоступен после $max_attempts попыток"
            else
                echo -n "."
                sleep 2
                ((attempt++))
            fi
        done
    else
        error "Ошибка запуска системы"
    fi
}

# Команда: остановка
stop() {
    local service_status=$(check_service_status)
    
    if [[ "$service_status" == "stopped" ]]; then
        warn "Сервис уже остановлен"
        return 0
    fi
    
    log "Остановка системы..."
    
    sudo systemctl stop "$SERVICE_NAME"
    
    # Ожидание остановки
    sleep 2
    
    if [[ $(check_service_status) == "stopped" ]]; then
        log "✅ Система успешно остановлена"
    else
        error "Ошибка остановки системы"
    fi
}

# Команда: перезапуск
restart() {
    log "Перезапуск системы..."
    stop
    sleep 2
    start
}

# Команда: логи
logs() {
    local follow=false
    local lines=50
    
    # Парсинг аргументов для логов
    while [[ $# -gt 0 ]]; do
        case $1 in
            -f|--follow)
                follow=true
                shift
                ;;
            -n|--lines)
                lines="$2"
                shift 2
                ;;
            *)
                break
                ;;
        esac
    done
    
    echo "📋 Логи системы (последние $lines строк):"
    echo "========================================"
    
    if [[ "$follow" == true ]]; then
        sudo journalctl -u "$SERVICE_NAME" -n "$lines" -f
    else
        sudo journalctl -u "$SERVICE_NAME" -n "$lines" --no-pager
    fi
}

# Команда: диагностика
diagnose() {
    echo "🔍 Диагностика системы"
    echo "======================"
    echo ""
    
    # Проверка файлов конфигурации
    log "Проверка конфигурации..."
    
    if [[ -f "server/.env" ]]; then
        echo "✅ Файл server/.env существует"
    else
        echo "❌ Файл server/.env отсутствует"
    fi
    
    if [[ -f "package.json" ]]; then
        echo "✅ Файл package.json существует"
    else
        echo "❌ Файл package.json отсутствует"
    fi
    
    # Проверка зависимостей
    echo ""
    log "Проверка зависимостей..."
    
    if command -v node &> /dev/null; then
        echo "✅ Node.js: $(node -v)"
    else
        echo "❌ Node.js не установлен"
    fi
    
    if command -v npm &> /dev/null; then
        echo "✅ NPM: $(npm -v)"
    else
        echo "❌ NPM не установлен"
    fi
    
    if command -v psql &> /dev/null; then
        echo "✅ PostgreSQL клиент установлен"
    else
        echo "❌ PostgreSQL клиент не установлен"
    fi
    
    # Проверка подключения к БД
    echo ""
    log "Проверка базы данных..."
    
    if [[ -f "server/.env" ]]; then
        source server/.env
        export PGPASSWORD="$DB_PASSWORD"
        
        if psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" &>/dev/null; then
            echo "✅ Подключение к базе данных успешно"
        else
            echo "❌ Ошибка подключения к базе данных"
        fi
        
        unset PGPASSWORD
    else
        echo "❌ Невозможно проверить БД (отсутствует .env файл)"
    fi
    
    # Проверка сетевых портов
    echo ""
    log "Проверка сетевых портов..."
    
    if netstat -tuln 2>/dev/null | grep -q ":5000 "; then
        echo "✅ Порт 5000 открыт"
    else
        echo "❌ Порт 5000 закрыт"
    fi
    
    # Проверка свободного места
    echo ""
    log "Проверка дискового пространства..."
    
    local available_space=$(df -BG . | awk 'NR==2 {print $4}' | sed 's/G//')
    if [[ $available_space -gt 1 ]]; then
        echo "✅ Свободного места: ${available_space}GB"
    else
        echo "⚠️ Мало свободного места: ${available_space}GB"
    fi
    
    # Последние ошибки в логах
    echo ""
    log "Последние ошибки в логах:"
    sudo journalctl -u "$SERVICE_NAME" -n 5 --no-pager | grep -i error || echo "Ошибок не найдено"
}

# Команда: обновление
update() {
    log "Обновление системы..."
    
    # Остановка сервиса
    if [[ $(check_service_status) == "running" ]]; then
        stop
    fi
    
    # Создание резервной копии
    log "Создание резервной копии..."
    if [[ -f "scripts/backup.sh" ]]; then
        bash scripts/backup.sh --quiet
    fi
    
    # Обновление зависимостей
    log "Обновление зависимостей..."
    npm install
    cd server && npm install && cd ..
    cd client && npm install && cd ..
    
    # Запуск миграций
    log "Запуск миграций..."
    cd server && npm run migrate && cd ..
    
    # Сборка frontend
    log "Сборка frontend..."
    cd client && npm run build && cd ..
    
    # Перезапуск сервиса
    start
    
    log "✅ Обновление завершено"
}

# Помощь
show_help() {
    echo "Управление резервной системой учёта пациентов стоматологии"
    echo ""
    echo "Использование: $0 КОМАНДА [опции]"
    echo ""
    echo "Команды:"
    echo "  start                   Запустить систему"
    echo "  stop                    Остановить систему"
    echo "  restart                 Перезапустить систему"
    echo "  status                  Показать статус системы"
    echo "  logs [опции]            Показать логи"
    echo "  diagnose                Диагностика системы"
    echo "  update                  Обновить систему"
    echo "  backup                  Создать резервную копию"
    echo ""
    echo "Опции для logs:"
    echo "  -f, --follow            Следить за логами в реальном времени"
    echo "  -n, --lines NUMBER      Количество строк (по умолчанию: 50)"
    echo ""
    echo "Примеры:"
    echo "  $0 start                Запустить систему"
    echo "  $0 logs -f              Следить за логами"
    echo "  $0 logs -n 100          Показать последние 100 строк логов"
    echo ""
}

# Основная функция
main() {
    if [[ $# -eq 0 ]]; then
        show_help
        exit 1
    fi
    
    local command="$1"
    shift
    
    case "$command" in
        start)
            start "$@"
            ;;
        stop)
            stop "$@"
            ;;
        restart)
            restart "$@"
            ;;
        status)
            status "$@"
            ;;
        logs)
            logs "$@"
            ;;
        diagnose)
            diagnose "$@"
            ;;
        update)
            update "$@"
            ;;
        backup)
            if [[ -f "scripts/backup.sh" ]]; then
                bash scripts/backup.sh "$@"
            else
                error "Скрипт резервного копирования не найден"
            fi
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

# Скрипт управления резервной системой учёта пациентов стоматологии

# Цвета для вывода
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SERVICE_NAME="dental-backup"

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

info() {
    echo -e "${BLUE}[INFO] $1${NC}"
}

# Проверка статуса сервиса
check_service_status() {
    if systemctl is-active --quiet "$SERVICE_NAME"; then
        echo "running"
    else
        echo "stopped"
    fi
}

# Команда: статус
status() {
    echo "🦷 Статус резервной системы учёта пациентов стоматологии"
    echo "=========================================================="
    echo ""
    
    # Статус сервиса
    local service_status=$(check_service_status)
    if [[ "$service_status" == "running" ]]; then
        echo -e "Статус сервиса: ${GREEN}Запущен${NC}"
    else
        echo -e "Статус сервиса: ${RED}Остановлен${NC}"
    fi
    
    # Информация о сервисе
    echo "Имя сервиса: $SERVICE_NAME"
    echo "Пользователь: $(systemctl show -p User --value $SERVICE_NAME 2>/dev/null || echo 'unknown')"
    echo "Рабочая директория: $(systemctl show -p WorkingDirectory --value $SERVICE_NAME 2>/dev/null || echo 'unknown')"
    
    # Время работы
    if [[ "$service_status" == "running" ]]; then
        local uptime=$(systemctl show -p ActiveEnterTimestamp --value $SERVICE_NAME 2>/dev/null)
        if [[ -n "$uptime" ]]; then
            echo "Время запуска: $uptime"
        fi
    fi
    
    echo ""
    
    # Статус PostgreSQL
    if systemctl is-active --quiet postgresql; then
        echo -e "PostgreSQL: ${GREEN}Запущен${NC}"
    else
        echo -e "PostgreSQL: ${RED}Остановлен${NC}"
    fi
    
    # Проверка портов
    echo ""
    echo "Сетевые подключения:"
    if netstat -tuln 2>/dev/null | grep -q ":5000 "; then
        echo -e "Порт 5000: ${GREEN}Открыт${NC}"
    else
        echo -e "Порт 5000: ${RED}Закрыт${NC}"
    fi
    
    if netstat -tuln 2>/dev/null | grep -q ":5432 "; then
        echo -e "Порт 5432 (PostgreSQL): ${GREEN}Открыт${NC}"
    else
        echo -e "Порт 5432 (PostgreSQL): ${RED}Закрыт${NC}"
    fi
    
    # Использование ресурсов
    echo ""
    echo "Ресурсы системы:"
    echo "RAM: $(free -h | awk 'NR==2{printf "Использовано: %s из %s (%.1f%%)", $3, $2, $3/$2*100}')"
    echo "Диск: $(df -h . | awk 'NR==2{printf "Использовано: %s из %s (%s)", $3, $2, $5}')"
    
    # URL доступа
    echo ""
    echo "URL доступа:"
    local local_ip=$(hostname -I | awk '{print $1}')
    echo "• Локальный IP: http://$local_ip:5000"
    echo "• Настроенный IP: http://192.168.2.67:5000"
}

# Команда: запуск
start() {
    local service_status=$(check_service_status)
    
    if [[ "$service_status" == "running" ]]; then
        warn "Сервис уже запущен"
        return 0
    fi
    
    log "Запуск системы..."
    
    # Проверка зависимостей
    if ! systemctl is-active --quiet postgresql; then
        log "Запуск PostgreSQL..."
        sudo systemctl start postgresql
    fi
    
    # Запуск основного сервиса
    sudo systemctl start "$SERVICE_NAME"
    
    # Ожидание запуска
    sleep 3
    
    if [[ $(check_service_status) == "running" ]]; then
        log "✅ Система успешно запущена"
        
        # Проверка доступности
        local max_attempts=10
        local attempt=1
        
        while [[ $attempt -le $max_attempts ]]; do
            if curl -s -o /dev/null -w "%{http_code}" http://localhost:5000 | grep -q "200\|302\|404"; then
                log "✅ Веб-интерфейс доступен"
                break
            fi
            
            if [[ $attempt -eq $max_attempts ]]; then
                warn "Веб-интерфейс недоступен после $max_attempts попыток"
            else
                echo -n "."
                sleep 2
                ((attempt++))
            fi
        done
    else
        error "Ошибка запуска системы"
    fi
}

# Команда: остановка
stop() {
    local service_status=$(check_service_status)
    
    if [[ "$service_status" == "stopped" ]]; then
        warn "Сервис уже остановлен"
        return 0
    fi
    
    log "Остановка системы..."
    
    sudo systemctl stop "$SERVICE_NAME"
    
    # Ожидание остановки
    sleep 2
    
    if [[ $(check_service_status) == "stopped" ]]; then
        log "✅ Система успешно остановлена"
    else
        error "Ошибка остановки системы"
    fi
}

# Команда: перезапуск
restart() {
    log "Перезапуск системы..."
    stop
    sleep 2
    start
}

# Команда: логи
logs() {
    local follow=false
    local lines=50
    
    # Парсинг аргументов для логов
    while [[ $# -gt 0 ]]; do
        case $1 in
            -f|--follow)
                follow=true
                shift
                ;;
            -n|--lines)
                lines="$2"
                shift 2
                ;;
            *)
                break
                ;;
        esac
    done
    
    echo "📋 Логи системы (последние $lines строк):"
    echo "========================================"
    
    if [[ "$follow" == true ]]; then
        sudo journalctl -u "$SERVICE_NAME" -n "$lines" -f
    else
        sudo journalctl -u "$SERVICE_NAME" -n "$lines" --no-pager
    fi
}

# Команда: диагностика
diagnose() {
    echo "🔍 Диагностика системы"
    echo "======================"
    echo ""
    
    # Проверка файлов конфигурации
    log "Проверка конфигурации..."
    
    if [[ -f "server/.env" ]]; then
        echo "✅ Файл server/.env существует"
    else
        echo "❌ Файл server/.env отсутствует"
    fi
    
    if [[ -f "package.json" ]]; then
        echo "✅ Файл package.json существует"
    else
        echo "❌ Файл package.json отсутствует"
    fi
    
    # Проверка зависимостей
    echo ""
    log "Проверка зависимостей..."
    
    if command -v node &> /dev/null; then
        echo "✅ Node.js: $(node -v)"
    else
        echo "❌ Node.js не установлен"
    fi
    
    if command -v npm &> /dev/null; then
        echo "✅ NPM: $(npm -v)"
    else
        echo "❌ NPM не установлен"
    fi
    
    if command -v psql &> /dev/null; then
        echo "✅ PostgreSQL клиент установлен"
    else
        echo "❌ PostgreSQL клиент не установлен"
    fi
    
    # Проверка подключения к БД
    echo ""
    log "Проверка базы данных..."
    
    if [[ -f "server/.env" ]]; then
        source server/.env
        export PGPASSWORD="$DB_PASSWORD"
        
        if psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" &>/dev/null; then
            echo "✅ Подключение к базе данных успешно"
        else
            echo "❌ Ошибка подключения к базе данных"
        fi
        
        unset PGPASSWORD
    else
        echo "❌ Невозможно проверить БД (отсутствует .env файл)"
    fi
    
    # Проверка сетевых портов
    echo ""
    log "Проверка сетевых портов..."
    
    if netstat -tuln 2>/dev/null | grep -q ":5000 "; then
        echo "✅ Порт 5000 открыт"
    else
        echo "❌ Порт 5000 закрыт"
    fi
    
    # Проверка свободного места
    echo ""
    log "Проверка дискового пространства..."
    
    local available_space=$(df -BG . | awk 'NR==2 {print $4}' | sed 's/G//')
    if [[ $available_space -gt 1 ]]; then
        echo "✅ Свободного места: ${available_space}GB"
    else
        echo "⚠️ Мало свободного места: ${available_space}GB"
    fi
    
    # Последние ошибки в логах
    echo ""
    log "Последние ошибки в логах:"
    sudo journalctl -u "$SERVICE_NAME" -n 5 --no-pager | grep -i error || echo "Ошибок не найдено"
}

# Команда: обновление
update() {
    log "Обновление системы..."
    
    # Остановка сервиса
    if [[ $(check_service_status) == "running" ]]; then
        stop
    fi
    
    # Создание резервной копии
    log "Создание резервной копии..."
    if [[ -f "scripts/backup.sh" ]]; then
        bash scripts/backup.sh --quiet
    fi
    
    # Обновление зависимостей
    log "Обновление зависимостей..."
    npm install
    cd server && npm install && cd ..
    cd client && npm install && cd ..
    
    # Запуск миграций
    log "Запуск миграций..."
    cd server && npm run migrate && cd ..
    
    # Сборка frontend
    log "Сборка frontend..."
    cd client && npm run build && cd ..
    
    # Перезапуск сервиса
    start
    
    log "✅ Обновление завершено"
}

# Помощь
show_help() {
    echo "Управление резервной системой учёта пациентов стоматологии"
    echo ""
    echo "Использование: $0 КОМАНДА [опции]"
    echo ""
    echo "Команды:"
    echo "  start                   Запустить систему"
    echo "  stop                    Остановить систему"
    echo "  restart                 Перезапустить систему"
    echo "  status                  Показать статус системы"
    echo "  logs [опции]            Показать логи"
    echo "  diagnose                Диагностика системы"
    echo "  update                  Обновить систему"
    echo "  backup                  Создать резервную копию"
    echo ""
    echo "Опции для logs:"
    echo "  -f, --follow            Следить за логами в реальном времени"
    echo "  -n, --lines NUMBER      Количество строк (по умолчанию: 50)"
    echo ""
    echo "Примеры:"
    echo "  $0 start                Запустить систему"
    echo "  $0 logs -f              Следить за логами"
    echo "  $0 logs -n 100          Показать последние 100 строк логов"
    echo ""
}

# Основная функция
main() {
    if [[ $# -eq 0 ]]; then
        show_help
        exit 1
    fi
    
    local command="$1"
    shift
    
    case "$command" in
        start)
            start "$@"
            ;;
        stop)
            stop "$@"
            ;;
        restart)
            restart "$@"
            ;;
        status)
            status "$@"
            ;;
        logs)
            logs "$@"
            ;;
        diagnose)
            diagnose "$@"
            ;;
        update)
            update "$@"
            ;;
        backup)
            if [[ -f "scripts/backup.sh" ]]; then
                bash scripts/backup.sh "$@"
            else
                error "Скрипт резервного копирования не найден"
            fi
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