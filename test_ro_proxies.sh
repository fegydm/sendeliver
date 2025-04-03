#!/bin/bash

# Získa zoznam rumunských proxy z proxy.cz (voliteľne uprav)
PROXY_LIST=$(curl -s "https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/http.txt" | grep ":80" | head -n 10)

echo "🧪 Testujem nasledovné proxy servery z RO:"
echo "$PROXY_LIST"
echo ""

for proxy in $PROXY_LIST; do
  echo "🌍 Testujem proxy: $proxy"

  IP=$(curl -x "http://$proxy" -s --max-time 5 https://api.ipify.org)

  if [[ -n "$IP" ]]; then
    echo "✅ Funguje! IP adresa cez proxy: $IP"
  else
    echo "❌ Proxy neodpovedá (timeout alebo chyba)"
  fi

  echo "--------------------------"
done

