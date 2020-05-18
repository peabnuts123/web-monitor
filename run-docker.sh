#!/usr/bin/env sh

# Fail on non-zero exit code
set -e;

# Install dependencies
npm i;

# Start cron daemon
crond;

# Create and tail logfile
touch process.log;
tail -f process.log;
