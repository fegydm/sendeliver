#!/bin/bash

# Načítať .env priamo z aktuálneho adresára (back/)
ENV_FILE="./.env"

if [ -f "$ENV_FILE" ]; then
  # Načítame premenné z .env – predpokladáme, že tam nemáš komentáre s medzerami
  export $(grep -v '^#' "$ENV_FILE" | xargs)
else
  echo "❌ .env file not found at $ENV_FILE"
  exit 1
fi

if [ -z "$PGCONN" ]; then
  echo "❌ PGCONN variable is not set in your .env"
  exit 1
fi

# Cesta k SHP súboru (z pohľadu kontajnera, keďže montujeme koreň projektu)
SHP_PATH="_maps/ne_110m_admin_0_countries/ne_110m_admin_0_countries.shp"
TABLE_NAME="maps.world_boundaries_2level"

echo "🚀 Importing $SHP_PATH into table $TABLE_NAME using PG connection: $PGCONN"

# Spustíme Docker s GDAL image; montujeme celý projektový adresár
docker run --rm -v "/Users/deutschmann/sendeliver":/data osgeo/gdal:ubuntu-small-3.6.3 \
  ogr2ogr -f "PostgreSQL" "PG:$PGCONN" /data/$SHP_PATH \
  -nln $TABLE_NAME \
  -overwrite \
  -nlt PROMOTE_TO_MULTI \
  -lco GEOMETRY_NAME=geom \
  -lco FID=id \
  -lco PRECISION=NO
