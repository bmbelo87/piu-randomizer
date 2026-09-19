@echo off
setlocal EnableExtensions

title PIU Randomizer - Windows Installer
cd /d "%~dp0"

echo ========================================
echo   PIU Randomizer - Windows setup
echo ========================================
echo.

where node >nul 2>nul
if errorlevel 1 (
    echo Node.js nao encontrado.
    where winget >nul 2>nul
    if errorlevel 1 (
        echo Instale Node.js LTS e execute este script novamente.
        echo https://nodejs.org/
        pause
        exit /b 1
    )
    echo Instalando Node.js LTS via winget...
    winget install --id OpenJS.NodeJS.LTS --exact --source winget
    if errorlevel 1 (
        echo Falha ao instalar Node.js.
        pause
        exit /b 1
    )
    echo Feche e abra este script novamente para atualizar o PATH.
    pause
    exit /b 0
)

if not exist "backend\.env" (
    copy /Y "backend\.env.example" "backend\.env" >nul
    echo.
    echo backend\.env foi criado a partir do exemplo.
    echo Edite DATABASE_URL com os dados do PostgreSQL antes de continuar.
    pause
)

where psql >nul 2>nul
if errorlevel 1 (
    where winget >nul 2>nul
    if errorlevel 1 (
        echo PostgreSQL nao encontrado e winget nao esta disponivel.
        echo Instale o PostgreSQL manualmente e execute este script novamente.
        pause
        exit /b 1
    )

    echo PostgreSQL nao encontrado. Instalando via winget...
    winget install --id PostgreSQL.PostgreSQL.17 --exact --source winget --accept-package-agreements --accept-source-agreements
    if errorlevel 1 (
        echo Versao 17 indisponivel. Tentando PostgreSQL 16...
        winget install --id PostgreSQL.PostgreSQL.16 --exact --source winget --accept-package-agreements --accept-source-agreements
    )

    for %%V in (17 16 15 14) do if exist "C:\Program Files\PostgreSQL\%%V\bin\psql.exe" set "PATH=C:\Program Files\PostgreSQL\%%V\bin;%%PATH%%"
)

where psql >nul 2>nul
if errorlevel 1 (
    echo PostgreSQL foi instalado, mas o psql ainda nao esta disponivel.
    echo Feche e abra este script novamente apos concluir a instalacao.
    pause
    exit /b 1
)

echo PostgreSQL encontrado.
echo Confirme que DATABASE_URL em backend\.env usa o usuario, senha e porta corretos.

echo.
echo [1/5] Instalando dependencias do backend...
call npm --prefix backend install
if errorlevel 1 goto :error

echo [2/5] Instalando dependencias do frontend...
call npm --prefix frontend install
if errorlevel 1 goto :error

echo [3/5] Gerando Prisma Client...
call npx --prefix backend prisma generate
if errorlevel 1 goto :error

echo [4/5] Sincronizando banco de dados...
call npx --prefix backend prisma db push
if errorlevel 1 goto :error

echo [5/5] Iniciando backend e frontend...
start "PIU Randomizer Backend" cmd /k "cd /d "%~dp0backend" && npm run dev"
start "PIU Randomizer Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev -- --host 0.0.0.0"

timeout /t 5 /nobreak >nul
start "" http://localhost:5173

echo.
echo PIU Randomizer iniciado em http://localhost:5173
echo Esta janela pode ser fechada.
pause
exit /b 0

:error
echo.
echo A instalacao falhou. Verifique as mensagens acima.
pause
exit /b 1
