#!/bin/bash

# Script to change the app name in all relevant places
# Usage: ./change-app-name.sh "New App Name"

# Exit on any error
set -e

# Check if a new name was provided
if [ -z "$1" ]; then
  echo "Error: No app name provided"
  echo "Usage: ./change-app-name.sh \"New App Name\""
  exit 1
fi

NEW_NAME="$1"
CURRENT_DIR=$(pwd)

# Try to detect current app name from config.ts
CURRENT_NAME=""
if [ -f "src/lib/config.ts" ]; then
  CURRENT_NAME=$(grep -o 'return "[^"]*"' src/lib/config.ts | sed 's/return "//' | sed 's/"//')
fi

# If we couldn't get the name from config.ts, try package.json
if [ -z "$CURRENT_NAME" ] && [ -f "package.json" ]; then
  CURRENT_NAME=$(grep -o '"name": "[^"]*"' package.json | sed 's/"name": "//' | sed 's/"//')
fi


# Create uppercase and lowercase versions for better matching
CURRENT_NAME_UPPER=$(echo "$CURRENT_NAME" | tr '[:lower:]' '[:upper:]')
CURRENT_NAME_LOWER=$(echo "$CURRENT_NAME" | tr '[:upper:]' '[:lower:]')
NEW_NAME_LOWER=$(echo "$NEW_NAME" | tr '[:upper:]' '[:lower:]')

echo "🔍 Detected current app name: $CURRENT_NAME"
echo "🚀 Changing app name to: $NEW_NAME"
echo "📂 Working in directory: $CURRENT_DIR"

# Function to perform sed operation based on OS
perform_sed() {
  local file="$1"
  local search="$2"
  local replace="$3"
  
  if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s|$search|$replace|g" "$file"
  else
    # Linux and others
    sed -i "s|$search|$replace|g" "$file"
  fi
}

# 1. Update package.json
if [ -f "package.json" ]; then
  echo "✏️ Updating name in package.json"
  
  # Update the name field
  if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s/\"name\": \"[^\"]*\"/\"name\": \"$NEW_NAME\"/" package.json
  else
    # Linux and others
    sed -i "s/\"name\": \"[^\"]*\"/\"name\": \"$NEW_NAME\"/" package.json
  fi
  
  # Also update repository URL if it contains the app name
  if grep -q "github.com.*$CURRENT_NAME_LOWER" package.json; then
    perform_sed "package.json" "github.com/[^/]*/[^\"]*$CURRENT_NAME_LOWER" "github.com/ahmedmustafaux/$NEW_NAME_LOWER"
  fi
  
  echo "✅ Updated package.json"
else
  echo "⚠️ Warning: package.json not found"
fi

# 2. Create or update .env file with VITE_APP_NAME
echo "📄 Creating/updating .env file"
if [ -f ".env" ]; then
  # Check if VITE_APP_NAME already exists in .env
  if grep -q "VITE_APP_NAME=" .env; then
    # Update existing VITE_APP_NAME
    if [[ "$OSTYPE" == "darwin"* ]]; then
      # macOS
      sed -i '' "s/VITE_APP_NAME=.*/VITE_APP_NAME=$NEW_NAME/" .env
    else
      # Linux and others
      sed -i "s/VITE_APP_NAME=.*/VITE_APP_NAME=$NEW_NAME/" .env
    fi
  else
    # Add VITE_APP_NAME to .env
    echo "VITE_APP_NAME=$NEW_NAME" >> .env
  fi
else
  # Create new .env file
  echo "VITE_APP_NAME=$NEW_NAME" > .env
fi
echo "✅ Updated .env file with VITE_APP_NAME=$NEW_NAME"

# 3. Create or update .env.development file for development environment
echo "📄 Creating/updating .env.development file"
if [ -f ".env.development" ]; then
  # Check if VITE_APP_NAME already exists in .env.development
  if grep -q "VITE_APP_NAME=" .env.development; then
    # Update existing VITE_APP_NAME
    if [[ "$OSTYPE" == "darwin"* ]]; then
      # macOS
      sed -i '' "s/VITE_APP_NAME=.*/VITE_APP_NAME=$NEW_NAME/" .env.development
    else
      # Linux and others
      sed -i "s/VITE_APP_NAME=.*/VITE_APP_NAME=$NEW_NAME/" .env.development
    fi
  else
    # Add VITE_APP_NAME to .env.development
    echo "VITE_APP_NAME=$NEW_NAME" >> .env.development
  fi
else
  # Create new .env.development file
  echo "VITE_APP_NAME=$NEW_NAME" > .env.development
fi
echo "✅ Updated .env.development file with VITE_APP_NAME=$NEW_NAME"

# 4. Update the default in src/lib/config.ts as a fallback
if [ -f "src/lib/config.ts" ]; then
  echo "✏️ Updating default app name in src/lib/config.ts"
  # Use sed differently based on OS
  if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s/return \"[^\"]*\"/return \"$NEW_NAME\"/" src/lib/config.ts
  else
    # Linux and others
    sed -i "s/return \"[^\"]*\"/return \"$NEW_NAME\"/" src/lib/config.ts
  fi
  echo "✅ Updated src/lib/config.ts"
else
  echo "⚠️ Warning: src/lib/config.ts not found"
fi

# 5. Update README.md
if [ -f "README.md" ]; then
  echo "✏️ Updating app name in README.md"
  
  # Update all case variations of the app name
  perform_sed "README.md" "$CURRENT_NAME_UPPER" "$NEW_NAME"
  perform_sed "README.md" "$CURRENT_NAME" "$NEW_NAME"
  perform_sed "README.md" "$CURRENT_NAME_LOWER" "$NEW_NAME_LOWER"
  
  echo "✅ Updated README.md"
else
  echo "⚠️ Warning: README.md not found"
fi

# 6. Check for other potential files that might contain the app name
echo "🔍 Checking for other potential files that might contain the app name..."

# Check for DEVELOPMENT_GUIDELINES.md
if [ -f "DEVELOPMENT_GUIDELINES.md" ] && grep -q "$CURRENT_NAME" "DEVELOPMENT_GUIDELINES.md"; then
  echo "✏️ Updating app name in DEVELOPMENT_GUIDELINES.md"
  perform_sed "DEVELOPMENT_GUIDELINES.md" "$CURRENT_NAME_UPPER" "$NEW_NAME"
  perform_sed "DEVELOPMENT_GUIDELINES.md" "$CURRENT_NAME" "$NEW_NAME"
  perform_sed "DEVELOPMENT_GUIDELINES.md" "$CURRENT_NAME_LOWER" "$NEW_NAME_LOWER"
  
  echo "✅ Updated DEVELOPMENT_GUIDELINES.md"
fi

# Check for SEARCH_HIGHLIGHTING_GUIDE.md
if [ -f "SEARCH_HIGHLIGHTING_GUIDE.md" ] && grep -q "$CURRENT_NAME" "SEARCH_HIGHLIGHTING_GUIDE.md"; then
  echo "✏️ Updating app name in SEARCH_HIGHLIGHTING_GUIDE.md"
  perform_sed "SEARCH_HIGHLIGHTING_GUIDE.md" "$CURRENT_NAME_UPPER" "$NEW_NAME"
  perform_sed "SEARCH_HIGHLIGHTING_GUIDE.md" "$CURRENT_NAME" "$NEW_NAME"
  perform_sed "SEARCH_HIGHLIGHTING_GUIDE.md" "$CURRENT_NAME_LOWER" "$NEW_NAME_LOWER"
  
  echo "✅ Updated SEARCH_HIGHLIGHTING_GUIDE.md"
fi

echo ""
echo "🎉 App name has been changed to \"$NEW_NAME\" successfully!"
echo "📝 Changes made:"
echo "  - Updated package.json name field"
echo "  - Created/updated .env with VITE_APP_NAME=$NEW_NAME"
echo "  - Created/updated .env.development with VITE_APP_NAME=$NEW_NAME"
echo "  - Updated default app name in src/lib/config.ts"
echo "  - Updated app name references in README.md"
echo "  - Checked and updated other documentation files if needed"
echo ""
echo "🔄 Restart your development server for changes to take effect"