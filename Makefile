start:
	docker volume create kysely-db-data
	docker compose up -d

stop:
	docker compose down

rebuild:
	docker compose down && docker compose up -d --build --force-recreate

restart-api:
	docker compose rm api --force && docker compose up -d api
