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
    <AppPanel dense sx={{ height: "100%" }}>
      <Stack sx={{ flex: 1, minHeight: 0 }}>
        <Box sx={{ p: 1.5 }}>
          <SectionHeader
            title="Chats"
            subtitle="Recent conversations"
            action={
              <Button
                variant="contained"
                size="small"
                startIcon={<AddRoundedIcon />}
                onClick={handleCreateChat}
              >
                New
              </Button>
            }
          />
        </Box>

        <Box sx={{ px: 1.5, pb: 1.5 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search chats"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Box>

        <Divider />

        <Box sx={{ flex: 1, overflow: "auto", p: 1.25 }}>
          {loading ? (
            <Stack spacing={1}>
              <Skeleton variant="rounded" height={40} />
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} variant="rounded" height={52} />
              ))}
            </Stack>
          ) : error ? (
            <EmptyState
              title="Could not load chats"
              description={error.message}
              action={{ label: "Retry", onClick: () => void refetch() }}
            />
          ) : groupedChats.length === 0 ? (
            <EmptyState
              title={search.trim() ? "No chats found" : "No chats yet"}
              description={
                search.trim()
                  ? "Try a different search term."
                  : "Start a new conversation to see it here."
              }
              icon={<HistoryRoundedIcon fontSize="small" />}
              action={{ label: "New Chat", onClick: handleCreateChat }}
            />
          ) : (
            <Stack spacing={1.5}>
              {groupedChats.map((group) => (
                <Box key={group.label}>
                  <Typography
                    variant="overline"
                    color="text.secondary"
                    sx={{ px: 1, mb: 0.5, display: "block" }}
                  >
                    {group.label}
                  </Typography>
                  <List disablePadding sx={{ display: "grid", gap: 0.75 }}>
                    {group.chats.map((chat) => {
                      const isActive = activeChatId === chat.id;
                      return (
                        <ListItem
                          key={chat.id}
                          disablePadding
                          sx={{
                            "& .MuiListItemSecondaryAction-root": {
                              opacity: 0,
                              transition: "opacity 0.2s",
                              pointerEvents: "none",
                            },
                            "&:hover .MuiListItemSecondaryAction-root": {
                              opacity: 1,
                              pointerEvents: "auto",
                            },
                            ...(selectedChatId === chat.id &&
                              Boolean(menuAnchor) && {
                                "& .MuiListItemSecondaryAction-root": {
                                  opacity: 1,
                                  pointerEvents: "auto",
                                },
                              }),
                            minWidth: 0,
                            "& .MuiListItemButton-root": {
                              pr: 1.5,
                              transition: "padding-right 0.2s ease",
                            },
                            "&:hover .MuiListItemButton-root": {
                              pr: 5,
                            },
                            ...(selectedChatId === chat.id &&
                              Boolean(menuAnchor) && {
                                "& .MuiListItemButton-root": {
                                  pr: 5,
                                },
                              }),
                          }}
                          secondaryAction={
                            <IconButton
                              size="small"
                              edge="end"
                              onClick={(event) =>
                                handleMenuOpen(event, chat.id)
                              }
                              aria-label={`Actions for ${chat.title || "Untitled chat"}`}
                            >
                              <MoreVertRoundedIcon fontSize="small" />
                            </IconButton>
                          }
                        >
                          <ListItemButton
                            selected={isActive}
                            disableRipple
                            onClick={() => {
                              router.push(`/chat/${chat.id}`);
                            }}
                            sx={{
                              minWidth: 0,
                              overflow: "hidden",
                              textTransform: "capitalize",
                            }}
                          >
                            <ListItemText
                              sx={{ minWidth: 0 }}
                              primary={
                                <Typography
                                  variant="body2"
                                  noWrap
                                  sx={{
                                    display: "block",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {chat.title || "Untitled Chat"}
                                </Typography>
                              }
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
      </Stack>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleDeleteRequested} disabled={variables.loading}>
          <DeleteOutlineRoundedIcon fontSize="small" sx={{ mr: 1 }} />
          Delete chat
        </MenuItem>
      </Menu>

      <ConfirmationDialog
        open={confirmDeleteOpen}
        title="Delete chat?"
        description="This will permanently delete the conversation and cannot be undone."
        confirmLabel={variables.loading ? "Deleting…" : "Delete"}
        destructive
        loading={variables.loading}
        onConfirm={() => void handleDeleteChat()}
        onClose={() => {
          if (!variables.loading) setConfirmDeleteOpen(false);
        }}
      />
    </AppPanel>
  );
}
