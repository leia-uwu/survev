#! /usr/bin/env bash

# Script to export all SVGs to PNGs
# Using node-canvas to render the SVGs can result in some errors
# That inkscape doesn't produce
# Also having cached PNGs can make the build faster

OUT_DIR=pngs
rm -rf $OUT_DIR
mkdir $OUT_DIR
# can't specify an alternate output directory to inkscape batch export CLI...
# so we copy every SVG to the output directory
# then run inkscape on it
# then remove the SVGs from the output dir since we only care about the PNGs
cp -r ../public/img/ -T ./$OUT_DIR

# Process top-level SVGs
ROOT_SVGS=$(find "$OUT_DIR" -maxdepth 1 -iname "*.svg")
if [ -n "$ROOT_SVGS" ]; then
  echo "📁 Processing root-level SVGs..."
  inkscape --export-type=png $ROOT_SVGS
  rm $ROOT_SVGS
fi

# Process folders one-by-one
for folder in "$OUT_DIR"/*; do
  if [ -d "$folder" ]; then
    echo "📦 Processing folder: $folder"
    SVGS=$(find "$folder" -maxdepth 1 -iname "*.svg")
    if [ -n "$SVGS" ]; then
      inkscape --export-type=png $SVGS
      rm $SVGS
    fi
  fi
done
