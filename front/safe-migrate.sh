#!/bin/bash
# File: front/safe-migrate.sh
# Last change: Safe migration - rename old, create new, move files

echo "🚀 SAFE FRONTEND MIGRATION"
echo "=========================="

# Safety check
if [ ! -d "front/src" ]; then
  echo "❌ Error: front/src directory not found!"
  exit 1
fi

echo "📁 Step 1: Rename current src to src1..."
mv front/src front/src1
echo "✅ Current structure backed up as front/src1"

echo "📁 Step 2: Create new directory structure..."

# ========================================
# CREATE NEW STRUCTURE
# ========================================

mkdir -p front/src/{domains,features,shared,pages,assets,dev}

# Domains
mkdir -p front/src/domains/{organizations,vehicles,drivers,orders,shipments,messaging}
for domain in organizations vehicles drivers orders shipments messaging; do
  mkdir -p front/src/domains/$domain/{components,hooks,services,types,utils}
done

# Features  
mkdir -p front/src/features/{hauler,sender,broker,auth,admin,home}

# Hauler features
mkdir -p front/src/features/hauler/{dashboard,fleet-management,team-management,operations,exchange,planning,tracking,analytics,admin}
for feature in dashboard fleet-management team-management operations exchange planning tracking analytics admin; do
  mkdir -p front/src/features/hauler/$feature/{components,hooks,services,types}
done

# Sender features
mkdir -p front/src/features/sender/{dashboard,order-creation,shipment-tracking,marketing}
for feature in dashboard order-creation shipment-tracking marketing; do
  mkdir -p front/src/features/sender/$feature/{components,hooks,services,types}
done

# Broker features
mkdir -p front/src/features/broker/{dashboard,order-brokering,hauler-network,client-relations,marketing}
for feature in dashboard order-brokering hauler-network client-relations marketing; do
  mkdir -p front/src/features/broker/$feature/{components,hooks,services,types}
done

# Auth & other features
mkdir -p front/src/features/auth/{components,hooks,services,types}
mkdir -p front/src/features/admin/{components,hooks,services,types}
mkdir -p front/src/features/home/{components,hooks,services,types}

# Shared
mkdir -p front/src/shared/{components,hooks,utils,types,services,contexts,styles,api}
mkdir -p front/src/shared/components/{ui,layout,maps,connectors,navigation}

# Dev tools
mkdir -p front/src/dev/{tools,stories,tests}

echo "✅ New structure created"

echo "📦 Step 3: Moving files to new locations..."

# ========================================
# MOVE TO DOMAINS (Business Logic)
# ========================================

echo "  🏢 Moving domains..."

# VEHICLES DOMAIN
if [ -d "front/src1/components/hauler/operations/fleet" ]; then
  cp -r front/src1/components/hauler/operations/fleet/* front/src/domains/vehicles/components/
  echo "    ✅ vehicles domain"
fi

# DRIVERS DOMAIN  
if [ -d "front/src1/components/hauler/operations/team" ]; then
  cp -r front/src1/components/hauler/operations/team/* front/src/domains/drivers/components/
  echo "    ✅ drivers domain"
fi

# MESSAGING DOMAIN
if [ -d "front/src1/components/home/content/chat" ]; then
  cp -r front/src1/components/home/content/chat/* front/src/domains/messaging/components/
fi
if [ -d "front/src1/components/shared/webrtc" ]; then
  cp -r front/src1/components/shared/webrtc/* front/src/domains/messaging/components/
fi
echo "    ✅ messaging domain"

# ORDERS DOMAIN
if [ -d "front/src1/components/home/content/search-forms" ]; then
  cp -r front/src1/components/home/content/search-forms/* front/src/domains/orders/components/
fi
if [ -d "front/src1/components/home/content/results" ]; then
  cp -r front/src1/components/home/content/results/* front/src/domains/orders/components/
fi
echo "    ✅ orders domain"

# ORGANIZATIONS DOMAIN (ready for new code)
echo "    ✅ organizations domain (ready)"

# SHIPMENTS DOMAIN (placeholder)
echo "    ✅ shipments domain (ready)"

# ========================================
# MOVE TO SHARED (Common Utilities)
# ========================================

echo "  🧩 Moving shared components..."

# UI COMPONENTS
if [ -d "front/src1/components/shared/ui" ]; then
  cp -r front/src1/components/shared/ui/* front/src/shared/components/ui/
  echo "    ✅ ui components"
fi

# CONNECTORS
if [ -d "front/src1/components/shared/connectors" ]; then
  cp -r front/src1/components/shared/connectors/* front/src/shared/components/connectors/
  echo "    ✅ connectors"
fi

# LAYOUT ELEMENTS
if [ -d "front/src1/components/shared/elements" ]; then
  cp -r front/src1/components/shared/elements/* front/src/shared/components/layout/
  echo "    ✅ layout elements"
fi

# MAPS
if [ -d "front/src1/components/shared/maps" ]; then
  cp -r front/src1/components/shared/maps/* front/src/shared/components/maps/
  echo "    ✅ maps"
fi

# NAVIGATION
if [ -d "front/src1/components/shared/navbars" ]; then
  cp -r front/src1/components/shared/navbars/* front/src/shared/components/navigation/
  echo "    ✅ navigation"
fi

# MODALS (merge with UI)
if [ -d "front/src1/components/shared/modals" ]; then
  mkdir -p front/src/shared/components/ui/modals
  cp -r front/src1/components/shared/modals/* front/src/shared/components/ui/modals/
  echo "    ✅ modals"
fi

# SHARED UTILITIES
if [ -d "front/src1/hooks" ]; then
  cp -r front/src1/hooks/* front/src/shared/hooks/
  echo "    ✅ hooks"
fi

if [ -d "front/src1/utils" ]; then
  cp -r front/src1/utils/* front/src/shared/utils/
  echo "    ✅ utils"
fi

if [ -d "front/src1/types" ]; then
  cp -r front/src1/types/* front/src/shared/types/
  echo "    ✅ types"
fi

if [ -d "front/src1/contexts" ]; then
  cp -r front/src1/contexts/* front/src/shared/contexts/
  echo "    ✅ contexts"
fi

if [ -d "front/src1/services" ]; then
  cp -r front/src1/services/* front/src/shared/services/
  echo "    ✅ services"
fi

if [ -d "front/src1/api" ]; then
  cp -r front/src1/api/* front/src/shared/api/
  echo "    ✅ api"
fi

# ========================================
# MOVE TO FEATURES (Role-specific)
# ========================================

echo "  🚀 Moving features..."

# HAULER FEATURES
if [ -d "front/src1/components/hauler/dashboard" ]; then
  cp -r front/src1/components/hauler/dashboard/* front/src/features/hauler/dashboard/components/
  echo "    ✅ hauler dashboard"
fi

if [ -d "front/src1/components/hauler/analytics" ]; then
  cp -r front/src1/components/hauler/analytics/* front/src/features/hauler/analytics/components/
  echo "    ✅ hauler analytics"
fi

if [ -d "front/src1/components/hauler/exchange" ]; then
  cp -r front/src1/components/hauler/exchange/* front/src/features/hauler/exchange/components/
  echo "    ✅ hauler exchange"
fi

if [ -d "front/src1/components/hauler/planner" ]; then
  cp -r front/src1/components/hauler/planner/* front/src/features/hauler/planning/components/
  echo "    ✅ hauler planning"
fi

if [ -d "front/src1/components/hauler/operations/sites" ]; then
  cp -r front/src1/components/hauler/operations/sites/* front/src/features/hauler/operations/components/
  echo "    ✅ hauler operations"
fi

if [ -d "front/src1/components/hauler/admin" ]; then
  cp -r front/src1/components/hauler/admin/* front/src/features/hauler/admin/components/
  echo "    ✅ hauler admin"
fi

if [ -d "front/src1/components/hauler/maps" ]; then
  cp -r front/src1/components/hauler/maps/* front/src/features/hauler/tracking/components/
  echo "    ✅ hauler tracking"
fi

# SENDER FEATURES
if [ -d "front/src1/components/sender/content" ]; then
  cp -r front/src1/components/sender/content/* front/src/features/sender/dashboard/components/
  echo "    ✅ sender dashboard"
fi

if [ -d "front/src1/components/sender/banner" ]; then
  cp -r front/src1/components/sender/banner/* front/src/features/sender/marketing/components/
  echo "    ✅ sender marketing"
fi

# BROKER FEATURES  
if [ -d "front/src1/components/broker/content" ]; then
  cp -r front/src1/components/broker/content/* front/src/features/broker/dashboard/components/
  echo "    ✅ broker dashboard"
fi

if [ -d "front/src1/components/broker/banner" ]; then
  cp -r front/src1/components/broker/banner/* front/src/features/broker/marketing/components/
  echo "    ✅ broker marketing"
fi

# AUTH FEATURES
if [ -d "front/src1/components/shared/auth" ]; then
  cp -r front/src1/components/shared/auth/* front/src/features/auth/components/
  echo "    ✅ auth features"
fi

# HOME FEATURES
if [ -d "front/src1/components/home/banners" ]; then
  cp -r front/src1/components/home/banners/* front/src/features/home/components/
fi
if [ -d "front/src1/components/home/content" ]; then
  cp -r front/src1/components/home/content/* front/src/features/home/components/
fi
if [ -d "front/src1/components/home/stats" ]; then
  cp -r front/src1/components/home/stats/* front/src/features/home/components/
fi
echo "    ✅ home features"

# ========================================
# MOVE OTHER DIRECTORIES
# ========================================

echo "  📁 Moving other directories..."

# ASSETS
if [ -d "front/src1/assets" ]; then
  cp -r front/src1/assets/* front/src/assets/
  echo "    ✅ assets"
fi

# STYLES (to shared)
if [ -d "front/src1/styles" ]; then
  cp -r front/src1/styles/* front/src/shared/styles/
  echo "    ✅ styles"
fi

# PAGES (as-is for now)
if [ -d "front/src1/pages" ]; then
  cp -r front/src1/pages/* front/src/pages/
  echo "    ✅ pages (need manual updates)"
fi

# CONFIGS (keep in root level)
if [ -d "front/src1/configs" ]; then
  cp -r front/src1/configs front/src/
  echo "    ✅ configs"
fi

# LIB (keep in root level)
if [ -d "front/src1/lib" ]; then
  cp -r front/src1/lib front/src/
  echo "    ✅ lib"
fi

# DEV TOOLS
if [ -d "front/src1/_dev_tools" ]; then
  cp -r front/src1/_dev_tools/* front/src/dev/tools/
  echo "    ✅ dev tools"
fi

if [ -d "front/src1/stories" ]; then
  cp -r front/src1/stories/* front/src/dev/stories/
  echo "    ✅ stories"
fi

if [ -d "front/src1/components/tests" ]; then
  cp -r front/src1/components/tests/* front/src/dev/tests/
  echo "    ✅ tests"
fi

# ROOT FILES (App.tsx, main.tsx, etc.)
if [ -f "front/src1/App.tsx" ]; then
  cp front/src1/App.tsx front/src/
  echo "    ✅ App.tsx"
fi

if [ -f "front/src1/main.tsx" ]; then
  cp front/src1/main.tsx front/src/
  echo "    ✅ main.tsx"
fi

# Copy any other root-level files
find front/src1/ -maxdepth 1 -type f -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | while read file; do
  filename=$(basename "$file")
  cp "$file" "front/src/$filename"
  echo "    ✅ $filename"
done

# ========================================
# CREATE INDEX FILES
# ========================================

echo "📝 Creating index files for easy imports..."

# Domain indexes
for domain in organizations vehicles drivers orders shipments messaging; do
  cat > front/src/domains/$domain/index.ts << EOF
// File: front/src/domains/$domain/index.ts
// Last change: Domain barrel exports

export * from './components';
export * from './hooks';
export * from './services';
export * from './types';
export * from './utils';
EOF
done

# Feature indexes (for hauler)
for feature in dashboard fleet-management team-management operations exchange planning tracking analytics admin; do
  cat > front/src/features/hauler/$feature/index.ts << EOF
// File: front/src/features/hauler/$feature/index.ts
// Last change: Feature barrel exports

export * from './components';
export * from './hooks';
export * from './services';
export * from './types';
EOF
done

# Shared component indexes
cat > front/src/shared/components/index.ts << 'EOF'
// File: front/src/shared/components/index.ts
// Last change: Shared components barrel exports

export * from './ui';
export * from './layout';
export * from './maps';
export * from './connectors';
export * from './navigation';
EOF

echo "    ✅ Index files created"

# ========================================
# FINAL SUMMARY
# ========================================

echo ""
echo "🎉 SAFE MIGRATION COMPLETED!"
echo "============================"
echo ""
echo "📁 DIRECTORY STATUS:"
echo "  • front/src1/     → Original structure (PRESERVED)"
echo "  • front/src/      → New domain-driven structure"
echo ""
echo "📊 NEW STRUCTURE:"
if command -v tree &> /dev/null; then
  tree -d -L 3 front/src
else
  find front/src -type d | head -30
fi

echo ""
echo "✅ MIGRATION SUMMARY:"
echo "  • All files safely copied (originals in src1/)"
echo "  • Domain-driven structure created"
echo "  • Index files for easy imports"
echo "  • Ready for alias configuration"
echo ""
echo "🔧 NEXT STEPS:"
echo "  1. Update tsconfig.json with path aliases"
echo "  2. Test that app still runs: npm run dev"
echo "  3. Update import statements gradually"
echo "  4. When confident, remove front/src1/"
echo ""
echo "⚠️  FALLBACK PLAN:"
echo "  • If issues: rm -rf front/src && mv front/src1 front/src"
echo ""
echo "🚀 Ready to start with new structure!"