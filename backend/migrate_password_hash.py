"""
Database Migration Script: Update password_hash column length

This script connects to your production PostgreSQL database and updates
the password_hash column from VARCHAR(120) to VARCHAR(255).
"""

import os
import sys
import psycopg2

DATABASE_URL = os.environ.get("DATABASE_URL")
if not DATABASE_URL:
    print("❌ Error: DATABASE_URL environment variable is not set.")
    sys.exit(1)

# Render.com provides postgres:// but psycopg2 needs postgresql://
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

print(f"Connecting to database...")

try:
    # Connect to database
    conn = psycopg2.connect(DATABASE_URL)
    cursor = conn.cursor()
    
    print("Connected successfully!")
    
    # Run migration
    print("Running migration: ALTER TABLE user ALTER COLUMN password_hash TYPE VARCHAR(255)")
    cursor.execute('ALTER TABLE "user" ALTER COLUMN password_hash TYPE VARCHAR(255);')
    
    # Commit changes
    conn.commit()
    
    print("✅ Migration completed successfully!")
    print("The password_hash column has been updated to VARCHAR(255)")
    
    # Close connection
    cursor.close()
    conn.close()
    
except Exception as e:
    print(f"❌ Migration failed: {e}")
    sys.exit(1)
