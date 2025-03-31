# Team Collaboration Workflow Guide

This guide outlines the workflow for collaborating with your team on the App Bubble Task Management project.

## Daily Workflow

### 1. Before Starting Work

Always begin your work session by pulling the latest changes:

```bash
# Make sure you're in the app-bubble directory
cd app-bubble

# Pull the latest changes from the feature branch
git pull origin feature/bubble-task-management
```

### 2. During Development

Commit your changes frequently with meaningful commit messages:

```bash
# Check what files have been changed
git status

# Add specific files or all changes
git add <specific-files>  # For specific files
git add .                 # For all files

# Commit with a descriptive message
git commit -m "Brief description of the changes made"
```

### 3. Before Ending Work

Push your changes to GitHub so your team can access them:

```bash
# Push to the feature branch
git push origin feature/bubble-task-management
```

## Handling Conflicts

If you encounter merge conflicts when pulling changes:

1. Resolve the conflicts in the affected files
2. Add the resolved files: `git add <resolved-files>`
3. Commit the resolution: `git commit -m "Resolve merge conflicts"`
4. Push the changes: `git push origin feature/bubble-task-management`

## Best Practices

- **Pull Frequently**: Pull changes at least at the beginning and end of your work session, or more frequently if actively collaborating.
- **Commit Meaningfully**: Write clear commit messages that describe what changes were made and why.
- **Communicate**: Let your team know when you're pushing significant changes.
- **Small, Focused Commits**: Make small, focused commits that address a single issue or feature.

## Running the Development Environment

Start the development servers:

```bash
# For the backend (from the app-bubble directory)
cd backend
npm run dev

# For the frontend (from the app-bubble directory)
cd frontend
npm run dev
```

Backend will run at: http://localhost:4000
Frontend will run at: http://localhost:3000 