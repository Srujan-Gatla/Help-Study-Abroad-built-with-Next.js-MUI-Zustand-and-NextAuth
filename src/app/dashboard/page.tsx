// src/app/dashboard/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Skeleton,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
} from "@mui/material";
import { People, Inventory2, Category, Star } from "@mui/icons-material";
import AuthGuard from "@/components/AuthGuard";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuthStore } from "@/store/authStore";

interface StatCard {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

function StatCardComponent({ label, value, icon, color }: StatCard) {
  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {label}
            </Typography>
            <Typography variant="h4" fontWeight={700}>
              {value}
            </Typography>
          </Box>
          <Avatar sx={{ bgcolor: color, width: 52, height: 52 }}>{icon}</Avatar>
        </Box>
      </CardContent>
    </Card>
  );
}

// Using React.memo to avoid unnecessary re-renders of stat cards
const MemoStatCard = React.memo(StatCardComponent);

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({ users: 0, products: 0, categories: 0 });
  const [recentUsers, setRecentUsers] = useState<{ id: number; firstName: string; lastName: string; email: string; image: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, productsRes, catsRes] = await Promise.all([
          fetch("https://dummyjson.com/users?limit=5"),
          fetch("https://dummyjson.com/products?limit=1"),
          fetch("https://dummyjson.com/products/categories"),
        ]);
        const [usersData, productsData, catsData] = await Promise.all([
          usersRes.json(),
          productsRes.json(),
          catsRes.json(),
        ]);
        setStats({
          users: usersData.total,
          products: productsData.total,
          categories: catsData.length,
        });
        setRecentUsers(usersData.users);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    { label: "Total Users", value: stats.users, icon: <People />, color: "#1a56db" },
    { label: "Total Products", value: stats.products, icon: <Inventory2 />, color: "#7e3af2" },
    { label: "Categories", value: stats.categories, icon: <Category />, color: "#0ea5e9" },
    { label: "Avg Rating", value: "4.5", icon: <Star />, color: "#f59e0b" },
  ];

  return (
    <AuthGuard>
      <DashboardLayout>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Welcome back, {user?.firstName || "Admin"} 👋
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Here&apos;s what&apos;s happening with your platform today.
          </Typography>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            {statCards.map((card) => (
              <Grid item xs={12} sm={6} lg={3} key={card.label}>
                {loading ? (
                  <Skeleton variant="rounded" height={100} />
                ) : (
                  <MemoStatCard {...card} />
                )}
              </Grid>
            ))}
          </Grid>

          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Recent Users
              </Typography>
              <List disablePadding>
                {loading
                  ? Array(5)
                      .fill(0)
                      .map((_, i) => (
                        <ListItem key={i}>
                          <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
                          <Box sx={{ flex: 1 }}>
                            <Skeleton width="40%" />
                            <Skeleton width="60%" />
                          </Box>
                        </ListItem>
                      ))
                  : recentUsers.map((u, i) => (
                      <React.Fragment key={u.id}>
                        <ListItem sx={{ px: 0 }}>
                          <ListItemAvatar>
                            <Avatar src={u.image} />
                          </ListItemAvatar>
                          <ListItemText
                            primary={`${u.firstName} ${u.lastName}`}
                            secondary={u.email}
                          />
                        </ListItem>
                        {i < recentUsers.length - 1 && <Divider component="li" />}
                      </React.Fragment>
                    ))}
              </List>
            </CardContent>
          </Card>
        </Box>
      </DashboardLayout>
    </AuthGuard>
  );
}
