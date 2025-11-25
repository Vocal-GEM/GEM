"""
Database Migration Script: Update password_hash column length

This script connects to your production PostgreSQL database and updates
the password_hash column from VARCHAR(120) to VARCHAR(255).
"""

import sys
import psycopg2

DATABASE_URL = "postgresql://vo_yr7l_user:cX4VWQOuywA0na2qGxonjmljQSgEVTEt@dpg-d4hrdv6mcj7s73c7igu0-a.oregon-postgres.render.com/vo_yr7l"

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
