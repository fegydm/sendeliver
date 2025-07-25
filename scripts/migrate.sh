#!/bin/bash
set -e
echo "🚀 Starting Sendeliver migration..."
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'
SRC_OLD="front/src_backup_functional_before_refactor_20250724_143709"
SRC_NEW="front/src_new"
BACKUP_DIR="front/src_backup_$(date +%Y%m%d_%H%M%S)"

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}
log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}
log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

create_backup() {
    log_info "Creating backup at $BACKUP_DIR"
    cp -r $SRC_OLD $BACKUP_DIR
}

create_structure() {
    log_info "Creating new directory structure..."
    [ -d "$SRC_NEW" ] && rm -rf $SRC_NEW
    mkdir -p $SRC_NEW/domains/{auth,fleet,transport,people,billing}/{models,services,types}
    mkdir -p $SRC_NEW/apps/hauler/{features,layouts}
    mkdir -p $SRC_NEW/apps/hauler/features/{dashboard,operations,exchange,maps,planner,admin,analytics}
    mkdir -p $SRC_NEW/apps/sender/{features,layouts}
    mkdir -p $SRC_NEW/apps/sender/features/{dashboard,shipments,tracking,directory,exchange,billing}
    mkdir -p $SRC_NEW/apps/broker/{features,layouts}
    mkdir -p $SRC_NEW/apps/broker/features/{dashboard,sender-side,hauler-side,matching,commissions}
    mkdir -p $SRC_NEW/apps/portal/{features,layouts}
    mkdir -p $SRC_NEW/apps/portal/features/{home,auth,onboarding}
    mkdir -p $SRC_NEW/roles/{system-admin,org-admin,dispatcher,driver,accountant,employee}
    mkdir -p $SRC_NEW/shared/{ui,components,layouts}
    mkdir -p $SRC_NEW/services/{api,websocket,storage}
    mkdir -p $SRC_NEW/lib/{auth,utils,constants}
    mkdir -p $SRC_NEW/types
    log_info "Directory structure created"
}

migrate_hauler_components() {
    log_info "Migrating hauler components..."
    if [ -d "$SRC_OLD/components/hauler/operations" ]; then
        cp -r $SRC_OLD/components/hauler/operations/* $SRC_NEW/apps/hauler/features/operations/
        log_info "✓ Migrated operations"
    fi
    if [ -d "$SRC_OLD/components/hauler/maps" ]; then
        cp -r $SRC_OLD/components/hauler/maps/* $SRC_NEW/apps/hauler/features/maps/
        log_info "✓ Migrated maps"
    fi
    if [ -d "$SRC_OLD/components/hauler/exchange" ]; then
        cp -r $SRC_OLD/components/hauler/exchange/* $SRC_NEW/apps/hauler/features/exchange/
        log_info "✓ Migrated exchange"
    fi
    if [ -d "$SRC_OLD/components/hauler/admin" ]; then
        cp -r $SRC_OLD/components/hauler/admin/* $SRC_NEW/apps/hauler/features/admin/
        log_info "✓ Migrated admin"
    fi
    if [ -d "$SRC_OLD/components/hauler/content" ]; then
        cp -r $SRC_OLD/components/hauler/content/* $SRC_NEW/apps/hauler/features/dashboard/
        log_info "✓ Migrated content to dashboard"
    fi
    if [ -d "$SRC_OLD/components/hauler/planner" ]; then
        cp -r $SRC_OLD/components/hauler/planner/* $SRC_NEW/apps/hauler/features/planner/
        log_info "✓ Migrated planner"
    fi
    if [ -f "$SRC_OLD/components/hauler/hauler.tabs.component.tsx" ]; then
        cp $SRC_OLD/components/hauler/hauler.tabs.component.tsx $SRC_NEW/apps/hauler/layouts/
        log_info "✓ Migrated hauler tabs to layouts"
    fi
}

migrate_shared() {
    log_info "Migrating shared components..."
    if [ -d "$SRC_OLD/components/shared" ]; then
        cp -r $SRC_OLD/components/shared/* $SRC_NEW/shared/
        log_info "✓ Migrated shared components"
    fi
}

migrate_essential() {
    log_info "Migrating essential files..."
    [ -f "$SRC_OLD/App.tsx" ] && cp $SRC_OLD/App.tsx $SRC_NEW/
    [ -f "$SRC_OLD/main.tsx" ] && cp $SRC_OLD/main.tsx $SRC_NEW/
    [ -f "$SRC_OLD/index.css" ] && cp $SRC_OLD/index.css $SRC_NEW/
    [ -d "$SRC_OLD/services" ] && cp -r $SRC_OLD/services/* $SRC_NEW/services/
    [ -d "$SRC_OLD/hooks" ] && cp -r $SRC_OLD/hooks/* $SRC_NEW/lib/
    [ -d "$SRC_OLD/types" ] && cp -r $SRC_OLD/types/* $SRC_NEW/types/
    [ -d "$SRC_OLD/utils" ] && cp -r $SRC_OLD/utils/* $SRC_NEW/lib/utils/
    [ -d "$SRC_OLD/constants" ] && cp -r $SRC_OLD/constants/* $SRC_NEW/lib/constants/
    log_info "✓ Migrated essential files"
}

update_imports() {
    log_info "Updating import statements..."
    find $SRC_NEW -name "*.tsx" -o -name "*.ts" | while read file; do
        sed -i '' 's|@/components/hauler/operations|@/apps/hauler/features/operations|g' "$file"
        sed -i '' 's|@/components/hauler/maps|@/apps/hauler/features/maps|g' "$file"
        sed -i '' 's|@/components/hauler/exchange|@/apps/hauler/features/exchange|g' "$file"
        sed -i '' 's|@/components/hauler/admin|@/apps/hauler/features/admin|g' "$file"
        sed -i '' 's|@/components/hauler/content|@/apps/hauler/features/dashboard|g' "$file"
        sed -i '' 's|@/components/hauler/planner|@/apps/hauler/features/planner|g' "$file"
        sed -i '' 's|@/components/shared|@/shared|g' "$file"
        sed -i '' 's|@/hooks|@/lib|g' "$file"
        sed -i '' 's|@/utils|@/lib/utils|g' "$file"
        sed -i '' 's|@/constants|@/lib/constants|g' "$file"
    done
    log_info "✓ Updated import statements"
}

rename_files() {
    log_info "Renaming files with dot convention..."
    if [ -d "$SRC_NEW/apps/hauler/features/operations/fleet/connectors" ]; then
        cd $SRC_NEW/apps/hauler/features/operations/fleet/connectors
        [ -f "FleetImageModule.tsx" ] && mv FleetImageModule.tsx fleet.image.module.component.tsx
        [ -f "FleetDriverModule.tsx" ] && mv FleetDriverModule.tsx fleet.driver.module.component.tsx
        [ -f "FleetMapModule.tsx" ] && mv FleetMapModule.tsx fleet.map.module.component.tsx
        [ -f "FleetStatusModule.tsx" ] && mv FleetStatusModule.tsx fleet.status.module.component.tsx
        [ -f "FleetUnitModule.tsx" ] && mv FleetUnitModule.tsx fleet.unit.module.component.tsx
        cd - > /dev/null
        log_info "✓ Renamed fleet modules"
    fi
    if [ -d "$SRC_NEW/apps/hauler/features/maps" ]; then
        cd $SRC_NEW/apps/hauler/features/maps
        [ -f "FilterPanel.tsx" ] && mv FilterPanel.tsx filter.panel.component.tsx
        [ -f "ControlPanel.tsx" ] && mv ControlPanel.tsx control.panel.component.tsx
        [ -f "MapView.tsx" ] && mv MapView.tsx map.view.component.tsx
        cd - > /dev/null
        log_info "✓ Renamed maps components"
    fi
}

verify_migration() {
    log_info "Verifying migration..."
    [ -d "$SRC_NEW/apps/hauler/features" ] && log_info "✓ Hauler features directory exists"
    [ -d "$SRC_NEW/shared" ] && log_info "✓ Shared directory exists"
    [ -d "$SRC_NEW/domains" ] && log_info "✓ Domains directory exists"
    hauler_files=$(find $SRC_NEW/apps/hauler -name "*.tsx" -o -name "*.ts" | wc -l)
    shared_files=$(find $SRC_NEW/shared -name "*.tsx" -o -name "*.ts" | wc -l)
    log_info "Migrated $hauler_files hauler files"
    log_info "Migrated $shared_files shared files"
}

switch_to_new() {
    log_info "Switching to new structure..."
    mv $SRC_OLD $SRC_OLD"_old_$(date +%Y%m%d_%H%M%S)"
    mv $SRC_NEW $SRC_OLD
    log_info "✓ Switched to new structure"
}

main() {
    echo "🏗️  Sendeliver Architecture Migration"
    echo "===================================="
    create_backup
    create_structure
    migrate_hauler_components
    migrate_shared
    migrate_essential
    update_imports
    rename_files
    verify_migration
    echo ""
    echo "🎉 Migration completed!"
    echo "📁 New structure: $SRC_NEW"
    echo "💾 Backup: $BACKUP_DIR"
    echo ""
    echo "Next steps:"
    echo "1. Review migrated files in $SRC_NEW"
    echo "2. Test the application: npm run dev"
    echo "3. If everything works: ./migrate.sh switch"
    echo ""
}
if [ "$1" == "switch" ]; then
    switch_to_new
    exit 0
fi
main