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
        bgcolor: 'background.default',
      }}
    >
      {isMobile ? (
        <Stack sx={{ height: '100%' }}>
          <Box sx={{ flex: 1, minHeight: 0, p: 0.5 }}>
            {mobileTab === 'chat' ? (
              <ChatMessages activeChatId={activeChatId} isDraftChat={isDraftChat} />
            ) : null}
            {mobileTab === 'history' ? <ChatHistorySidebar activeChatId={activeChatId} /> : null}
            {mobileTab === 'documents' ? <DocumentsSidebar /> : null}
          </Box>
          
          <Tabs
            value={mobileTab}
            onChange={(_, nextTab: MobileTab) => setMobileTab(nextTab)}
            variant="fullWidth"
            sx={{
              bgcolor: 'background.paper',
              borderTop: '1px solid',
              borderColor: 'divider',
              minHeight: 56,
            }}
          >
            <Tab icon={<ForumOutlinedIcon fontSize="small" />} value="chat" label="Chat" />
            <Tab icon={<HistoryOutlinedIcon fontSize="small" />} value="history" label="History" />
            <Tab icon={<DescriptionOutlinedIcon fontSize="small" />} value="documents" label="Docs" />
          </Tabs>
        </Stack>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '260px minmax(0, 1fr) 300px',
            alignItems: 'stretch',
            height: '100%',
          }}
        >
          <Box sx={{ minHeight: 0, height: '100%', borderRight: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
            <ChatHistorySidebar activeChatId={activeChatId} />
          </Box>
          <Box sx={{ minWidth: 0, minHeight: 0, height: '100%', bgcolor: 'background.default' }}>
            <ChatMessages activeChatId={activeChatId} isDraftChat={isDraftChat} />
          </Box>
          <Box sx={{ minHeight: 0, height: '100%', borderLeft: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
            <DocumentsSidebar />
          </Box>
        </Box>
      )}
    </Box>
  );
}

