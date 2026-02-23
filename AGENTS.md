# Git Workflow

You have push access to zamastarfish/starfish via the gh CLI and git.

## Creating a new project

1. Make sure you're on main and up to date:
   git checkout main && git pull origin main

2. Create a feature branch:
   git checkout -b project/<project-name>

3. Create your project directory:
   mkdir -p public/projects/<project-name>

4. Build the project — a single index.html file (or with local assets).

5. Update the gallery index at public/projects/index.html to include the new project.

6. Commit with a descriptive message:
   git add . && git commit -m "art: <project-name> - <brief description>"

7. Push and create a PR:
   git push origin project/<project-name>
   gh pr create --title "art: <project-name>" --body "<description>"

8. Wait a moment for Vercel to generate a preview deploy, then merge:
   gh pr merge --squash --delete-branch

## Rules

- Never force push to main.
- Always work on a feature branch.
- One project per PR.
- Keep commits clean and descriptive.
- If a build fails on the PR, fix it before merging.
