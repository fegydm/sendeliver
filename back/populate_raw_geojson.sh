#!/bin/bash
# Bash script to populate maps.raw_geojson using DATABASE_URL from .env

# Load .env file
source /Users/deutschmann/sendeliver/back/.env

# Ensure schema and table exist
psql "$DATABASE_URL" -c "CREATE SCHEMA IF NOT EXISTS maps;"
psql "$DATABASE_URL" -c "CREATE TABLE IF NOT EXISTS maps.raw_geojson (data jsonb);"

# Copy GeoJSON data from local file using \copy
psql "$DATABASE_URL" -c "\copy maps.raw_geojson (data) FROM '/Users/deutschmann/sendeliver/_maps/countries.geojson' WITH (FORMAT text);" 2> error.log

# Check for errors
if [ -s error.log ]; then
    echo "Chyba pri importe dát:"
    cat error.log
    exit 1
fi

# Verify
psql "$DATABASE_URL" -c "SELECT COUNT(*) FROM maps.raw_geojson;"