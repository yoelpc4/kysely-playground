# Kysely Playground

## Getting started

- Copy `.env.example` to `.env` then adjust environment values
  ```shell
  cp .env.example .env
  ```
- Build and start containers
  ```shell
  make start
  ```
- While waiting the build process, register these lines on `/etc/hosts` file
  ```
  127.0.0.1 api.local.kysely.com
  127.0.0.1 traefik.local.kysely.com
  ```
- Once containers are started, execute migrations until the latest migration
  ```shell
  docker exec -it kysely-api-1 yarn kysely migrate:latest
  ```
- Execute seeders
  ```shell
  docker exec -it kysely-api-1 yarn kysely seed:run
  ```
- Generate database schema
  ```shell
  docker exec -it kysely-api-1 yarn kysely:generate
  ```
- Import both postman collection and postman environment files
