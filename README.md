# Web Monitor

@TODO write this README.

Available frequencies:
  * `{1,5,10,15,20,30}min` - every X minutes
    * e.g. `5min` - every 5 minutes: `05:00`, `05:05`, `05:10`, etc.
  * `{1,2,3,4,6,12}hour` - every X hours
    * e.g. `3hour` - every 3 hours: `03:00`, `06:00`, `09:00` etc.
  * `1day` - every day (at midnight)

more examples:
```toml
frequency = '15min' # Every 15 minutes
frequency = '1min'  # Every minute
frequency = '2hour' # Every 2 hours
frequency = '1day'  # Every day (at midnight)
```

## Architecture
  - `browserless/chrome` container

## Backlog / TODO
  - Documentation
  - Add a test project
  - Add tsconfig-paths
