# Database Migrations

This project uses `Flask-Migrate` (Alembic) to manage database schema changes.

## Workflow

1.  **Make changes to your models** in `app/models.py`.
2.  **Generate a migration script**:
    ```bash
    flask db migrate -m "Description of changes"
    ```
3.  **Review the generated script** in `migrations/versions/`.
4.  **Apply the migration**:
    ```bash
    flask db upgrade
    ```

## Commands

-   `flask db init`: Initialize the migrations directory (run once).
-   `flask db migrate`: Generate a new migration script.
-   `flask db upgrade`: Apply pending migrations to the database.
-   `flask db downgrade`: Revert the last migration.
-   `flask db current`: Show the current revision of the database.
