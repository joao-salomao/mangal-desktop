#!/bin/bash
# This script downloads all custom scrapers from the mangal-scrapers repository and place them mangal sources folder. It
# requires curl and unzip to be installed on the system.

# GitHub repository URL
REPO_URL="https://github.com/metafates/mangal-scrapers/archive/refs/heads/main.zip"

# Temporary directory for the extracted folder
TEMP_DIR=$(mktemp -d)

# Output file name for the ZIP file
OUTPUT_ZIP="$TEMP_DIR/mangal-scrapers-main.zip"

SCRAPERS_SOURCE_FOLDER="./src-tauri/assets/mangal/sources"

# Download the repository
echo "Downloading repository from $REPO_URL..."
curl -L -o "$OUTPUT_ZIP" "$REPO_URL"

# Check if the download was successful
if [ $? -ne 0 ]; then
    echo "Failed to download repository."
    exit 1
fi

# Extract the ZIP file
echo "Extracting repository to $TEMP_DIR..."
unzip -q "$OUTPUT_ZIP" -d "$TEMP_DIR"

# Check if extraction was successful
if [ $? -ne 0 ]; then
    echo "Failed to extract repository."
    exit 1
fi

# Remove old sources folder
rm -rf $SCRAPERS_SOURCE_FOLDER

# Copy repository scrapers folder to the sources folder
echo "Copying custom scrapers to $SCRAPERS_SOURCE_FOLDER"
mv "$TEMP_DIR/mangal-scrapers-main/scrapers/" "$SCRAPERS_SOURCE_FOLDER"

if [ $? -ne 0 ]; then
    echo "Failed to copy custom scrapers."
    exit 1
fi

# Remove the ZIP file after extraction
rm "$OUTPUT_ZIP"

echo "Successfully downloaded and extracted custom scrapers."