DBCONTAINER=sv-db
DBUSER=root
DBPASS=12345678
DBNAME=svdb
app=svapp:1.0

.PHONY: help

help: ## Display this help screen
	@awk 'BEGIN {FS = ":.*##"; printf "\nUsage:\n make \033[36m<target>\033[0m\n"} /^[a-zA-Z_-]+:.*?##/ { printf " \033[36m%-15s\033[0m %s\n", $$1, $$2 } /^##@/ { printf "\n\033[1m%s\033[0m\n", substr($$0, 5) } ' $(MAKEFILE_LIST)

up: build-app ### Run docker-compose if app image not found will build
	docker-compose up --build -d svapp svdb svpma && docker-compose logs -f
.PHONY: up

down: ### Down docker-compose
	docker-compose down --remove-orphans
.PHONY: down

build-app: ###### Docker Build --platform linux/amd64 -f Dockerfile-test -t ${app} .
	@echo $(app)
	docker build -f Dockerfile-local -t ${app} .
.PHONY: build-app

clean: down ### Remove Image Docker
	docker rmi -f $(shell docker images -q ${app})
.PHONY: clean

run: up ### Swag run
.PHONY: run

cr: ### Drush Clear Cache
	docker exec sv-app ./vendor/drush/drush/drush cr
.PHONY: cr

ce:	### Export Database to Config File .yml
	docker exec sv-app ./vendor/drush/drush/drush config:export
.PHONY: ce

im:	### Import All Will Delete All Existing Config Database .yml
	docker exec sv-app ./vendor/drush/drush/drush cim
.PHONY: im

im-par:	### Import Partial Config File
	docker exec sv-app ./vendor/drush/drush/drush cim --partial
.PHONY: im-par

updb: ### Drush Update
	docker exec sv-app ./vendor/drush/drush/drush updb
.PHONY: updb

app-bash: ### Run Container App/Nginx
	docker exec -it sv-app bash
.PHONY: app-bash

###########################################################
# Command Database #
###########################################################
flus:
	docker exec sv-app ./vendor/drush/drush/drush sql:query "FLUSH PRIVILEGES;"
.PHONY: flus

allow-user: flus
	docker exec sv-app ./vendor/drush/drush/drush sql:query "UPDATE mysql.user SET host='%' WHERE user=${DBUSER};"
.PHONY: allow-user

cr-db: ### Create Database on Container
	docker exec -i sv-db mysql -u ${DBUSER} --password=${DBPASS} -e "drop database if exists ${DBNAME}; create database ${DBNAME}"
.PHONY: cr-db

cpdb: ### Copy Database .sql to Container
	docker cp infra/dump/${DBNAME}_dump.sql sv-app:/tmp
.PHONY: cpdb

migrate: ### Create New Migration
	docker exec -i ${DBCONTAINER} mysql -u ${DBUSER} --password=${DBPASS} -e "drop database if exists ${DBNAME}; create database ${DBNAME}" && docker exec -i ${DBCONTAINER} mysql -u ${DBUSER} --password=${DBPASS} ${DBNAME} < infra/dump/${DBNAME}_dump.sql
.PHONY: migrate

dump: ### Export Database .sql & Copy to local
	docker exec sv-app ./vendor/drush/drush/drush sql:dump --result-file=/tmp/${DBNAME}_dump.sql && docker cp sv-app:/tmp/${DBNAME}_dump.sql ./infra/dump/
.PHONY: dump

db-bash: ### Run Container Database
	docker exec -it sv-db bash
.PHONY: db-bash

sv-db: ### Run Container Image Database
	docker exec -it sv-db mysql -u ${DBUSER} -p${DBPASS} ${DBNAME}
.PHONY: sv-db
