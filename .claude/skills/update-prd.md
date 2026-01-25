---
name: update-prd
description: Update PRD.md with new requirements and feature changes
context: fork
disable-model-invocation: true
agent: general-purpose
---

# Update Product Requirements Document (PRD.md)

Review the conversation and identify any product requirement changes that should be documented in the PRD.

1. **New feature requirements** - Features requested by the user
2. **Modified requirements** - Changes to existing specifications
3. **New constraints** - Platform limitations discovered or defined
4. **UX/UI decisions** - User experience requirements
5. **Scope changes** - Features added or removed from scope

## Instructions

1. Read the current PRD.md file at `/Users/mukundchillakanti/ai-flow-copilot/PRD.md`
2. Identify product requirement changes from the conversation
3. Update the file while preserving its structure:
   - Add new features to appropriate sections
   - Update existing requirements if they've changed
   - Add new constraints to the Platform Constraints section
   - Document UX decisions in the User Experience section
   - Mark deprecated/removed features appropriately
4. Use the same formatting style as existing content
5. Add rationale for significant changes when provided by the user

## When to invoke this skill

The assistant should proactively invoke this skill when:
- The user defines new feature requirements
- Existing requirements are modified or clarified
- New platform constraints are discovered
- UX/UI decisions are made that affect the product spec
- The product scope changes significantly
- New step types, modes, or capabilities are requested
