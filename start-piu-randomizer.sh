#!/usr/bin/env bash
# PIU Randomizer - inicio do backend + frontend
set -u

SCRIPT="$(readlink -f "${BASH_SOURCE[0]}")"
PROJECT_DIR="$(cd "$(dirname "$SCRIPT")" && pwd)"
LOG_DIR="$PROJECT_DIR/.runtime"
mkdir -p "$LOG_DIR"

export PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"

# Garante que o PostgreSQL esteja de pe
if ! pg_isready -h localhost -p 5432 >/dev/null 2>&1; then
    if systemctl is-active --quiet postgresql 2>/dev/null; then
        : # ja esta rodando
    elif command -v systemctl >/dev/null 2>&1 && systemctl start postgresql 2>/dev/null; then
        echo "[postgres] iniciado via systemctl"
    fi
fi

start_if_down() {
    local port="$1"
    local name="$2"
    local dir="$3"

    if curl -sf "http://localhost:$port" >/dev/null 2>&1; then
        echo "[$name] ja esta rodando em http://localhost:$port"
    else
        echo "[$name] iniciando em http://localhost:$port ..."
        nohup bash -c "cd '$dir' && exec npm run dev" >"$LOG_DIR/$name.log" 2>&1 &
        disown
    fi
}

start_if_down 3000 backend "$PROJECT_DIR/backend"
start_if_down 5173 frontend "$PROJECT_DIR/frontend"

# Espera o backend responder (ate ~60s)
for _ in $(seq 1 60); do
    curl -sf http://localhost:3000 >/dev/null 2>&1 && break
    sleep 1
done

sleep 2

# Abre a interface
xdg-open http://localhost:5173 >/dev/null 2>&1

echo "PIU Randomizer pronto em http://localhost:5173"
echo "Logs: $LOG_DIR"