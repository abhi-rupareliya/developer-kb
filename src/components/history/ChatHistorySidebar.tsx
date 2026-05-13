"use client";

import { useMemo, useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import {
  Box,
  Button,
  Divider,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Menu,
  MenuItem,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import { GET_CHATS } from "@/graphql/queries";
import { DELETE_CHAT } from "@/graphql/mutations";
import { Chat } from "@/types/graphql";
import { useRouter } from "next/navigation";
import { AppPanel } from "@/components/ui/AppPanel";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ConfirmationDialog } from "@/components/ui/ConfirmationDialog";
import { getDateGroup } from "@/utils/dateGroups";

type ChatHistorySidebarProps = {
  activeChatId: string | null;
};

type ChatGroup = {
  label: "Today" | "Yesterday" | "Older";
  chats: Chat[];
};

export function ChatHistorySidebar({ activeChatId }: ChatHistorySidebarProps) {
  const router = useRouter();
  const { data, loading, error, refetch } = useQuery<{ chats: Chat[] }>(
    GET_CHATS,
  );
  const [deleteChat, variables] = useMutation(DELETE_CHAT);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const chats = useMemo(() => data?.chats ?? [], [data?.chats]);

  const groupedChats = useMemo<ChatGroup[]>(() => {
    const filtered = chats
      .filter(
        (chat) =>
          chat.title?.toLowerCase().includes(search.toLowerCase()) ||
          !search.trim(),
      )
      .slice()
      .sort(
        (a, b) =>
          +new Date(b.updated_at || b.created_at) -
          +new Date(a.updated_at || a.created_at),
      );

    const grouped: Record<ChatGroup["label"], Chat[]> = {
      Today: [],
      Yesterday: [],
      Older: [],
    };

    filtered.forEach((chat) => {
      grouped[getDateGroup(chat.updated_at || chat.created_at)].push(chat);
    });

    return (["Today", "Yesterday", "Older"] as const)
      .map((label) => ({ label, chats: grouped[label] }))
      .filter((group) => group.chats.length > 0);
  }, [chats, search]);

  const handleCreateChat = () => {
    router.push("/chat/new");
  };

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    chatId: string,
  ) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
    setSelectedChatId(chatId);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleDeleteRequested = () => {
    setConfirmDeleteOpen(true);
    handleMenuClose();
  };

  const handleDeleteChat = async () => {
    if (!selectedChatId) return;

    try {
      await deleteChat({ variables: { id: selectedChatId } });

      if (activeChatId === selectedChatId) {
        router.push("/chat/new");
      }

      await refetch();
      setConfirmDeleteOpen(false);
      setSelectedChatId(null);
    } catch (mutationError) {
      console.error("Failed to delete chat:", mutationError);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: 'background.paper' }}>
      <Box sx={{ p: 1.5, pb: 1 }}>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<AddRoundedIcon fontSize="small" />}
          onClick={handleCreateChat}
          sx={{ 
            justifyContent: 'flex-start',
            borderColor: 'divider',
            color: 'text.primary',
            height: 40,
            '&:hover': { bgcolor: 'action.hover', borderColor: 'divider' }
          }}
        >
          New Chat
        </Button>
      </Box>

      <Box sx={{ px: 1.5, pb: 1 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                </InputAdornment>
              ),
            },
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: 'transparent',
              fontSize: '0.8125rem',
              height: 36,
            }
          }}
        />
      </Box>

      <Box sx={{ flex: 1, overflow: 'auto', px: 1 }}>
        {loading ? (
          <Stack spacing={0.5} sx={{ mt: 1 }}>
            {Array.from({ length: 8 }).map((_, index) => (
              <Skeleton key={index} variant="text" height={32} sx={{ borderRadius: 1 }} />
            ))}
          </Stack>
        ) : error ? (
          <Typography variant="caption" color="error" sx={{ p: 2, display: 'block' }}>
            {error.message}
          </Typography>
        ) : (
          <Stack spacing={2} sx={{ py: 1 }}>
            {groupedChats.map((group) => (
              <Box key={group.label}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ px: 1, mb: 0.5, display: 'block', fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                >
                  {group.label}
                </Typography>
                <List disablePadding>
                  {group.chats.map((chat) => {
                    const isActive = activeChatId === chat.id;
                    return (
                      <ListItem
                        key={chat.id}
                        disablePadding
                        secondaryAction={
                          <IconButton
                            size="small"
                            onClick={(event) => handleMenuOpen(event, chat.id)}
                            className="chat-actions"
                            sx={{ 
                              opacity: 0, 
                              transition: 'opacity 0.15s',
                              p: 0.5
                            }}
                          >
                            <MoreVertRoundedIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        }
                        sx={{
                          '&:hover .chat-actions': { opacity: 1 },
                          '& .MuiListItemSecondaryAction-root': { right: 8 }
                        }}
                      >
                        <ListItemButton
                          selected={isActive}
                          onClick={() => router.push(`/chat/${chat.id}`)}
                          sx={{
                            py: 0.75,
                            px: 1,
                            minHeight: 36,
                          }}
                        >
                          <ListItemText
                            primary={chat.title || 'Untitled Chat'}
                            primaryTypographyProps={{
                              variant: 'body2',
                              noWrap: true,
                              sx: { 
                                fontSize: '0.8125rem',
                                color: isActive ? 'text.primary' : 'text.secondary',
                                fontWeight: isActive ? 500 : 400
                              }
                            }}
                          />
                        </ListItemButton>
                      </ListItem>
                    );
                  })}
                </List>
              </Box>
            ))}
          </Stack>
        )}
      </Box>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        slotProps={{
          paper: {
            sx: { minWidth: 160 }
          }
        }}
      >
        <MenuItem onClick={handleDeleteRequested} sx={{ color: 'error.main', fontSize: '0.8125rem' }}>
          <DeleteOutlineRoundedIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      <ConfirmationDialog
        open={confirmDeleteOpen}
        title="Delete chat?"
        description="This will permanently delete the conversation."
        confirmLabel="Delete"
        destructive
        onConfirm={() => void handleDeleteChat()}
        onClose={() => setConfirmDeleteOpen(false)}
      />
    </Box>
  );
}

