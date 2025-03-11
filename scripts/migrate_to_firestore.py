#!/usr/bin/env python
"""
Migrate backlog data from local JSON file to Firestore.
This script helps transition from single-user to multi-user system.
"""

import os
import json
import argparse
import firebase_admin
from firebase_admin import credentials, firestore

def load_backlog_json(file_path):
    """Load backlog data from JSON file."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading backlog JSON: {e}")
        return None

def initialize_firebase(service_account_path):
    """Initialize Firebase Admin SDK with service account credentials."""
    try:
        cred = credentials.Certificate(service_account_path)
        firebase_admin.initialize_app(cred)
        return firestore.client()
    except Exception as e:
        print(f"Error initializing Firebase: {e}")
        return None

def migrate_data(db, backlog_data, user_id):
    """Migrate backlog data to Firestore for a specific user."""
    try:
        # Store backlog data in user's document
        backlog_ref = db.collection('users').document(user_id).collection('data').document('backlog')
        backlog_ref.set({
            'data': backlog_data,
            'updatedAt': firestore.SERVER_TIMESTAMP
        })
        
        # Also migrate individual tasks to a tasks collection for better querying
        tasks_ref = db.collection('users').document(user_id).collection('tasks')
        
        for task in backlog_data.get('tasks', []):
            task_id = task.get('id', '')
            if task_id:
                tasks_ref.document(task_id).set({
                    **task,
                    'updatedAt': firestore.SERVER_TIMESTAMP
                })
        
        print(f"Successfully migrated data for user {user_id}")
        return True
    except Exception as e:
        print(f"Error migrating data: {e}")
        return False

def main():
    parser = argparse.ArgumentParser(description='Migrate backlog data to Firestore')
    parser.add_argument('--backlog', required=True, help='Path to backlog.json file')
    parser.add_argument('--service-account', required=True, help='Path to Firebase service account JSON')
    parser.add_argument('--user-id', required=True, help='User ID to migrate data for')
    
    args = parser.parse_args()
    
    # Load backlog data
    backlog_data = load_backlog_json(args.backlog)
    if not backlog_data:
        print("Failed to load backlog data. Exiting.")
        return
    
    # Initialize Firebase
    db = initialize_firebase(args.service_account)
    if not db:
        print("Failed to initialize Firebase. Exiting.")
        return
    
    # Migrate data
    success = migrate_data(db, backlog_data, args.user_id)
    if success:
        print("Migration completed successfully!")
    else:
        print("Migration failed.")

if __name__ == "__main__":
    main()
