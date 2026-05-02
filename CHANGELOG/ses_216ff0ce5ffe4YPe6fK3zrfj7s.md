# Session: ses_216ff0ce5ffe4YPe6fK3zrfj7s

**Date:** 2026-05-02T13:04:06.810Z
**Title:** Agregar nodemon a npm start:dev

## Summary

Added nodemon to the project's development workflow to enable live-reload functionality.

## Changes Made

1. **Updated `start:dev` script** in `package.json`:
   - Changed from: `"start:dev": "ts-node src/main.ts"`
   - Changed to: `"start:dev": "nodemon --exec ts-node src/main.ts"`

2. **Added `nodemon` as devDependency** in `package.json`:
   - Added `"nodemon": "^3.1.9"` to devDependencies

## Next Step

Run `npm install` to install the new dependency, then use `npm run start:dev` for live-reload development.