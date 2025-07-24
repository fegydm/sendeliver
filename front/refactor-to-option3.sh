#!/usr/local/bin/bash
# File: front/refactor-to-option3.sh
# Last change: Final comprehensive refactoring to dot-depth naming convention

echo "🚀 Starting final refactoring to Option 3 naming convention..."
echo "=================================================="

# Presun do adresára 'front', kde sú zdrojové súbory
cd front || { echo "Error: 'front' directory not found. Exiting."; exit 1; }

# Create backup
echo "📁 Creating backup..."
BACKUP_DIR="src-before-refactor-$(date +%Y%m%d_%H%M%S)"
cp -r src "$BACKUP_DIR"
echo "Backup created in: $BACKUP_DIR"

# ========================================
# 1. FUNCTION FOR RENAMING FILES TO NEW CONVENTION
# ========================================
rename_to_new_convention() {
    local old_path="$1"
    local filename=$(basename "$old_path")
    local dirname=$(dirname "$old_path")
    # Get relative path to 'src/' (e.g., 'shared/components/elements/DriverCard.tsx')
    local relative_path="${old_path#src/}"

    local domain=""
    local item_name_raw="" # Original item name before kebab-case conversion
    local file_type=""
    local new_filename=""

    # 1. Determine DOMAIN from path
    if [[ "$relative_path" == "shared/"* ]]; then
        domain="shared"
    elif [[ "$relative_path" == "auth/"* ]]; then
        domain="auth"
    elif [[ "$relative_path" == "hauler/"* ]]; then
        domain="hauler"
    elif [[ "$relative_path" == "pages/"* ]]; then
        # Take the first subfolder name for 'pages' domain (e.g., 'test2' from 'pages/test2/')
        domain=$(echo "$relative_path" | cut -d'/' -f2)
        if [ -z "$domain" ]; then domain="pages"; fi # Fallback if no subfolder
    else
        domain="app" # Default domain if none specific is derived
    fi

    # 2. Determine TYPE and ITEM_NAME from filename and path
    # Rules are ordered from most specific to most general
    if [[ "$filename" =~ ^(.+)Context\.tsx$ ]]; then
        item_name_raw="${BASH_REMATCH[1]}"
        file_type="context.tsx"
    elif [[ "$filename" =~ ^(.+)Hook\.ts$ ]]; then
        item_name_raw="${BASH_REMATCH[1]}"
        file_type="hook.ts"
    elif [[ "$filename" =~ ^(.+)Types\.ts$ ]]; then
        item_name_raw="${BASH_REMATCH[1]}"
        file_type="types.ts"
    elif [[ "$filename" =~ ^(.+)Service\.ts$ ]]; then
        item_name_raw="${BASH_REMATCH[1]}"
        file_type="service.ts"
    # Old explicit component/container/element suffixes
    elif [[ "$filename" =~ ^(.+)Component\.tsx$ ]]; then
        item_name_raw="${BASH_REMATCH[1]}"
        file_type="comp.tsx"
    elif [[ "$filename" =~ ^(.+)Container\.tsx$ ]]; then
        item_name_raw="${BASH_REMATCH[1]}"
        file_type="container.tsx"
    elif [[ "$filename" =~ ^(.+)Element\.tsx$ ]]; then
        item_name_raw="${BASH_REMATCH[1]}"
        file_type="comp.tsx" # Element is considered a component
    # Type derivation from directory (for PascalCase files without explicit suffix)
    elif [[ "$relative_path" == *"contexts/"* ]]; then
        item_name_raw=$(echo "$filename" | gsed -E 's/\.tsx$//')
        file_type="context.tsx"
    elif [[ "$relative_path" == *"hooks/"* ]]; then
        item_name_raw=$(echo "$filename" | gsed -E 's/\.ts$//')
        file_type="hook.ts"
    elif [[ "$relative_path" == *"types/"* ]]; then
        item_name_raw=$(echo "$filename" | gsed -E 's/\.ts$//')
        file_type="types.ts"
    # Default case for PascalCase files in component/element/pages directories
    elif [[ "$filename" =~ ^[A-Z][a-zA-Z0-9]*\.(tsx|ts)$ && ("$relative_path" == *"components/"* || "$relative_path" == *"elements/"* || "$relative_path" == *"pages/"*) ]]; then
        item_name_raw=$(echo "$filename" | gsed -E 's/\.(tsx|ts)$//')
        file_type="comp.tsx"
    # Last resort: if it's a PascalCase .tsx/.ts, but not in a known component folder, default to comp.
    elif [[ "$filename" =~ ^[A-Z][a-zA-Z0-9]*\.(tsx|ts)$ ]]; then
        item_name_raw=$(echo "$filename" | gsed -E 's/\.(tsx|ts)$//')
        file_type="comp.tsx"
    else
        # No rule matched, maybe it's not a type we want to rename
        echo "  Warning: File '$filename' not matched by any specific rule. Manual review needed."
        return 1
    fi

    # Convert item_name_raw (PascalCase or other format) to kebab-case
    # This version is compatible with older Bash and GNU sed
    item_name=$(echo "$item_name_raw" | gsed -E 's/([A-Z])/-\L\1/g' | gsed -E 's/^-//' | tr '[:upper:]' '[:lower:]')

    # Combine domain, item_name, and file_type
    if [ -n "$domain" ] && [ -n "$item_name" ] && [ -n "$file_type" ]; then
        new_filename="${domain}.${item_name}.${file_type}"
    else
        echo "  Error: Could not construct new filename for '$old_path'. Missing domain, item_name or file_type."
        return 1
    fi

    local new_path="$dirname/$new_filename"

    if [ "$old_path" != "$new_path" ]; then # Check to prevent renaming a file to itself
        echo "  Renaming: $old_path → $new_path"
        mv "$old_path" "$new_path"

        # Update file header comment
        # Using gsed for regex compatibility
        gsed -i "1s|.*|// File: ${new_path#src/}|" "$new_path"

        # Update associated CSS file (if exists)
        local old_css_path=$(echo "$old_path" | gsed 's/\.tsx$/.css/')
        if [ -f "$old_css_path" ]; then
            # New CSS filename should also follow domain.item-name.css convention
            local new_css_filename="${domain}.${item_name}.css"
            local new_css_path="$dirname/$new_css_filename"
            echo "  Moving associated CSS: $old_css_path → $new_css_path"
            mv "$old_css_path" "$new_css_path"
            # Update CSS import in the renamed TSX file
            # Using gsed for regex compatibility
            gsed -i "s|./$(basename "$old_css_path")|./$(basename "$new_css_path")|g" "$new_path"
        fi
    fi
}

# --- Execute file renaming ---
echo "📝 Renaming files to new convention..."
# Use -depth to process files before directories (even if not renaming directories yet)
# Include .css files, but they will only be renamed within rename_to_new_convention if associated with a .tsx file.
find src -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.css" \) -depth | while read file_to_process; do
    if [[ "$file_to_process" == *.tsx || "$file_to_process" == *.ts ]]; then
        rename_to_new_convention "$file_to_process"
    elif [[ "$file_to_process" == *.css ]]; then
        # CSS files are renamed via logic in rename_to_new_convention for their associated .tsx file.
        # So, we skip them here to prevent double processing or errors.
        continue
    fi
done

# ========================================
# 2. UPDATE PASCALCASE COMPONENT NAMES TO CAMELCASE WITHIN FILES
# ========================================
echo "✨ Updating PascalCase component names to camelCase within files..."

# Function to convert PascalCase to camelCase (compatible with older Bash)
pascal_to_camel() {
    local pascal="$1"
    # Converts the first character to lowercase using awk, which is generally reliable
    echo "$pascal" | awk '{print tolower(substr($0,1,1)) substr($0,2)}'
}

# Iterate through all .tsx files (which should now be renamed to the new convention)
find src -name "*.tsx" | while read file; do
    echo "  Processing internal component names in: $file"

    # Find potential PascalCase component names within the file.
    # This searches for names that:
    # 1. Are preceded by 'const', 'function', 'export default'
    # 2. Are part of an opening JSX tag (<ComponentName) or closing (</ComponentName>)
    # 3. Start with an uppercase letter ([A-Z]) and have at least 2 more alphanumeric characters ([a-zA-Z0-9]{2,})
    #    This helps filter out short, potentially problematic words like "SVG", "MAP", "Test", "File", "Last", etc.
    gsed -E -n 's/\b(const|function|export default|[<][/]?)([A-Z][a-zA-Z0-9]{2,})\b/\2/p' "$file" | while read -r original_pascal_name; do
        
        # Double check that the name is at least 3 characters long and starts with an uppercase letter
        if [ -z "$original_pascal_name" ] || [ ${#original_pascal_name} -lt 3 ] || [[ ! "$original_pascal_name" =~ ^[A-Z] ]]; then
            continue
        fi

        camel_name=$(pascal_to_camel "$original_pascal_name")

        # Only proceed if PascalCase and camelCase names are different
        if [ "$original_pascal_name" != "$camel_name" ]; then
            echo "    Changing '$original_pascal_name' to '$camel_name'"

            # Change component declaration (const, function)
            # Use word boundaries \b and GNU sed syntax
            gsed -i -E "s/\b(const|function) ${original_pascal_name}\b/\1 ${camel_name}/g" "$file"
            
            # Change default export
            gsed -i -E "s/\b(export default) ${original_pascal_name}\b/\1 ${camel_name}/g" "$file"

            # Change JSX tags (now with Gsed, non-greedy '?' should work, but use '.*?' for robustness)
            # For opening tags: <MyComponent ...>
            gsed -i -E "s|<${original_pascal_name}([^>]*)>|<${camel_name}\1>|g" "$file"
            # For closing tags: </MyComponent>
            gsed -i -E "s|</${original_pascal_name}>|</${camel_name}>|g" "$file"
            # For self-closing tags: <MyComponent .../>
            gsed -i -E "s|<${original_pascal_name}([^/]*?)/>|<${camel_name}\1/>|g" "$file" 
        fi
    done
done

# ========================================
# 3. UPDATE IMPORTS SYSTEMATICALLY
# ========================================
echo "🔗 Updating imports systematically..."

# This part is the most complex for 100% automation without knowing all renamed paths.
# It will attempt generic replacements of suffixes and PascalCase names to camelCase for imports.
# It is recommended to run 'npm run build' after this script and manually fix any remaining import errors.

find src -name "*.tsx" -o -name "*.ts" | while read file; do
    echo "  Updating imports in: $file"
    
    # Change import paths: .component to .comp
    # Using [\"'] to capture both types of quotes without nesting issues
    gsed -i -E 's/\.component([\"'\''])/\.(comp)\1/g' "$file"
    # Change import paths: .container
    gsed -i -E 's/\.container([\"'\''])/\.(container)\1/g' "$file"
    # Change import paths: .element to .comp
    gsed -i -E 's/\.element([\"'\''])/\.(comp)\1/g' "$file"
    
    # Change import paths for types (Context, Hook, Types, Service)
    # Searches for a path ending in the type, and changes it to .type, converting the name to lowercase
    # Example: ../MyComponentContext' -> ../my-component.context'
    gsed -i -E 's|(import .* from [\"'\''].*\/)([A-Za-z0-9]+)Context([\"'\''])|\1\L\2\.context\3|g' "$file"
    gsed -i -E 's|(import .* from [\"'\''].*\/)([A-Za-z0-9]+)Hook([\"'\''])|\1\L\2\.hook\3|g' "$file"
    gsed -i -E 's|(import .* from [\"'\''].*\/)([A-Za-z0-9]+)Types([\"'\''])|\1\L\2\.types\3|g' "$file"
    gsed -i -E 's|(import .* from [\"'\''].*\/)([A-Za-z0-9]+)Service([\"'\''])|\1\L\2\.service\3|g' "$file"


    # For changing imported names (e.g., `import MessageBanner from ...` to `import messageBanner from ...`)
    # This is still risky and may require manual verification.
    # Uses \L to convert from PascalCase to camelCase directly in the regex
    # This regex targets:
    # 1. `import ComponentName from ...`
    # 2. `import { ComponentName } from ...` (named imports)
    # It looks for PascalCase names with at least 3 alphanumeric characters.
    gsed -i -E 's/(import )([A-Z][a-zA-Z0-9]{2,})( from [\"'\''].*[\"'\''\;])/\1\L\2\3/g' "$file"
    gsed -i -E 's/(import \{[^}]*)(\b[A-Z][a-zA-Z0-9]{2,}\b)([^}]*from [\"'\''].*[\"'\''\;])/\1\L\2\3/g' "$file"
    # Note: \L in gsed converts the following text to lowercase.
    # For complex imports (alias imports, re-exports), this may not be 100% reliable.
done


# ========================================
# 4. VERIFY AND TEST
# ========================================

echo "🧪 Testing new structure..."

echo "Checking for potential old import suffixes (should be empty or minimal)..."
# Searches for old suffixes in imports (excluding those in comments)
find src -name "*.tsx" -o -name "*.ts" | xargs grep -l -E "import.*(\.component|\.container|\.element|Context|Hook|Types|Service)(['\" ])" | head -10

echo "Trying to build the project..."
# Runs build and outputs the first 20 lines of output (including errors)
npm run build 2>&1 | head -20

echo ""
echo "🎉 REFACTORING ATTEMPT COMPLETE!"
echo "================================="
echo ""
echo "📊 NEW STRUCTURE SUMMARY:"
echo "• File names: domain.item-name.type.tsx (item-name in kebab-case)"
echo "• DB: snake_case"
echo "• Variables: camelCase"
echo ""
echo "📁 BACKUP CREATED:"
echo "• Original structure saved in $BACKUP_DIR"
echo ""
echo "🔍 NEXT STEPS (CRITICAL!):"
echo "1. **Run 'npm run build' and 'npm run test' (if applicable) and fix ALL reported errors.**"
echo "   Pay special attention to import errors and component not found errors."
echo "   Your IDE's refactoring tools might help with remaining imports."
echo "2. **Visually inspect file structure:** `find src -name '*.tsx' | head -50`"
echo "3. **Review any 'Warning' messages** from the script and address those files manually."
echo "4. After successful build and testing, you can delete the backup: `rm -rf $BACKUP_DIR`"
echo ""
echo "🚀 Good luck with the final cleanup!"