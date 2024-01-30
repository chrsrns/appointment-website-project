# Scheduler Project

## Installation

### Install required Nodejs dependencies

1. > npm i

### Setting up the Prisma database

1. Create the MySQL server in a Podman container.

		podman run -d --name=mysql1 -p 3306:3306 -v ./mysqldata:/var/lib/mysql:Z -e MYSQL_ROOT_PASSWORD=password -e MYSQL_ROOT_HOST=% -e MYSQL_USER=infodb_user -e MYSQL_PASSWORD=sqlpassword -e MYSQL_DATABASE=infodb mysql/mysql-server

2. Start the MySQL Podman container.

		podman start mysql1

3. _Only run this if the user did not generate_

		podman exec -it mysql1 mysql -uroot -p

		CREATE USER 'infodb_user'@'%' INDENTIFIED BY 'JB123';

4. Grant access to the database and to creating [shadow databases](https://www.prisma.io/docs/concepts/components/prisma-migrate/shadow-database).

		GRANT CREATE, ALTER, DROP, REFERENCES, INDEX ON *.* TO 'infodb_user'@'%';

		GRANT ALL PRIVILEGES ON infodb.* TO 'infodb_user'@'%';

5. Create the database structure using Prisma.

		npx prisma db push
		npx prisma migrate dev --name init

To update the database on deployment, run `npx prisma migrate deploy`. This will require that the migration files are included in the version control.
