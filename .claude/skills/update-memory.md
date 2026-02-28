---
name: update-memory
description: Update CLAUDE.md with project context and user preferences
context: fork
disable-model-invocation: true
agent: general-purpose
---

# Update Project Memory (CLAUDE.md)

Review the conversation and identify any of the following that should be persisted to project memory:

1. **Project context updates** - New features implemented, architecture changes, new files/directories
2. **User preferences** - Coding style, naming conventions, design preferences mentioned
3. **Technical decisions** - Tech stack changes, library choices, patterns adopted
4. **API changes** - New endpoints, modified contracts
5. **Phase/milestone updates** - What's been completed, what's next

## Instructions

1. Read the current CLAUDE.md file at `/Users/mukundchillakanti/Documents/Projects/Moxo/ai-flow-saas/CLAUDE.md`
2. Identify information from the conversation that should be added or updated
3. Update the file while preserving its structure:
   - Keep the Overview, Tech Stack, and Architecture sections current
   - Update the "Current Phase" section to reflect actual progress
   - Add any new Key Files that were created
   - Document new API endpoints
   - Add any user-specified preferences or rules
4. Be concise - CLAUDE.md should be a quick reference, not comprehensive documentation

## When to invoke this skill

The assistant should proactively invoke this skill when:
- A significant feature or phase has been completed
- New architectural patterns or files have been introduced
- The user expresses a strong preference about coding style or approach
- API endpoints have been added or changed
- The project phase has advanced
