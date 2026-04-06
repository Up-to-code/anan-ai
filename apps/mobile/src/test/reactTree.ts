type ReactNodeLike = {
  type?: unknown;
  props?: Record<string, unknown> & {
    children?: unknown;
  };
};

function toArray(value: unknown): unknown[] {
  if (value === null || value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

/**
 * WHY:   Lightweight mobile component tests need a renderer-free way to inspect JSX output in the current Vitest setup.
 * WHAT:  Collects every element-like node inside a React element tree returned by direct component invocation.
 * HOW:   Walks the `props.children` graph recursively and ignores primitive text nodes.
 */
export function collectElementTree(node: unknown): ReactNodeLike[] {
  if (!node || typeof node !== "object") return [];
  const element = node as ReactNodeLike;
  const children = toArray(element.props?.children).flatMap((child) => collectElementTree(child));
  return [element, ...children];
}

/**
 * WHY:   Tests should assert component wiring by semantic child type instead of brittle child indexes.
 * WHAT:  Returns all element-like nodes whose `type` exactly matches the requested value.
 * HOW:   Reuses the flattened tree walker and filters on the `type` field.
 */
export function findElementsByType(node: unknown, type: unknown): ReactNodeLike[] {
  return collectElementTree(node).filter((element) => element?.type === type);
}

/**
 * WHY:   Container tests need to confirm visible copy without depending on a platform renderer.
 * WHAT:  Gathers every primitive string found anywhere in a React element tree.
 * HOW:   Recurses through `children`, returning text nodes while skipping non-primitive values.
 */
export function collectTextContent(node: unknown): string[] {
  if (typeof node === "string") return [node];
  if (typeof node === "number") return [String(node)];
  if (!node || typeof node !== "object") return [];

  const element = node as ReactNodeLike;
  return toArray(element.props?.children).flatMap((child) => collectTextContent(child));
}
