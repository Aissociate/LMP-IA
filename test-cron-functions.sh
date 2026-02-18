#!/bin/bash

# Test des Edge Functions CRON
# Usage: ./test-cron-functions.sh VOTRE_CRON_SECRET

if [ -z "$1" ]; then
  echo "❌ Erreur: Secret CRON requis"
  echo "Usage: ./test-cron-functions.sh VOTRE_CRON_SECRET"
  exit 1
fi

CRON_SECRET="$1"
BASE_URL="https://tciryfaaussfrfbvalhk.supabase.co/functions/v1"

echo "🔍 Test des fonctions CRON..."
echo ""

# Test 1: Check Market Alerts
echo "1️⃣  Test: check-market-alerts"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
RESPONSE=$(curl -s -X POST \
  "$BASE_URL/check-market-alerts" \
  -H "X-Cron-Secret: $CRON_SECRET" \
  -H "Content-Type: application/json")

echo "Réponse: $RESPONSE"
echo ""

if echo "$RESPONSE" | grep -q "Unauthorized"; then
  echo "❌ CRON_SECRET incorrect ou manquant dans Supabase"
  exit 1
elif echo "$RESPONSE" | grep -q "success"; then
  echo "✅ Fonction check-market-alerts opérationnelle"
else
  echo "⚠️  Réponse inattendue"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test 2: Send Market Digests
echo "2️⃣  Test: send-market-digests"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
RESPONSE=$(curl -s -X POST \
  "$BASE_URL/send-market-digests" \
  -H "X-Cron-Secret: $CRON_SECRET" \
  -H "Content-Type: application/json")

echo "Réponse: $RESPONSE"
echo ""

if echo "$RESPONSE" | grep -q "Unauthorized"; then
  echo "❌ CRON_SECRET incorrect"
  exit 1
elif echo "$RESPONSE" | grep -q "success"; then
  echo "✅ Fonction send-market-digests opérationnelle"
else
  echo "⚠️  Réponse inattendue"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test 3: Daily Reunion Markets Sync
echo "3️⃣  Test: daily-reunion-markets-sync"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
RESPONSE=$(curl -s -X POST \
  "$BASE_URL/daily-reunion-markets-sync" \
  -H "X-Cron-Secret: $CRON_SECRET" \
  -H "Content-Type: application/json")

echo "Réponse: $RESPONSE"
echo ""

if echo "$RESPONSE" | grep -q "success"; then
  echo "✅ Fonction daily-reunion-markets-sync opérationnelle"
else
  echo "⚠️  Vérifier les logs pour plus de détails"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test 4: Archive Expired Markets
echo "4️⃣  Test: archive-expired-markets"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
RESPONSE=$(curl -s -X POST \
  "$BASE_URL/archive-expired-markets" \
  -H "X-Cron-Secret: $CRON_SECRET" \
  -H "Content-Type: application/json")

echo "Réponse: $RESPONSE"
echo ""

if echo "$RESPONSE" | grep -q "success"; then
  echo "✅ Fonction archive-expired-markets opérationnelle"
else
  echo "⚠️  Vérifier les logs pour plus de détails"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test 5: Generate Markets Sitemap
echo "5️⃣  Test: generate-markets-sitemap"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
RESPONSE=$(curl -s -X POST \
  "$BASE_URL/generate-markets-sitemap" \
  -H "X-Cron-Secret: $CRON_SECRET" \
  -H "Content-Type: application/json")

echo "Réponse: $RESPONSE"
echo ""

if echo "$RESPONSE" | grep -q "success"; then
  echo "✅ Fonction generate-markets-sitemap opérationnelle"
else
  echo "⚠️  Vérifier les logs pour plus de détails"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Tests terminés!"
echo ""
echo "Prochaines étapes:"
echo "1. Si tous les tests sont OK, configurez les CRON sur cron-job.org"
echo "2. Consultez le fichier CRON-SETUP-GUIDE.md pour la configuration complète"
echo "3. Vérifiez les logs Supabase après 1 heure"
