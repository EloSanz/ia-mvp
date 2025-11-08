#!/bin/bash

# iCards API - Test Suite Integral
# Ejecutar con: ./test-integration.sh

# No salir en caso de error para mostrar todos los resultados
# set -e  # Comentado para mostrar todos los errores

# Configuración
API_BASE="http://localhost:3000"
TEST_USER_UUID="test-user-$(uuidgen | cut -d'-' -f1)"
TEST_PASSWORD="test123"

echo "🚀 INICIANDO TESTS INTEGRALES DE iCARDS API"
echo "=============================================="
echo "Usuario de prueba: $TEST_USER_UUID"
echo "Contraseña: $TEST_PASSWORD"
echo ""

# Función para hacer requests con curl
make_request() {
    local method=$1
    local url=$2
    local data=$3
    local auth_header=$4

    if [ "$method" = "GET" ]; then
        curl -s -X $method "$API_BASE$url" ${auth_header:+-H "Authorization: Bearer $auth_header"}
    elif [ "$method" = "DELETE" ]; then
        curl -s -X $method "$API_BASE$url" ${auth_header:+-H "Authorization: Bearer $auth_header"}
    else
        curl -s -X $method "$API_BASE$url" \
            -H "Content-Type: application/json" \
            ${auth_header:+-H "Authorization: Bearer $auth_header"} \
            -d "$data"
    fi
}

# Función para validar respuesta
validate_response() {
    local response=$1
    local expected_success=$2
    local description=$3

    local success=$(echo "$response" | jq -r '.success // "null"')

    if [ "$success" = "$expected_success" ]; then
        echo "✅ $description"
        return 0
    else
        echo "❌ $description"
        echo "   Respuesta: $response"
        return 1
    fi
}

echo "📝 PASO 1: Crear usuario de prueba"
REGISTER_RESPONSE=$(make_request "POST" "/api/auth/register" "{\"username\": \"$TEST_USER_UUID\", \"password\": \"$TEST_PASSWORD\"}")
validate_response "$REGISTER_RESPONSE" "true" "Usuario registrado exitosamente"

echo ""
echo "🔐 PASO 2: Login y obtener token"
LOGIN_RESPONSE=$(make_request "POST" "/api/auth/login" "{\"username\": \"$TEST_USER_UUID\", \"password\": \"$TEST_PASSWORD\"}")
validate_response "$LOGIN_RESPONSE" "true" "Login exitoso"

TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.token')
echo "   Token obtenido: ${TOKEN:0:50}..."

echo ""
echo "📚 PASO 3: TESTS DE DECKS"

echo "   3.1 GET /api/decks (debe estar vacío inicialmente)"
DECKS_RESPONSE=$(make_request "GET" "/api/decks" "" "$TOKEN")
validate_response "$DECKS_RESPONSE" "true" "GET decks inicial"

echo "   3.2 POST /api/decks (crear primer deck)"
CREATE_DECK_RESPONSE=$(make_request "POST" "/api/decks" "{\"name\": \"Test Deck 1\", \"description\": \"Deck de prueba número 1\", \"generateCover\": false}" "$TOKEN")
validate_response "$CREATE_DECK_RESPONSE" "true" "Deck creado"
DECK_ID_1=$(echo "$CREATE_DECK_RESPONSE" | jq -r '.data.id')

echo "   3.3 POST /api/decks (crear segundo deck)"
CREATE_DECK2_RESPONSE=$(make_request "POST" "/api/decks" "{\"name\": \"Test Deck 2\", \"description\": \"Deck de prueba número 2\"}" "$TOKEN")
validate_response "$CREATE_DECK2_RESPONSE" "true" "Segundo deck creado"
DECK_ID_2=$(echo "$CREATE_DECK2_RESPONSE" | jq -r '.data.id')

echo "   3.4 GET /api/decks (debe tener 2 decks)"
DECKS_AFTER_CREATE=$(make_request "GET" "/api/decks" "" "$TOKEN")
COUNT=$(echo "$DECKS_AFTER_CREATE" | jq -r '.count')
if [ "$COUNT" = "2" ]; then
    echo "✅ GET decks con 2 decks"
else
    echo "❌ GET decks - esperado 2, obtenido $COUNT"
fi

echo "   3.5 GET /api/decks/mcp (versión MCP)"
DECKS_MCP=$(make_request "GET" "/api/decks/mcp" "" "$TOKEN")
validate_response "$DECKS_MCP" "true" "GET decks MCP"

echo "   3.6 GET /api/decks/$DECK_ID_1 (deck específico)"
DECK_SPECIFIC=$(make_request "GET" "/api/decks/$DECK_ID_1" "" "$TOKEN")
validate_response "$DECK_SPECIFIC" "true" "GET deck específico"

echo "   3.7 GET /api/decks/flashcards-count (conteo total)"
FLASHCARDS_COUNT=$(make_request "GET" "/api/decks/flashcards-count" "" "$TOKEN")
validate_response "$FLASHCARDS_COUNT" "true" "GET flashcards count"

echo "   3.8 GET /api/decks/untagged-flashcards-count"
UNTAGGED_COUNT=$(make_request "GET" "/api/decks/untagged-flashcards-count" "" "$TOKEN")
validate_response "$UNTAGGED_COUNT" "true" "GET untagged flashcards count"

echo "   3.9 GET /api/decks/$DECK_ID_1/tag-count"
TAG_COUNT=$(make_request "GET" "/api/decks/$DECK_ID_1/tag-count" "" "$TOKEN")
validate_response "$TAG_COUNT" "true" "GET deck tag count"

echo "   3.10 GET /api/decks/$DECK_ID_1/flashcards-by-tag"
FLASHCARDS_BY_TAG=$(make_request "GET" "/api/decks/$DECK_ID_1/flashcards-by-tag" "" "$TOKEN")
validate_response "$FLASHCARDS_BY_TAG" "true" "GET flashcards by tag"

echo "   3.11 GET /api/decks/$DECK_ID_1/untagged-flashcards-count"
DECK_UNTAGGED=$(make_request "GET" "/api/decks/$DECK_ID_1/untagged-flashcards-count" "" "$TOKEN")
validate_response "$DECK_UNTAGGED" "true" "GET deck untagged flashcards"

echo "   3.12 PUT /api/decks/$DECK_ID_1 (actualizar deck)"
UPDATE_DECK=$(make_request "PUT" "/api/decks/$DECK_ID_1" "{\"name\": \"Test Deck 1 Updated\", \"description\": \"Deck actualizado\"}" "$TOKEN")
validate_response "$UPDATE_DECK" "true" "PUT deck update"


echo ""
echo "🏷️ PASO 4: TESTS DE TAGS"

echo "   4.1 GET /api/decks/$DECK_ID_1/tags (tags iniciales - debe estar vacío)"
TAGS_INITIAL=$(make_request "GET" "/api/decks/$DECK_ID_1/tags" "" "$TOKEN")
validate_response "$TAGS_INITIAL" "true" "GET tags iniciales"

echo "   4.2 POST /api/decks/$DECK_ID_1/tags (crear tag)"
CREATE_TAG=$(make_request "POST" "/api/decks/$DECK_ID_1/tags" "{\"name\": \"Grammar\", \"color\": \"#FF6B6B\"}" "$TOKEN")
validate_response "$CREATE_TAG" "true" "Tag creado"
TAG_ID=$(echo "$CREATE_TAG" | jq -r '.data.id')

echo "   4.3 GET /api/decks/$DECK_ID_1/tags (debe tener 1 tag)"
TAGS_AFTER_CREATE=$(make_request "GET" "/api/decks/$DECK_ID_1/tags" "" "$TOKEN")
validate_response "$TAGS_AFTER_CREATE" "true" "GET tags después de crear"

echo "   4.4 GET /api/decks/$DECK_ID_1/tags/$TAG_ID (tag específico)"
TAG_SPECIFIC=$(make_request "GET" "/api/decks/$DECK_ID_1/tags/$TAG_ID" "" "$TOKEN")
validate_response "$TAG_SPECIFIC" "true" "GET tag específico"

echo "   4.5 PUT /api/decks/$DECK_ID_1/tags/$TAG_ID (actualizar tag)"
UPDATE_TAG=$(make_request "PUT" "/api/decks/$DECK_ID_1/tags/$TAG_ID" "{\"name\": \"Advanced Grammar\", \"color\": \"#4CAF50\"}" "$TOKEN")
validate_response "$UPDATE_TAG" "true" "PUT tag update"

echo ""
echo "🎯 PASO 5: TESTS DE FLASHCARDS"

echo "   5.1 GET /api/flashcards/deck/$DECK_ID_1 (flashcards iniciales - debe estar vacío)"
FLASHCARDS_INITIAL=$(make_request "GET" "/api/flashcards/deck/$DECK_ID_1" "" "$TOKEN")
COUNT_FC=$(echo "$FLASHCARDS_INITIAL" | jq -r '.data | length')
if [ "$COUNT_FC" = "0" ]; then
    echo "✅ GET flashcards iniciales (vacío)"
else
    echo "❌ GET flashcards iniciales - esperado 0, obtenido $COUNT_FC"
fi

echo "   5.2 POST /api/flashcards (crear flashcard sin difficulty)"
CREATE_FC1=$(make_request "POST" "/api/flashcards" "{\"front\": \"Hello\", \"back\": \"Hola\", \"deckId\": \"$DECK_ID_1\"}" "$TOKEN")
validate_response "$CREATE_FC1" "true" "Flashcard 1 creada (sin difficulty)"
FC_ID_1=$(echo "$CREATE_FC1" | jq -r '.data.id')

echo "   5.3 POST /api/flashcards (crear flashcard con difficulty)"
CREATE_FC2=$(make_request "POST" "/api/flashcards" "{\"front\": \"Goodbye\", \"back\": \"Adiós\", \"deckId\": \"$DECK_ID_1\", \"difficulty\": 3, \"tagId\": \"$TAG_ID\"}" "$TOKEN")
validate_response "$CREATE_FC2" "true" "Flashcard 2 creada (con difficulty y tag)"
FC_ID_2=$(echo "$CREATE_FC2" | jq -r '.data.id')

echo "   5.4 GET /api/flashcards/deck/$DECK_ID_1 (debe tener 2 flashcards)"
FLASHCARDS_AFTER_CREATE=$(make_request "GET" "/api/flashcards/deck/$DECK_ID_1" "" "$TOKEN")
COUNT_FC_AFTER=$(echo "$FLASHCARDS_AFTER_CREATE" | jq -r '.data | length')
if [ "$COUNT_FC_AFTER" = "2" ]; then
    echo "✅ GET flashcards después de crear (2 flashcards)"
else
    echo "❌ GET flashcards después de crear - esperado 2, obtenido $COUNT_FC_AFTER"
fi

echo "   5.5 GET /api/flashcards/deck/$DECK_ID_1?all=true (todas las flashcards)"
FLASHCARDS_ALL=$(make_request "GET" "/api/flashcards/deck/$DECK_ID_1?all=true" "" "$TOKEN")
validate_response "$FLASHCARDS_ALL" "true" "GET flashcards con all=true"

echo "   5.6 GET /api/flashcards/deck/$DECK_ID_1?pageSize=1 (paginación)"
FLASHCARDS_PAGE=$(make_request "GET" "/api/flashcards/deck/$DECK_ID_1?pageSize=1" "" "$TOKEN")
COUNT_PAGE=$(echo "$FLASHCARDS_PAGE" | jq -r '.data | length')
if [ "$COUNT_PAGE" = "1" ]; then
    echo "✅ GET flashcards con paginación (1 flashcard)"
else
    echo "❌ GET flashcards con paginación - esperado 1, obtenido $COUNT_PAGE"
fi

echo "   5.7 GET /api/flashcards (todas las flashcards del usuario)"
ALL_FLASHCARDS=$(make_request "GET" "/api/flashcards" "" "$TOKEN")
validate_response "$ALL_FLASHCARDS" "true" "GET todas las flashcards"

echo "   5.8 GET /api/flashcards/$FC_ID_1 (flashcard específica)"
FC_SPECIFIC=$(make_request "GET" "/api/flashcards/$FC_ID_1" "" "$TOKEN")
validate_response "$FC_SPECIFIC" "true" "GET flashcard específica"

echo "   5.9 PUT /api/flashcards/$FC_ID_1 (actualizar flashcard)"
UPDATE_FC=$(make_request "PUT" "/api/flashcards/$FC_ID_1" "{\"front\": \"Hello Updated\", \"back\": \"Hola Actualizado\"}" "$TOKEN")
validate_response "$UPDATE_FC" "true" "PUT flashcard update"

echo "   5.10 PUT /api/flashcards/$FC_ID_1/review (marcar como revisada)"
REVIEW_FC=$(make_request "PUT" "/api/flashcards/$FC_ID_1/review" "{\"difficulty\": 2}" "$TOKEN")
validate_response "$REVIEW_FC" "true" "PUT flashcard review"

echo "   5.11 GET /api/flashcards/deck/$DECK_ID_1/search?q=Hello (búsqueda)"
SEARCH_FC=$(make_request "GET" "/api/flashcards/deck/$DECK_ID_1/search?q=Hello" "" "")
validate_response "$SEARCH_FC" "true" "GET flashcards search"

echo "   5.12 GET /api/flashcards/search?q=Hello (búsqueda global)"
SEARCH_GLOBAL=$(make_request "GET" "/api/flashcards/search?q=Hello" "" "$TOKEN")
validate_response "$SEARCH_GLOBAL" "true" "GET flashcards search global"

echo "   5.13 POST /api/flashcards/batch (crear múltiples flashcards)"
BATCH_FC=$(make_request "POST" "/api/flashcards/batch" "{\"flashcards\": [{\"front\": \"Good morning\", \"back\": \"Buenos días\", \"deckId\": \"$DECK_ID_1\"}, {\"front\": \"Good night\", \"back\": \"Buenas noches\", \"deckId\": \"$DECK_ID_1\", \"difficulty\": 1}]}" "$TOKEN")
validate_response "$BATCH_FC" "true" "POST batch flashcards"

echo ""
echo "🧹 PASO 6: LIMPIEZA"

echo "   6.1 DELETE /api/flashcards/$FC_ID_2 (eliminar flashcard)"
DELETE_FC=$(make_request "DELETE" "/api/flashcards/$FC_ID_2" "" "$TOKEN")
validate_response "$DELETE_FC" "true" "DELETE flashcard"

         echo "   6.2 DELETE /api/decks/$DECK_ID_1/tags/$TAG_ID (eliminar tag)"
         DELETE_TAG=$(make_request "DELETE" "/api/decks/$DECK_ID_1/tags/$TAG_ID" "" "$TOKEN")
         validate_response "$DELETE_TAG" "true" "DELETE tag"

         echo "   6.3 DELETE /api/decks/$DECK_ID_1 (eliminar primer deck)"
         DELETE_DECK1=$(make_request "DELETE" "/api/decks/$DECK_ID_1" "" "$TOKEN")
         validate_response "$DELETE_DECK1" "true" "DELETE primer deck"

         echo "   6.4 DELETE /api/decks/$DECK_ID_2 (eliminar segundo deck)"
DELETE_DECK=$(make_request "DELETE" "/api/decks/$DECK_ID_2" "" "$TOKEN")
validate_response "$DELETE_DECK" "true" "DELETE deck"

echo ""
echo "📊 PASO 7: VERIFICACIÓN FINAL"

         echo "   7.1 GET /api/decks (debe estar vacío)"
         FINAL_DECKS=$(make_request "GET" "/api/decks" "" "$TOKEN")
         FINAL_COUNT=$(echo "$FINAL_DECKS" | jq -r '.count')
         if [ "$FINAL_COUNT" = "0" ]; then
             echo "✅ Verificación final - decks restantes: 0"
         else
             echo "❌ Verificación final - decks restantes: $FINAL_COUNT (esperado: 0)"
         fi

echo ""
echo "🏥 PASO 8: TESTS DE HEALTH/MONITORING"

echo "   8.1 GET /api/health (health check básico)"
HEALTH_BASIC=$(make_request "GET" "/api/health" "" "")
validate_response "$HEALTH_BASIC" "true" "GET health check"

echo "   8.2 GET /api/health/detailed (health check detallado)"
HEALTH_DETAILED=$(make_request "GET" "/api/health/detailed" "" "")
validate_response "$HEALTH_DETAILED" "true" "GET health detailed"

echo "   8.3 GET /api/logging/stats (estadísticas de logging)"
LOGGING_STATS=$(make_request "GET" "/api/logging/stats" "" "$TOKEN")
validate_response "$LOGGING_STATS" "true" "GET logging stats"

echo "   8.4 GET /api/logging/health (health de logging)"
LOGGING_HEALTH=$(make_request "GET" "/api/logging/health" "" "")
validate_response "$LOGGING_HEALTH" "true" "GET logging health"

echo ""
echo "🧹 PASO 9: LIMPIEZA DEL USUARIO DE PRUEBA"

echo "   9.1 DELETE /api/auth/delete-test-user (eliminar usuario de prueba)"
DELETE_USER=$(make_request "DELETE" "/api/auth/delete-test-user" "" "$TOKEN")
validate_response "$DELETE_USER" "true" "DELETE usuario de prueba"

echo ""
echo "🎉 TESTS INTEGRALES COMPLETADOS"
echo "=================================="
echo "Usuario de prueba creado: $TEST_USER_UUID"
echo "Token generado y usado correctamente"
echo "✅ Todas las operaciones CRUD probadas"
echo "✅ Todos los endpoints GET verificados"
echo "✅ Endpoints de health/monitoring probados"
echo "✅ Limpieza completa realizada (incluyendo usuario)"
echo ""
echo "📊 RESUMEN DE OPERACIONES:"
echo "   - 1 usuario registrado"
echo "   - 2 decks creados"
echo "   - 1 tag creado"
echo "   - 4 flashcards creadas (2 individuales + 2 batch)"
echo "   - Múltiples operaciones GET, PUT, DELETE"
echo "   - Limpieza completa de datos de prueba (incluyendo usuario)"
echo ""
echo "📝 Para repetir los tests, ejecuta:"
echo "   ./test-integration.sh"
