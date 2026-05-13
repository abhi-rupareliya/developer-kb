# Developer KB Chat Workspace

A responsive chat workspace built with Next.js, React, TypeScript, and MUI for AI-powered conversations with document knowledge base.

## Features

- **Responsive Layout**: Three-panel design with chat history, messages, and documents
- **Real-time Streaming**: Assistant responses stream in real-time
- **Document Selection**: Select multiple documents to include in chat context
- **Chat Management**: Create and switch between different chat conversations
- **Auto-scroll**: Messages automatically scroll to bottom
- **Loading States**: Skeleton loaders and proper loading indicators
- **Mobile Responsive**: Adapts to different screen sizes

## Architecture

### Components Structure
```
components/
├── chat/
│   ├── ChatWorkspace.tsx    # Main layout component
│   └── ChatMessages.tsx     # Messages display and input
├── documents/
│   └── DocumentsSidebar.tsx # Document selection panel
└── history/
    └── ChatHistorySidebar.tsx # Chat list and creation
```

### Key Technologies
- **Next.js 16** with App Router
- **React 19** with TypeScript
- **MUI (Material-UI)** for components
- **Apollo Client** for GraphQL queries/mutations
- **Supabase** for backend data
- **AI SDK** for streaming responses

### State Management
- **Context API** for global chat state (active chat, selected documents)
- **Apollo Client** for server state (queries, mutations)

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables (Supabase, etc.)

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## API Integration

The app integrates with existing GraphQL APIs:
- **Chats**: Create, list, and manage chat conversations
- **Messages**: Send and retrieve messages with pagination
- **Documents**: Fetch and select documents for context
- **Streaming Chat**: Real-time AI responses via REST API

## Development

- `npm run lint` - Run ESLint
- `npm run build` - Build for production
- `npm run codegen` - Generate GraphQL types (if configured)

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
