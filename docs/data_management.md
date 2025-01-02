# Data Management Guidelines

## Overview
This document outlines the procedures for managing task data in the AI Project Manager system, including backup processes, validation checks, and data transfer procedures.

## Backup Process
The system automatically creates backups of data files before any changes using the `backup_and_validate.py` script. Backups are stored in the `backups` directory with timestamps.

### Automatic Backups
- Pre-commit hook creates backups of YAML files
- Backups are stored with timestamps for easy recovery
- Backup directory: `./backups/`

## Validation Checks
The system includes several validation checks to prevent data loss:

1. **YAML Format Validation**
   - Ensures files are valid YAML
   - Verifies required structure (tasks list, etc.)

2. **Task Count Validation**
   - Alerts if large number of tasks are removed
   - Compares task counts between versions

3. **Task ID Validation**
   - Ensures no task IDs are accidentally removed
   - Tracks all task IDs across versions

## Data Transfer Procedures

### Moving Tasks Between Repositories
1. Create a backup using `backup_and_validate.py`
2. Verify the backup was created successfully
3. Make the desired changes to the YAML file
4. Run validation checks before committing
5. Create a PR with the changes

### Adding New Tasks
1. Follow the task format specified in `task_format.md`
2. Use the appropriate task type (regular, due_date, appointment_date)
3. Run validation before committing

## Pre-commit Hook Setup
To enable automatic backups and validation:

1. Copy the pre-commit hook:
```bash
cp scripts/backup_and_validate.py .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

2. The hook will automatically:
   - Create backups before commits
   - Validate YAML structure
   - Check for large data removals
   - Verify task IDs

## Recovery Procedures
If data loss is detected:

1. Check the `backups` directory for recent backups
2. Compare the backup with current version
3. Restore missing data if needed
4. Run validation checks after recovery

## Best Practices
1. Always create PRs for data changes
2. Use the PR template for consistency
3. Review the diff carefully before merging
4. Keep backups for at least 30 days
5. Document any manual data modifications
