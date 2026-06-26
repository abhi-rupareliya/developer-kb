/**
 * Processes markdown content to convert source references [@source:ID] to markdown links
 * @param content - Raw markdown content
 * @returns Processed markdown with source references converted to links
 */
export function processSourceReferences(content: string): string {
  // Pattern to match [@source:uuid]
  // UUID pattern: 8 chars - 4 chars - 4 chars - 4 chars - 12 chars (all hex)
  // Accepts both uppercase and lowercase hex
  const sourcePattern = /\[@source:([a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12})\]/g

  return content.replace(sourcePattern, (match, id) => {
    // Convert to markdown link format
    // The href will be "source:{id}" which SourceLink component will detect
    return `[📄 Source Document](source:${id})`
  })
}
