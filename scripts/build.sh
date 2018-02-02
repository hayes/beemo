#!/bin/sh

for f in packages/*; do
  package=`basename $f`

  if [ -d "$f" ] && [ -e "$f/package.json" ]; then
    ./node_modules/babel-cli/bin/babel.js $f/src --out-dir $f/lib --copy-files
  fi
done

cp README.md packages/core/README.md
