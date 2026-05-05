// src/app/users/page.tsx
"use client";

import React, { useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Avatar,
  Box,
  Card,
  Chip,
  CircularProgress,
  InputAdornment,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Alert,
  useMediaQuery,
  useTheme,
  Grid,
  CardContent,
  CardActionArea,
} from "@mui/material";
import { Search, Male, Female } from "@mui/icons-material";
import AuthGuard from "@/components/AuthGuard";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useUsersStore } from "@/store/usersStore";
import { User } from "@/types";

// Memoized row component to reduce re-renders
const UserRow = React.memo(function UserRow({
  user,
  onClick,
}: {
  user: User;
  onClick: (id: number) => void;
}) {
  return (
    <TableRow
      hover
      sx={{ cursor: "pointer" }}
      onClick={() => onClick(user.id)}
    >
      <TableCell>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Avatar src={user.image} sx={{ width: 36, height: 36 }} />
          <Typography variant="body2" fontWeight={500}>
            {user.firstName} {user.lastName}
          </Typography>
        </Box>
      </TableCell>
      <TableCell>{user.email}</TableCell>
      <TableCell>
        <Chip
          size="small"
          label={user.gender}
          icon={user.gender === "male" ? <Male /> : <Female />}
          color={user.gender === "male" ? "primary" : "secondary"}
          variant="outlined"
        />
      </TableCell>
      <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>{user.phone}</TableCell>
      <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
        {user.company?.name}
      </TableCell>
    </TableRow>
  );
});

// Mobile card component
const UserCard = React.memo(function UserCard({
  user,
  onClick,
}: {
  user: User;
  onClick: (id: number) => void;
}) {
  return (
    <Card sx={{ mb: 1.5 }}>
      <CardActionArea onClick={() => onClick(user.id)}>
        <CardContent sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <Avatar src={user.image} sx={{ width: 50, height: 50 }} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography fontWeight={600} noWrap>
              {user.firstName} {user.lastName}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {user.email}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {user.company?.name}
            </Typography>
          </Box>
          <Chip size="small" label={user.gender} variant="outlined" />
        </CardContent>
      </CardActionArea>
    </Card>
  );
});

export default function UsersPage() {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const {
    users,
    total,
    currentPage,
    limit,
    searchQuery,
    loading,
    error,
    fetchUsers,
    setPage,
    setSearchQuery,
  } = useUsersStore();

  const totalPages = useMemo(() => Math.ceil(total / limit), [total, limit]);

  useEffect(() => {
    fetchUsers(currentPage, searchQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const q = e.target.value;
      setSearchQuery(q);
      fetchUsers(1, q);
    },
    [setSearchQuery, fetchUsers]
  );

  const handlePageChange = useCallback(
    (_: React.ChangeEvent<unknown>, page: number) => {
      setPage(page);
      fetchUsers(page, searchQuery);
    },
    [setPage, fetchUsers, searchQuery]
  );

  const handleRowClick = useCallback(
    (id: number) => router.push(`/users/${id}`),
    [router]
  );

  return (
    <AuthGuard>
      <DashboardLayout>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Users
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {total} total users registered
          </Typography>

          {/* Search bar */}
          <TextField
            placeholder="Search users by name, email..."
            value={searchQuery}
            onChange={handleSearch}
            fullWidth
            sx={{ mb: 3, maxWidth: 480 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search color="action" />
                </InputAdornment>
              ),
            }}
          />

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
              <CircularProgress />
            </Box>
          ) : isMobile ? (
            // Mobile card layout
            <Box>
              {users.map((user) => (
                <UserCard key={user.id} user={user} onClick={handleRowClick} />
              ))}
            </Box>
          ) : (
            // Desktop table layout
            <Card>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Gender</TableCell>
                      <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>
                        Phone
                      </TableCell>
                      <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
                        Company
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                          <Typography color="text.secondary">No users found</Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.map((user) => (
                        <UserRow key={user.id} user={user} onClick={handleRowClick} />
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          )}

          {totalPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                shape="rounded"
              />
            </Box>
          )}
        </Box>
      </DashboardLayout>
    </AuthGuard>
  );
}
