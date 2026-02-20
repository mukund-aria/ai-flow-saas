/**
 * DDR Resolver Service
 *
 * Parses and resolves Dynamic Data Reference (DDR) tokens at runtime.
 * DDR tokens allow steps in a flow to reference data from prior steps,
 * kickoff forms, role assignments, and workspace metadata.
 *
 * Token Syntax:
 *   {Kickoff / Field Label}       - Kickoff form field value
 *   {Role: RoleName / Name}       - Assigned contact's name
 *   {Role: RoleName / Email}      - Assigned contact's email
 *   {Step Name / Field Label}     - Output field from a completed step
 *   {Workspace / Name}            - Organization name
 *   {Workspace / ID}              - Organization ID
 */

// ============================================================================
// Types
// ============================================================================

/**
 * DDR Resolution Context
 * Contains all data needed to resolve DDR tokens.
 */
export interface DDRContext {
  /** Kickoff form data (field label -> value) */
  kickoffData?: Record<string, unknown>;
  /** Role assignments (role name -> { name, email, contactId }) */
  roleAssignments?: Record<string, { name: string; email: string; contactId?: string }>;
  /** Step outputs (step name -> { field label -> value }) */
  stepOutputs?: Record<string, Record<string, unknown>>;
  /** Workspace info */
  workspace?: { name: string; id: string };
}

/**
 * Represents a parsed DDR token extracted from a string.
 */
export interface ParsedDDRToken {
  /** Full token including braces, e.g. "{Kickoff / Client Name}" */
  token: string;
  /** Source identifier, e.g. "Kickoff", "Role: Client", "Step 2", "Workspace" */
  source: string;
  /** Field name, e.g. "Client Name", "Name", "Email" */
  field: string;
}

// ============================================================================
// Token Regex
// ============================================================================

/**
 * Matches DDR tokens enclosed in curly braces.
 * Captures everything between { and } that contains at least one " / " separator.
 * Uses the global flag so all tokens in a string are matched.
 */
const DDR_TOKEN_REGEX = /\{([^}]+)\}/g;

/**
 * Separator between the source and field parts of a DDR token.
 * The space around the slash is significant and part of the syntax.
 */
const DDR_SEPARATOR = ' / ';

// ============================================================================
// Parsing
// ============================================================================

/**
 * Parse DDR tokens from a string.
 *
 * Scans the input for patterns matching `{source / field}` and returns
 * an array of parsed token objects. Tokens that do not contain the
 * ` / ` separator are ignored (they are not valid DDR references).
 *
 * @param text - The input string potentially containing DDR tokens
 * @returns Array of parsed DDR tokens found in the text
 *
 * @example
 * ```ts
 * parseDDRTokens("Hello {Kickoff / Client Name}, your ID is {Workspace / ID}")
 * // Returns:
 * // [
 * //   { token: "{Kickoff / Client Name}", source: "Kickoff", field: "Client Name" },
 * //   { token: "{Workspace / ID}", source: "Workspace", field: "ID" }
 * // ]
 * ```
 */
export function parseDDRTokens(text: string): ParsedDDRToken[] {
  const tokens: ParsedDDRToken[] = [];

  // Reset regex lastIndex to ensure we start from the beginning
  DDR_TOKEN_REGEX.lastIndex = 0;

  let match: RegExpExecArray | null;
  while ((match = DDR_TOKEN_REGEX.exec(text)) !== null) {
    const inner = match[1];
    const separatorIndex = inner.indexOf(DDR_SEPARATOR);

    // Only treat as a DDR token if it contains the " / " separator
    if (separatorIndex === -1) {
      continue;
    }

    const source = inner.substring(0, separatorIndex).trim();
    const field = inner.substring(separatorIndex + DDR_SEPARATOR.length).trim();

    if (source && field) {
      tokens.push({
        token: match[0],
        source,
        field,
      });
    }
  }

  return tokens;
}

// ============================================================================
// Single Token Resolution
// ============================================================================

/**
 * Resolve a single DDR token to its value.
 *
 * Determines the token type based on the source prefix and looks up the
 * corresponding value in the provided context:
 *
 * - **Kickoff**: Looks up `field` in `context.kickoffData`
 * - **Role: \<name\>**: Extracts the role name, then looks up `Name` or `Email`
 *   in `context.roleAssignments`
 * - **Workspace**: Looks up `Name` or `ID` in `context.workspace`
 * - **Otherwise**: Treats source as a step name and looks up field in
 *   `context.stepOutputs`
 *
 * @param source - The source part of the token (e.g. "Kickoff", "Role: Client")
 * @param field  - The field part of the token (e.g. "Client Name", "Email")
 * @param context - The DDR context containing all resolvable data
 * @returns The resolved string value, or `undefined` if the token cannot be resolved
 *
 * @example
 * ```ts
 * const ctx: DDRContext = {
 *   kickoffData: { "Client Name": "Acme Corp" },
 *   workspace: { name: "My Org", id: "org_123" },
 * };
 * resolveSingleToken("Kickoff", "Client Name", ctx);  // "Acme Corp"
 * resolveSingleToken("Workspace", "Name", ctx);        // "My Org"
 * ```
 */
export function resolveSingleToken(
  source: string,
  field: string,
  context: DDRContext
): string | undefined {
  // --- Kickoff form data ---
  if (source === 'Kickoff') {
    const value = context.kickoffData?.[field];
    return value !== undefined && value !== null ? String(value) : undefined;
  }

  // --- Role assignments (e.g. "Role: Client") ---
  if (source.startsWith('Role:')) {
    const roleName = source.substring('Role:'.length).trim();
    const assignment = context.roleAssignments?.[roleName];
    if (!assignment) return undefined;

    const fieldLower = field.toLowerCase();
    if (fieldLower === 'name') return assignment.name;
    if (fieldLower === 'email') return assignment.email;
    if (fieldLower === 'contactid' || fieldLower === 'contact id') {
      return assignment.contactId;
    }
    return undefined;
  }

  // --- Workspace metadata ---
  if (source === 'Workspace') {
    if (!context.workspace) return undefined;

    const fieldLower = field.toLowerCase();
    if (fieldLower === 'name') return context.workspace.name;
    if (fieldLower === 'id') return context.workspace.id;
    return undefined;
  }

  // --- Step outputs (source is the step name) ---
  const stepData = context.stepOutputs?.[source];
  if (!stepData) return undefined;

  const value = stepData[field];
  return value !== undefined && value !== null ? String(value) : undefined;
}

// ============================================================================
// Full String Resolution
// ============================================================================

/**
 * Resolve all DDR tokens in a string, replacing them with their actual values.
 *
 * Parses the input for DDR tokens and replaces each one by looking up its
 * value in the provided context. Tokens that cannot be resolved (missing
 * data, unknown source, etc.) are left as-is in the output string.
 *
 * @param text    - The input string containing DDR tokens
 * @param context - The DDR context containing all resolvable data
 * @returns A new string with resolved tokens replaced by their values
 *
 * @example
 * ```ts
 * const ctx: DDRContext = {
 *   kickoffData: { "Client Name": "Acme Corp" },
 *   roleAssignments: { "Client": { name: "Jane", email: "jane@acme.com" } },
 *   workspace: { name: "My Org", id: "org_123" },
 * };
 *
 * resolveDDR(
 *   "Dear {Role: Client / Name}, welcome to {Workspace / Name}. " +
 *   "Your project {Kickoff / Client Name} is ready.",
 *   ctx
 * );
 * // "Dear Jane, welcome to My Org. Your project Acme Corp is ready."
 * ```
 */
export function resolveDDR(text: string, context: DDRContext): string {
  const tokens = parseDDRTokens(text);

  if (tokens.length === 0) {
    return text;
  }

  let resolved = text;

  for (const { token, source, field } of tokens) {
    const value = resolveSingleToken(source, field, context);
    if (value !== undefined) {
      // Replace all occurrences of this exact token in the string.
      // Use split+join to avoid regex special character issues in the token.
      resolved = resolved.split(token).join(value);
    }
    // If value is undefined, leave the token as-is
  }

  return resolved;
}
