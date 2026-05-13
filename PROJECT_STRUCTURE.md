# Project Structure & Architecture Guide

This project follows a "Thin Routes + View Components + Custom Hooks" architecture designed for clarity, maintainability, and scalability.

## Core Architectural Patterns

### 1. Thin Routes (`src/app/`)
Route files in Next.js should be minimal server components. Their primary job is to extract route parameters and render a corresponding **View** component.

- **Rule**: No business logic, no `useQuery`, no complex UI in `page.tsx`.
- **Example**:
  ```tsx
  // src/app/documents/[id]/page.tsx
  export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <DocumentPageView id={id} />;
  }
  ```

### 2. View Components (`src/views/`)
Views handle page-level composition. They call feature-specific hooks, manage page-level state, and wire up components.

- **Location**: `src/views/<feature>/<ViewName>.tsx`
- **Pattern**: Composes major components and handles route-specific wiring.

### 3. Feature-Specific Components & Hooks (`src/components/`)
Reusable UI blocks and the logic that drives them.

- **Location**: `src/components/<feature>/`
- **Hook Placement**: Keep hooks adjacent to the components they serve (e.g., `DocumentsSidebar.tsx` and `useDocumentsSidebar.ts` in the same folder).
- **Rule**: Logic should be kept **above the return statement** in components. Extract to a hook only if the logic is reused or if the component file exceeds ~200 lines.

### 4. Shared Utilities (`src/utils/`)
Pure functions and helpers that do not depend on React state or lifecycle.

- **Location**: `src/utils/<feature>/` or global `src/utils/`

---

## Folder Breakdown

| Directory | Purpose | Key Content |
| :--- | :--- | :--- |
| `src/app` | Next.js App Router | `page.tsx`, `layout.tsx`, `api/` |
| `src/views` | Page composition | `HomePageView.tsx`, `DocumentPageView.tsx` |
| `src/components` | Reusable UI components | `DocumentContent.tsx`, `UploadModal.tsx` |
| `src/utils` | Pure functions | `documentKind.ts`, `error-utils.ts` |
| `src/graphql` | GraphQL definitions | `queries.ts`, `mutations.ts`, `generated/` |
| `src/hooks` | Cross-cutting hooks | `useChatStreaming.ts` |
| `src/types` | Shared types | `graphql.ts`, `uploads.ts` |
| `src/lib` | Client initializers | `supabase/`, `apollo-client.ts` |

---

## Coding Best Practices

### Type Safety
- **No `any`**: Always define explicit types or use the generated types from `src/types/graphql.ts`.
- **API Responses**: Type your `useQuery` calls: `useQuery<{ documents: Document[] }>(GET_DOCUMENTS)`.

### State Management (React 19 Patterns)
- **Avoid setState during render**: Never call `setState` inside a mapping function or the main body of a component without an event or effect.
- **Render Phase Updates**: If you must adjust state based on a prop change, use the "prev value" pattern in the render phase to avoid cascading renders:
  ```tsx
  const [prevId, setPrevId] = useState(id);
  if (id !== prevId) {
    setPrevId(id);
    setData(null); // Reset state synchronously
  }
  ```

### Error Handling
- Use the `toErrorMessage(error: unknown)` helper from `src/utils/error-utils.ts` in `catch` blocks for consistent error reporting.
