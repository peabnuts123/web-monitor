#!/usr/bin/env sh

# Change into source directory
cd /home/node || exit 1;

# Run command and pass command line arguments
NODE_ENV=production npm start >> process.log 2>&1;
