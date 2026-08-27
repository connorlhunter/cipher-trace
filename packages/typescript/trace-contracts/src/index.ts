/**
 * Public contracts shared by Cipher Trace browser and control-plane code.
 *
 * These exports validate only opaque, server-visible trace data.
 */
export {
  assertNoPlaintextFields,
  findProhibitedFieldPaths,
  forbiddenControlPlaneFields,
} from "./control-plane.ts";
export { opaqueIdentifierSchema } from "./identifiers.ts";
export type { OpaqueIdentifier } from "./identifiers.ts";
export { parseTraceEvent, traceEventSchema, traceEventTypeSchema } from "./trace-event.ts";
export type { TraceEvent, TraceEventType } from "./trace-event.ts";
