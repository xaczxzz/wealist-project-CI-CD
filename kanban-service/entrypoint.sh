#!/bin/sh
set -e

echo "🔄 Starting Kanban Service..."

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL..."
until PGPASSWORD=$KANBAN_DB_PASSWORD psql -h "postgres" -U "$KANBAN_DB_USER" -d "$KANBAN_DB_NAME" -c '\q' 2>/dev/null; do
  echo "   PostgreSQL is unavailable - sleeping"
  sleep 2
done
echo "✅ PostgreSQL is ready!"

# Run Alembic migrations
echo "🔄 Running database migrations..."

# Check current migration state
CURRENT_VERSION=$(alembic current 2>/dev/null | grep -v "INFO" | grep -v "Context" | grep -v "Will assume" | head -1 || echo "none")
echo "📊 Current migration version: $CURRENT_VERSION"

# Simple and reliable: Always try to upgrade to head
# Alembic is smart enough to skip already-applied migrations
echo "⬆️  Upgrading to latest version..."
alembic upgrade head 2>&1 || {
  echo "⚠️  Standard upgrade failed - trying manual migration sequence..."

  # Apply migrations in specific order to handle merge points
  alembic upgrade 35de05bd5bbd 2>&1 || true
  alembic upgrade 15615a7959d1 2>&1 || true
  alembic upgrade head 2>&1 || {
    echo "❌ Migration failed - check logs above"
    exit 1
  }
}

# Verify final state
FINAL_VERSION=$(alembic current 2>/dev/null | grep -v "INFO" | grep -v "Context" | grep -v "Will assume" | head -1 || echo "unknown")
echo "✅ Migrations completed! Final version: $FINAL_VERSION"

# Start the application
echo "🚀 Starting Uvicorn server..."
exec "$@"
