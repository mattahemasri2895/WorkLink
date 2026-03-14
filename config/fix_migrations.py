"""
Run this script to fix the database schema:
1. Navigate to the config directory
2. Run: python fix_migrations.py
"""

import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.db import connection

def run_sql_fixes():
    """Add missing columns to database"""
    with connection.cursor() as cursor:
        print("Adding missing columns to users_application table...")
        
        # Add offer_letter column
        try:
            cursor.execute("""
                ALTER TABLE users_application 
                ADD COLUMN IF NOT EXISTS offer_letter VARCHAR(100);
            """)
            print("✓ Added offer_letter column")
        except Exception as e:
            print(f"offer_letter column: {e}")
        
        # Add offer_message column
        try:
            cursor.execute("""
                ALTER TABLE users_application 
                ADD COLUMN IF NOT EXISTS offer_message TEXT DEFAULT '';
            """)
            print("✓ Added offer_message column")
        except Exception as e:
            print(f"offer_message column: {e}")
        
        # Update status constraint
        try:
            cursor.execute("""
                ALTER TABLE users_application 
                DROP CONSTRAINT IF EXISTS users_application_status_check;
            """)
            cursor.execute("""
                ALTER TABLE users_application 
                ADD CONSTRAINT users_application_status_check 
                CHECK (status IN ('pending', 'accepted', 'rejected', 'interview_scheduled', 
                                 'interview_completed', 'interview_rejected', 'selected', 
                                 'offer_sent', 'offer_accepted', 'hired', 'shortlisted', 'exam_scheduled'));
            """)
            print("✓ Updated status constraint")
        except Exception as e:
            print(f"status constraint: {e}")
        
        # Add is_selected to interview slots
        try:
            cursor.execute("""
                ALTER TABLE users_interviewslot 
                ADD COLUMN IF NOT EXISTS is_selected BOOLEAN DEFAULT FALSE;
            """)
            print("✓ Added is_selected column to interview slots")
        except Exception as e:
            print(f"is_selected column: {e}")
        
        print("\n✅ Database schema updated successfully!")
        print("\nNow run: python manage.py runserver")

if __name__ == '__main__':
    run_sql_fixes()
