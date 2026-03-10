/**
 * WHY:   Property writes in multiple zones need one consistent derived search payload for search indexes.
 * WHAT:  Builds the normalized `searchText` string persisted on property documents.
 * HOW:   Concatenates the relevant searchable property fields while skipping empty values.
 */
export function buildPropertySearchText(doc: {
  title: string;
  address: string;
  description: string;
  location?: string;
  area?: string;
}): string {
  return [doc.title, doc.address, doc.description, doc.location, doc.area]
    .filter(Boolean)
    .join(" ");
}
