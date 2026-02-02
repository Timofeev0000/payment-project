up:
	docker compose up -d

down:
	docker compose down

build:
	docker compose build

build-no-cache:
	docker compose build --no-cache
	
logs-frontend:
	docker compose logs -f frontend

logs-backend:
	docker compose logs -f backend

logs-db:
	docker compose logs -f postgres