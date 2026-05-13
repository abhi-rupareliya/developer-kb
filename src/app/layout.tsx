import type { Metadata } from "next";
import "./globals.css";
import { ApolloProviderWrapper } from "@/lib/apollo/provider";
import { ChatProvider } from "@/contexts/chat-context";
import { ThemeProviderWrapper } from "@/components/ThemeProviderWrapper";

export const metadata: Metadata = {
  title: "Developer KB Chat",
  description: "AI-powered chat with document knowledge base",
};

export default function RootLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal?: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ThemeProviderWrapper>
          <ApolloProviderWrapper>
            <ChatProvider>
              {children}
              {modal}
            </ChatProvider>
          </ApolloProviderWrapper>
        </ThemeProviderWrapper>
      </body>
    </html>
  );
}
