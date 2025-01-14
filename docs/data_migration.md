# Data Migration Protocols

## Overview
This document outlines the procedures for safely migrating data between the public and private repositories of the AI Project Manager system.

## Pre-Migration Checklist
1. Create a backup of the source data
2. Verify the backup is accessible
3. Run validation checks using verify_tasks.py
4. Document the planned changes

## Data Transfer Procedures

### Moving Tasks Between Repositories
1. Create a new branch in both repositories
2. Run verify_tasks.py to establish baseline:
   ```bash
   python3 scripts/verify_tasks.py path/to/public/json path/to/private/json
   ```
3. Make the planned changes
4. Run verify_tasks.py again to validate changes
5. Create PRs in both repositories
6. Wait for CI checks to complete
7. Review diffs carefully before merging

### Handling Large Data Removals

When removing a significant amount of data:

1. Check the diff before committing:
   ```bash
   git diff -- tasks/backlog.json
   ```

2. If removing more than 5 tasks:
   - Document the reason in the PR description
   - List all task IDs being removed
   - Provide justification for each removal
   - Get explicit approval from maintainers

3. For accidental removals:
   ```bash
   # View the specific changes
   git diff <old-commit> <new-commit> -- tasks/backlog.json
   
   # Partial revert if needed
   git revert <commit_hash>
   # Then manually edit to keep desired changes
   ```

## PR Review Process

### Before Creating a PR
1. Run local validation:
   ```bash
   python3 scripts/backup_and_validate.py tasks/backlog.json
   python3 scripts/verify_tasks.py path/to/public/json path/to/private/json
   ```

2. Review the changes:
   ```bash
   git diff --cached -- tasks/backlog.json
   ```

3. Update documentation if needed

### PR Requirements
1. Use the PR template
2. Include:
   - Clear description of changes
   - List of affected task IDs
   - Validation results
   - Link to related PRs in other repos

### Review Checklist
- [ ] Backup exists
- [ ] JSON validation passes
- [ ] No unintended task removals
- [ ] Cross-repo validation passes
- [ ] Documentation is updated
- [ ] Related PRs are linked

## Recovery Procedures

If data loss is detected:

1. Locate the most recent backup:
   ```bash
   ls -lt backups/
   ```

2. Compare with current version:
   ```bash
   diff backups/latest.json current.json
   ```

3. Restore missing data:
   - Create a new branch
   - Copy missing data from backup
   - Run validation
   - Create PR with restoration changes

## Best Practices
1. Always create backups before migrations
2. Use verify_tasks.py for cross-repo validation
3. Document all significant changes
4. Review diffs carefully before merging
5. Keep related PRs in sync
6. Maintain clear communication between repos
7. Never force push changes
8. Use the pre-commit hook for validation
