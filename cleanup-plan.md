# Rooster Project Cleanup Plan

## Files to Remove

### 1. Unused Test Files
- `/Users/dell/Documents/repo/Rooster/rooster/src/app/__tests__/reports.test.tsx`
  - References a non-existent `reports/page.tsx` component and `reportStorage.ts` utility

### 2. Commented-Out API Routes
- No actual files to delete, but there are commented references to these routes in the codebase:
  - `/api/initialize-app`
  - `/api/init-scheduler`
  - `/api/scheduler-status`
  - `/api/start-scheduler`

## Cleanup Actions

1. Remove the unused test file for a non-existent reports page
2. Review the codebase for any other references to these non-existent components
3. Consider cleaning up any commented-out code related to these unused features

## Benefits
- Reduces confusion for developers
- Simplifies the codebase
- Removes tests for features that don't exist
- Makes the project structure cleaner and more maintainable