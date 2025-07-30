#!/bin/bash

# Резервная система учёта пациентов стоматологии
# Скрипт удаленной установки одной командой
# Использование: bash <(curl -Ls https://raw.githubusercontent.com/TagirVst/dentalminilocalsystem/main/remote_install.sh)

set -e  # Остановить при любой ошибке

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Функции для вывода
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

info() {
    echo -e "${BLUE}[INFO] $1${NC}"
}

# Конфигурация
REPO_URL="https://github.com/TagirVst/dentalminilocalsystem"
PROJECT_NAME="dentalminilocalsystem"

# Определяем директорию установки в зависимости от пользователя
if [[ $EUID -eq 0 ]]; then
    INSTALL_DIR="/root/$PROJECT_NAME"
else
    INSTALL_DIR="$HOME/$PROJECT_NAME"
fi

# Проверка операционной системы
check_os() {
    log "Проверка операционной системы..."
    
    if [[ ! -f /etc/os-release ]]; then
        error "Невозможно определить операционную систему"
    fi
    
    . /etc/os-release
    
    if [[ "$ID" != "ubuntu" ]]; then
        warn "Скрипт оптимизирован для Ubuntu. Обнаружена: $ID"
        warn "Установка может работать некорректно"
    fi
    
    log "✅ Операционная система: $ID $VERSION_ID"
}

# Проверка зависимостей
check_dependencies() {
    log "Проверка зависимостей для скачивания..."
    
    # Обновляем список пакетов если нужно
    if ! command -v curl >/dev/null 2>&1 && ! command -v wget >/dev/null 2>&1; then
        log "Установка базовых зависимостей..."
        if command -v apt-get >/dev/null 2>&1; then
            sudo apt-get update
            sudo apt-get install -y curl wget
        else
            error "Менеджер пакетов apt-get не найден"
        fi
    fi
    
    # Проверяем git
    if ! command -v git >/dev/null 2>&1; then
        log "Установка git..."
        sudo apt-get install -y git
    fi
    
    log "✅ Базовые зависимости готовы"
}

# Скачивание проекта
download_project() {
    log "Скачивание проекта..."
    
    # Создаем резервную копию если директория существует
    if [ -d "$INSTALL_DIR" ]; then
        warn "Директория $INSTALL_DIR уже существует. Удаляем..."
        rm -rf "$INSTALL_DIR"
    fi
    
    # Отключаем все запросы аутентификации Git
    export GIT_TERMINAL_PROMPT=0
    export GIT_ASKPASS=/bin/echo
    export SSH_ASKPASS=/bin/echo
    unset SSH_ASKPASS
    
    # Клонируем через git
    log "Клонирование репозитория..."
    cd "$(dirname "$INSTALL_DIR")"
    
    # Сначала пробуем обычное клонирование
    if ! git clone "$REPO_URL.git" "$PROJECT_NAME" 2>/dev/null; then
        log "Обычное клонирование не удалось, пробуем альтернативные методы..."
        
        # Пробуем с отключенной проверкой SSL
        if ! git -c http.sslVerify=false clone "$REPO_URL.git" "$PROJECT_NAME" 2>/dev/null; then
            log "Git клонирование не удалось, используем curl для загрузки архива..."
            
            # Если git не работает, скачиваем архив
            if command -v curl >/dev/null 2>&1; then
                curl -sL "$REPO_URL/archive/refs/heads/main.tar.gz" | tar -xz
                mv "dentalminilocalsystem-main" "$PROJECT_NAME" 2>/dev/null || mv "dental-system-main" "$PROJECT_NAME" 2>/dev/null || error "Не удалось переименовать директорию"
            elif command -v wget >/dev/null 2>&1; then
                wget -qO- "$REPO_URL/archive/refs/heads/main.tar.gz" | tar -xz
                mv "dentalminilocalsystem-main" "$PROJECT_NAME" 2>/dev/null || mv "dental-system-main" "$PROJECT_NAME" 2>/dev/null || error "Не удалось переименовать директорию"
            else
                error "Не удалось скачать проект. Установите curl или wget."
            fi
        fi
    fi
    
    if [ ! -d "$INSTALL_DIR" ]; then
        error "Не удалось скачать проект"
    fi
    
    log "✅ Проект успешно скачан в $INSTALL_DIR"
}

# Проверка системных требований
check_system_requirements() {
    log "Проверка системных требований..."
    
    # Проверка RAM (минимум 1GB, рекомендуется 2GB)
    TOTAL_RAM=$(free -m | awk 'NR==2{printf "%.1f", $2/1024}')
    if (( $(echo "$TOTAL_RAM < 1" | bc -l) )); then
        error "Недостаточно оперативной памяти: ${TOTAL_RAM}GB (минимум 1GB)"
    elif (( $(echo "$TOTAL_RAM < 2" | bc -l) )); then
        warn "Мало оперативной памяти: ${TOTAL_RAM}GB (рекомендуется 2GB)"
    fi
    
    # Проверка свободного места (минимум 3GB)
    AVAILABLE_SPACE=$(df -BG "$(dirname "$INSTALL_DIR")" 2>/dev/null | awk 'NR==2 {print $4}' | sed 's/G//' || echo "10")
    if [[ $AVAILABLE_SPACE -lt 3 ]]; then
        warn "Мало свободного места: ${AVAILABLE_SPACE}GB (рекомендуется минимум 3GB)"
    fi
    
    log "✅ Системные требования: RAM ${TOTAL_RAM}GB, Диск ${AVAILABLE_SPACE}GB"
}

# Установка Node.js
install_nodejs() {
    log "Проверка и установка Node.js..."
    
    # Проверка существующей установки
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
        if [[ "$NODE_VERSION" -ge 18 ]]; then
            log "✅ Node.js уже установлен (версия: $(node -v))"
            return
        else
            warn "Обнаружена старая версия Node.js ($(node -v)). Обновляем..."
        fi
    fi
    
    # Установка Node.js 18
    log "Установка Node.js 18..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
    
    # Проверка установки
    if command -v node &> /dev/null && command -v npm &> /dev/null; then
        log "✅ Node.js установлен: $(node -v)"
        log "✅ NPM установлен: $(npm -v)"
    else
        error "Ошибка установки Node.js"
    fi
}

# Установка PostgreSQL
install_postgresql() {
    log "Проверка и установка PostgreSQL..."
    
    # Проверка существующей установки
    if command -v psql &> /dev/null; then
        if sudo systemctl is-active --quiet postgresql; then
            log "✅ PostgreSQL уже установлен и запущен"
        else
            log "PostgreSQL установлен, запускаем сервис..."
            sudo systemctl start postgresql
            sudo systemctl enable postgresql
        fi
    else
        log "Установка PostgreSQL..."
        sudo apt install -y postgresql postgresql-contrib
        sudo systemctl start postgresql
        sudo systemctl enable postgresql
        log "✅ PostgreSQL установлен и запущен"
    fi
}

# Запуск установки
run_installation() {
    log "Запуск полной установки системы..."
    
    cd "$INSTALL_DIR"
    
    if [ ! -f "install.sh" ]; then
        error "Файл install.sh не найден в проекте"
    fi
    
    # Делаем скрипт исполняемым
    chmod +x install.sh
    
    # Запускаем установку с автоматическим подтверждением
    log "Запуск install.sh с автоматическими настройками..."
    if ! ./install.sh -y; then
        error "Ошибка выполнения установки. Проверьте логи выше."
    fi
}

# Главная функция
main() {
    echo -e "${BLUE}"
    echo "================================================================"
    echo "    Резервная система учёта пациентов стоматологии"
    echo "                Автоматическая установка"
    echo "================================================================"
    echo -e "${NC}"
    
    info "Начинаем установку в директорию: $INSTALL_DIR"
    
    # Проверяем, не запущен ли скрипт уже от root, если нужны sudo права
    if [[ $EUID -ne 0 ]] && ! sudo -n true 2>/dev/null; then
        info "Для установки требуются права администратора (sudo)"
        info "Возможно потребуется ввести пароль"
        echo ""
    fi
    
    # Выполнение установки
    check_os
    check_system_requirements
    check_dependencies
    download_project
    
    # Установка системных зависимостей
    install_nodejs
    install_postgresql
    
    # Запуск основной установки
    run_installation
    
    echo ""
    echo -e "${GREEN}"
    echo "================================================================"
    echo "                 УСТАНОВКА ЗАВЕРШЕНА!"
    echo "================================================================"
    echo -e "${NC}"
    
    log "Проект установлен в: $INSTALL_DIR"
    log "Система должна быть доступна по адресу: http://localhost:5000"
    
    # Получение IP адреса для показа пользователю
    LOCAL_IP=$(hostname -I | awk '{print $1}' 2>/dev/null || echo "localhost")
    if [[ "$LOCAL_IP" != "localhost" ]]; then
        log "Или по локальному IP: http://$LOCAL_IP:5000"
    fi
    
    echo ""
    info "Проверьте статус системы: sudo systemctl status dental-backup"
    info "Просмотр логов: sudo journalctl -u dental-backup -f"
    info "Документация: $INSTALL_DIR/README.md"
    echo ""
}

# Запуск
main "$@"