'use client';

import { useState } from 'react';
import { Box, Stack, Tab, Tabs, useMediaQuery, useTheme } from '@mui/material';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import { ChatHistorySidebar } from '@/components/history/ChatHistorySidebar';
import { ChatMessages } from '@/components/chat/ChatMessages';
import { DocumentsSidebar } from '@/components/documents/DocumentsSidebar';

type ChatWorkspaceProps = {
  activeChatId: string | null;
  isDraftChat: boolean;
};

type MobileTab = 'chat' | 'history' | 'documents';

export function ChatWorkspace({ activeChatId, isDraftChat }: ChatWorkspaceProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileTab, setMobileTab] = useState<MobileTab>('chat');

  return (
    <Box
      sx={{
        height: '100dvh',
        overflow: 'hidden',
        px: { xs: 0.75, md: 1.5 },
        py: { xs: 0.75, md: 1.5 },
      }}
    >
      {isMobile ? (
        <Stack spacing={1}>
          <Tabs
            value={mobileTab}
            onChange={(_, nextTab: MobileTab) => setMobileTab(nextTab)}
            variant="fullWidth"
            sx={{
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 3,
              px: 0.5,
            }}
          >
            <Tab icon={<ForumOutlinedIcon fontSize="small" />} iconPosition="start" value="chat" label="Chat" />
            <Tab icon={<HistoryOutlinedIcon fontSize="small" />} iconPosition="start" value="history" label="History" />
            <Tab icon={<DescriptionOutlinedIcon fontSize="small" />} iconPosition="start" value="documents" label="Docs" />
          </Tabs>

          <Box sx={{ minHeight: 'calc(100dvh - 88px)' }}>
            {mobileTab === 'chat' ? (
              <ChatMessages activeChatId={activeChatId} isDraftChat={isDraftChat} />
            ) : null}
            {mobileTab === 'history' ? <ChatHistorySidebar activeChatId={activeChatId} /> : null}
            {mobileTab === 'documents' ? <DocumentsSidebar /> : null}
          </Box>
        </Stack>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '280px minmax(0, 1fr) 320px',
            gap: 1.5,
            alignItems: 'stretch',
            height: '100%',
            maxWidth: '1300px',
            mx: 'auto',
          }}
        >
          <Box sx={{ minHeight: 0, height: '100%' }}>
            <ChatHistorySidebar activeChatId={activeChatId} />
          </Box>
          <Box sx={{ minWidth: 0, minHeight: 0, height: '100%' }}>
            <ChatMessages activeChatId={activeChatId} isDraftChat={isDraftChat} />
          </Box>
          <Box sx={{ minHeight: 0, height: '100%' }}>
            <DocumentsSidebar />
          </Box>
        </Box>
      )}
    </Box>
  );
}
