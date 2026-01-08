To enable category-level access control, run the following migration in your PostgreSQL database:

psql -U postgres -d <your_db_name> -f migrations/add_category_access_column.sql

Replace <your_db_name> with your actual database name.

This will add an 'access' JSONB column to the policy_categories table, allowing you to set per-user and per-group permissions for categories in the Handbook UI.