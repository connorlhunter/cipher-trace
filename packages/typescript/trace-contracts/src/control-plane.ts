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
