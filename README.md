# Web Monitor

A simple tool for monitoring the web. It will check parts of web pages on a schedule, and send emails when those pages change, including a summary of what changed.

## Prerequisites
  - [Docker](https://www.docker.com/) and [docker-compose](https://docs.docker.com/compose/)

## Running this project

1. Copy `.env.sample` to `.env` and fill out the required values
1. Copy `config.sample.toml` to `config.toml` and add sites as you see fit
1. Ensure `crontab.properties` is owned by root (yeah, I know.) by running `sudo chown root crontab.properties`
1. Start the stack by running `docker-compose up --detach`

## Config notes

Config is done in `config.toml` by declaring an array of objects called `sites`, each object containing a few properties:

  - `url` - The URL to visit
  - `selector` - The part of the page to monitor
    - This is any CSS selector that could be used by `document.querySelector`.
    - Note that (as with `document.querySelector`) if there are multiple instances of the selector on the page, the first one will be used
  - `frequency` - How often this site should be checked
    - Available frequencies:
    - `{1,5,10,15,20,30}min` - every X minutes
      - e.g. `5min` - every 5 minutes: `05:00`, `05:05`, `05:10`, etc.
    - `{1,2,3,4,6,12}hour` - every X hours
      - e.g. `3hour` - every 3 hours: `03:00`, `06:00`, `09:00` etc.
    - `1day` - every day

      Some examples:
      ```toml
      frequency = '15min' # Every 15 minutes
      frequency = '1min'  # Every minute
      frequency = '2hour' # Every 2 hours
      frequency = '1day'  # Every day
      ```

Note that the scheduler will not actually run at uniform intervals (e.g. 5:00, 5:05 etc.), it will depend on when the app was booted. The scheduler only runs once per minute and checks how _long_ it has been since the last time each entry was run.

## Architecture

The project has 2 docker containers:

  - `browserless/chrome` container running an instance of headless chrome
  - `node:alpine` Node.js container running this code

The node.js container controls a headless chrome instance in the chrome container, using Puppeteer. It instructs the chrome instance to visit each page on a schedule (specified by `frequency`) and take a snapshot of the page, specified by `selector`. It then compares this snapshot to the last time it ran, and sends an email (containing a diff) if the snapshot has changed.

## Backlog / TODO
  - Better documentation
  - Add a test project
  - Add support for selector arrays
  - Add support for shadow roots / web components
  - Add support for a chain of selectors?
  - Limit docker log size
  - Add support for some kind of selector blacklist / remover for problematic elements
  - Add tsconfig-paths?
