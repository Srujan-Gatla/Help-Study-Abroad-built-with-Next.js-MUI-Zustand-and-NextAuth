// src/app/users/[id]/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Typography,
} from "@mui/material";
import {
  ArrowBack,
  Email,
  Phone,
  Cake,
  LocationOn,
  Business,
  School,
  Bloodtype,
  Height,
  MonitorWeight,
} from "@mui/icons-material";
import AuthGuard from "@/components/AuthGuard";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useUsersStore } from "@/store/usersStore";
import { User } from "@/types";

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 1 }}>
      <Box sx={{ color: "primary.main", display: "flex" }}>{icon}</Box>
      <Box>
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="body2" fontWeight={500}>
          {value || "—"}
        </Typography>
      </Box>
    </Box>
  );
}

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { fetchUserById } = useUsersStore();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      const id = Number(params.id);
      if (!id) { setError("Invalid user ID"); setLoading(false); return; }
      const data = await fetchUserById(id);
      if (data) setUser(data);
      else setError("User not found");
      setLoading(false);
    };
    load();
  }, [params.id, fetchUserById]);

  return (
    <AuthGuard>
      <DashboardLayout>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => router.push("/users")}
          sx={{ mb: 2 }}
          variant="outlined"
        >
          Back to Users
        </Button>

        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress />
          </Box>
        )}

        {error && <Alert severity="error">{error}</Alert>}

        {user && (
          <Grid container spacing={3}>
            {/* Profile header */}
            <Grid item xs={12}>
              <Card>
                <CardContent
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    alignItems: { xs: "center", sm: "flex-start" },
                    gap: 3,
                    textAlign: { xs: "center", sm: "left" },
                  }}
                >
                  <Avatar
                    src={user.image}
                    sx={{ width: 100, height: 100, border: "3px solid", borderColor: "primary.main" }}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h4" fontWeight={700}>
                      {user.firstName} {user.lastName}
                    </Typography>
                    <Typography color="text.secondary">@{user.username}</Typography>
                    <Box sx={{ mt: 1.5, display: "flex", gap: 1, flexWrap: "wrap", justifyContent: { xs: "center", sm: "flex-start" } }}>
                      <Chip label={user.gender} size="small" color="primary" variant="outlined" />
                      <Chip label={`Age ${user.age}`} size="small" variant="outlined" />
                      <Chip label={user.role} size="small" color="secondary" />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Contact Info */}
            <Grid item xs={12} md={6}>
              <Card sx={{ height: "100%" }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Contact Information
                  </Typography>
                  <Divider sx={{ mb: 1.5 }} />
                  <InfoRow icon={<Email fontSize="small" />} label="Email" value={user.email} />
                  <InfoRow icon={<Phone fontSize="small" />} label="Phone" value={user.phone} />
                  <InfoRow icon={<Cake fontSize="small" />} label="Birth Date" value={user.birthDate} />
                  <InfoRow
                    icon={<LocationOn fontSize="small" />}
                    label="Address"
                    value={`${user.address?.address}, ${user.address?.city}, ${user.address?.state} ${user.address?.postalCode}, ${user.address?.country}`}
                  />
                </CardContent>
              </Card>
            </Grid>

            {/* Company Info */}
            <Grid item xs={12} md={6}>
              <Card sx={{ height: "100%" }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Professional Details
                  </Typography>
                  <Divider sx={{ mb: 1.5 }} />
                  <InfoRow icon={<Business fontSize="small" />} label="Company" value={user.company?.name} />
                  <InfoRow icon={<Business fontSize="small" />} label="Department" value={user.company?.department} />
                  <InfoRow icon={<Business fontSize="small" />} label="Title" value={user.company?.title} />
                  <InfoRow icon={<School fontSize="small" />} label="University" value={user.university} />
                </CardContent>
              </Card>
            </Grid>

            {/* Physical Info */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Physical Info
                  </Typography>
                  <Divider sx={{ mb: 1.5 }} />
                  <InfoRow icon={<Bloodtype fontSize="small" />} label="Blood Group" value={user.bloodGroup} />
                  <InfoRow icon={<Height fontSize="small" />} label="Height" value={`${user.height} cm`} />
                  <InfoRow icon={<MonitorWeight fontSize="small" />} label="Weight" value={`${user.weight} kg`} />
                  <InfoRow icon={<Box component="span" />} label="Eye Color" value={user.eyeColor} />
                  <InfoRow
                    icon={<Box component="span" />}
                    label="Hair"
                    value={`${user.hair?.color} ${user.hair?.type}`}
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </DashboardLayout>
    </AuthGuard>
  );
}
