/**
 * Field names that would expose document plaintext or key material.
 *
 * The control plane rejects these names at every nesting level.
 */
export const forbiddenControlPlaneFields = new Set<string>([
  "comment",
  "content",
  "document_bytes",
  "document_content",
  "document_key",
  "file_name",
  "filename",
  "key_material",
  "plaintext",
  "plaintext_commitment",
  "plaintext_hash",
  "private_key",
  "title",
]);

/**
 * Find field paths that are not allowed in a control-plane payload.
 *
 * @param payload Value to inspect. Objects and arrays are walked recursively.
 * @param path Path prefix used while walking nested values.
 * @returns Prohibited field paths in traversal order.
 */
export function findProhibitedFieldPaths(
  payload: unknown,
  path = "",
): string[] {
  if (Array.isArray(payload)) {
    return payload.flatMap((value, index): string[] =>
      findProhibitedFieldPaths(value, path + "[" + String(index) + "]"),
    );
  }

  if (!isRecord(payload)) {
    return [];
  }

  return Object.entries(payload).flatMap(([fieldName, value]): string[] => {
    const fieldPath = path === "" ? fieldName : path + "." + fieldName;
    const nestedPaths = findProhibitedFieldPaths(value, fieldPath);

    return forbiddenControlPlaneFields.has(normaliseFieldName(fieldName))
      ? [fieldPath, ...nestedPaths]
      : nestedPaths;
  });
}

/**
 * Reject plaintext and document-key fields before a payload reaches the API.
 *
 * @param payload Value to inspect.
 * @throws {Error} When the payload contains a prohibited field name.
 */
export function assertNoPlaintextFields(payload: unknown): void {
  const prohibitedPaths = findProhibitedFieldPaths(payload);

  if (prohibitedPaths.length > 0) {
    throw new Error(
      "Control-plane payload contains prohibited fields: " +
        prohibitedPaths.join(", "),
    );
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normaliseFieldName(fieldName: string): string {
  return fieldName.trim().toLocaleLowerCase("en-US").replaceAll("-", "_");
}
