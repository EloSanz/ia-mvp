#!/bin/bash

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🔍 Validando commit...${NC}"

# Obtener el mensaje del último commit
COMMIT_MSG=$(git log -1 --pretty=%B)

# Validar formato conventional commits
if ! echo "$COMMIT_MSG" | grep -qE '^(feat|fix|docs|style|refactor|test|chore)(\([a-z-]+\))?: .+$'; then
    echo -e "${RED}❌ El mensaje de commit no sigue el formato conventional commits${NC}"
    echo -e "Formato esperado: type(scope): description"
    echo -e "Types válidos: feat, fix, docs, style, refactor, test, chore"
    echo -e "Ejemplo: feat(web): agregar modo oscuro"
    exit 1
fi

# Verificar archivos sensibles
if git diff --cached --name-only | grep -qE '\.env$|\.pem$|\.key$'; then
    echo -e "${RED}❌ ¡Cuidado! Estás intentando commitear archivos sensibles${NC}"
    git diff --cached --name-only | grep -E '\.env$|\.pem$|\.key$'
    exit 1
fi

# Verificar package-lock.json si package.json fue modificado
if git diff --cached --name-only | grep -q "package.json"; then
    if ! git diff --cached --name-only | grep -q "package-lock.json"; then
        echo -e "${RED}❌ Has modificado package.json pero no package-lock.json${NC}"
        echo -e "Ejecuta ${YELLOW}npm install${NC} para actualizar package-lock.json"
        exit 1
    fi
fi

# Verificar schema.prisma si hay migraciones
if git diff --cached --name-only | grep -q "prisma/migrations/"; then
    if ! git diff --cached --name-only | grep -q "prisma/schema.prisma"; then
        echo -e "${RED}❌ Has añadido migraciones pero no has modificado schema.prisma${NC}"
        exit 1
    fi
fi

# Verificar tamaño del commit
CHANGES=$(git diff --cached --shortstat)
FILES=$(echo $CHANGES | grep -oE '[0-9]+ file' | grep -oE '[0-9]+')
INSERTIONS=$(echo $CHANGES | grep -oE '[0-9]+ insertion' | grep -oE '[0-9]+')
DELETIONS=$(echo $CHANGES | grep -oE '[0-9]+ deletion' | grep -oE '[0-9]+')

if [ ! -z "$FILES" ] && [ $FILES -gt 20 ]; then
    echo -e "${YELLOW}⚠️  Commit muy grande: $FILES archivos modificados${NC}"
    echo -e "Considera dividir los cambios en commits más pequeños"
fi

TOTAL_CHANGES=0
[ ! -z "$INSERTIONS" ] && TOTAL_CHANGES=$((TOTAL_CHANGES + INSERTIONS))
[ ! -z "$DELETIONS" ] && TOTAL_CHANGES=$((TOTAL_CHANGES + DELETIONS))

if [ $TOTAL_CHANGES -gt 300 ]; then
    echo -e "${YELLOW}⚠️  Commit muy grande: $TOTAL_CHANGES líneas modificadas${NC}"
    echo -e "Considera dividir los cambios en commits más pequeños"
fi

# Todo OK
echo -e "${GREEN}✅ Commit validado correctamente${NC}"
exit 0
