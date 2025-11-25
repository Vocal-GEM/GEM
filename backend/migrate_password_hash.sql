"""
Database Migration: Increase password_hash column length

This migration updates the password_hash column in the user table
from VARCHAR(120) to VARCHAR(255) to accommodate longer password hashes.

Run this SQL directly on your production PostgreSQL database.
"""

ALTER TABLE "user" ALTER COLUMN password_hash TYPE VARCHAR(255);
