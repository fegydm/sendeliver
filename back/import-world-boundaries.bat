@echo off
setlocal

REM === Ručne nastav údaje ===
set "HOST=dpg-crsqnbe8ii6s73eg2tf0-a.frankfurt-postgres.render.com"
set "PORT=5432"
set "DB=db1_3scm"
set "USER=db1_3scm_user"
set "PASS=pN4aUwiusdBmsWvNTpuHPNTVhIq6BAU7" 

REM === Cesta k shapefile ===
set "SHP=C:\NODE-MY\geoBoundaries\geoBoundariesCGAZ_ADM2.shp"

REM === Cesta k ogr2ogr.exe ===
set "OGR=C:\OSGeo4W\bin\ogr2ogr.exe"

echo 🔐 Connecting to: %USER%@%HOST%:%PORT% → DB: %DB%

REM === Import cez ogr2ogr ===
"%OGR%" ^
  -f "PostgreSQL" ^
  PG:"host=%HOST% dbname=%DB% user=%USER% password=%PASS% port=%PORT% sslmode=require" ^
  "%SHP%" ^
  -nln maps.world_boundaries_2level ^
  -nlt MULTIPOLYGON ^
  -lco GEOMETRY_NAME=geom ^
  -lco FID=id ^
  -overwrite

pause
