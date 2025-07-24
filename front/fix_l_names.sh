#!/usr/local/bin/bash

echo "🚀 Starting targeted fix for 'l' prefixes in filenames and imports..."
echo "=================================================="

# Ensure we are in the 'front' directory for operations
cd front || { echo "Error: 'front' directory not found. Exiting."; exit 1; }

# Create a fresh backup before this operation
echo "📁 Creating new backup before fixing 'l' prefixes..."
BACKUP_DIR_L_FIX="src-before-l-fix-$(date +%Y%m%d_%H%M%S)"
cp -r src "$BACKUP_DIR_L_FIX"
echo "Backup for 'l' fix created in: $BACKUP_DIR_L_FIX"

echo "📝 Fixing filenames by removing unwanted 'l' prefixes..."
# Find files that definitively contain the unwanted 'l' prefix after a dot or hyphen
# Example: shared.lmessage-lbanner.comp.tsx or app.lapp.comp.tsx
find src -type f -regex ".*\.l[a-zA-Z0-9-]*\.(comp|container|context|hook|types|css|tsx|ts)" | while read old_path; do
    filename=$(basename "$old_path")
    dirname=$(dirname "$old_path")

    # This gsed command aims to remove 'l' specifically after a dot or after a hyphen-l-word
    # Example: .lmessage-lbanner.comp.tsx -> .message-banner.comp.tsx
    # Example: hauler.lanalytics.comp.tsx -> hauler.analytics.comp.tsx
    new_filename=$(echo "$filename" | gsed -E 's/(\.)l([a-zA-Z0-9-]+)/\1\2/g' | gsed -E 's/(\-)l([a-zA-Z0-9])/\-\2/g')

    if [ "$filename" != "$new_filename" ]; then
        new_path="$dirname/$new_filename"
        echo "  Renaming: $old_path -> $new_path"
        mv "$old_path" "$new_path"
    fi
done

echo "🔗 Fixing imports and references within files by removing unwanted 'l' prefixes..."
# Target only .tsx and .ts files for content modification
find src -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.css" \) | while read file_to_process; do
    # Only process files that might contain the 'l' artifact in their name or paths
    # (Checking new name, as old names are gone, but also general files for import paths)
    
    # This gsed command aims to correct import paths and potential variable names
    # s/(\.)l([a-zA-Z0-9-]+)/\1\2/g   - Removes .l (e.g., .lmessage-lbanner -> .message-banner)
    # s/(\-)l([a-zA-Z0-9])/\-\2/g    - Removes -l (e.g., -lmessage-lbanner -> -message-banner)
    # s/\b(l)([a-zA-Z][a-zA-Z0-9]{2,})\b/\2/g - Removes 'l' from variable/component names if it appears as a prefix (e.g., lMessageBanner -> MessageBanner)
    gsed -i -E 's/(\.)l([a-zA-Z0-9-]+)/\1\2/g; s/(\-)l([a-zA-Z0-9])/\-\2/g; s/\b(l)([A-Z][a-zA-Z0-9]{2,})\b/\2/g; s/\b(l)([a-z][a-zA-Z0-9]{2,})\b/\2/g' "$file_to_process"
    
    # Special case for "lapp" in "app.lapp.comp" if that was not fixed by general rules
    # This might have been manually fixed already, but good for robustness
    gsed -i -E 's/app\.lapp\.comp/app\.front/g' "$file_to_process" # For filenames and imports
    gsed -i -E 's/import lapp /import App /g' "$file_to_process" # For the specific import 'lapp' if it exists

done

echo "🎉 'l' prefix fix complete!"
echo "========================"
echo ""
echo "Please run 'npm run build' to verify. You might still need to fix some import paths and PascalCase names manually."
echo "You can check for remaining 'l's with: `find src -name '*l*.tsx' | head -10`"
echo "And for incorrect imports with `npm run build` errors."