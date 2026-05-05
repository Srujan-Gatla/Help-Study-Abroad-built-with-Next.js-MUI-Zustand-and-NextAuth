// src/app/products/[id]/page.tsx
"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  Rating,
  Typography,
  Avatar,
  LinearProgress,
} from "@mui/material";
import {
  ArrowBack,
  ChevronLeft,
  ChevronRight,
  LocalShipping,
  Loop,
  Inventory,
  Verified,
} from "@mui/icons-material";
import AuthGuard from "@/components/AuthGuard";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useProductsStore } from "@/store/productsStore";
import { Product } from "@/types";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { fetchProductById } = useProductsStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    const load = async () => {
      const id = Number(params.id);
      if (!id) { setError("Invalid product ID"); setLoading(false); return; }
      const data = await fetchProductById(id);
      if (data) setProduct(data);
      else setError("Product not found");
      setLoading(false);
    };
    load();
  }, [params.id, fetchProductById]);

  const prevImg = useCallback(() => {
    if (!product) return;
    setActiveImg((i) => (i - 1 + product.images.length) % product.images.length);
  }, [product]);

  const nextImg = useCallback(() => {
    if (!product) return;
    setActiveImg((i) => (i + 1) % product.images.length);
  }, [product]);

  return (
    <AuthGuard>
      <DashboardLayout>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => router.push("/products")}
          sx={{ mb: 2 }}
          variant="outlined"
        >
          Back to Products
        </Button>

        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress />
          </Box>
        )}
        {error && <Alert severity="error">{error}</Alert>}

        {product && (
          <Grid container spacing={3}>
            {/* Images carousel */}
            <Grid item xs={12} md={5}>
              <Card>
                <Box
                  sx={{
                    position: "relative",
                    pt: "80%",
                    bgcolor: "#f8f9fa",
                  }}
                >
                  <Image
                    src={product.images[activeImg] || product.thumbnail}
                    alt={product.title}
                    fill
                    style={{ objectFit: "contain", padding: "16px" }}
                    sizes="(max-width:900px) 100vw, 50vw"
                  />
                  {product.images.length > 1 && (
                    <>
                      <IconButton
                        onClick={prevImg}
                        sx={{
                          position: "absolute",
                          left: 8,
                          top: "50%",
                          transform: "translateY(-50%)",
                          bgcolor: "rgba(255,255,255,0.9)",
                        }}
                      >
                        <ChevronLeft />
                      </IconButton>
                      <IconButton
                        onClick={nextImg}
                        sx={{
                          position: "absolute",
                          right: 8,
                          top: "50%",
                          transform: "translateY(-50%)",
                          bgcolor: "rgba(255,255,255,0.9)",
                        }}
                      >
                        <ChevronRight />
                      </IconButton>
                    </>
                  )}
                </Box>
                {/* Thumbnails */}
                {product.images.length > 1 && (
                  <Box sx={{ display: "flex", gap: 1, p: 1.5, overflowX: "auto" }}>
                    {product.images.map((img, i) => (
                      <Box
                        key={i}
                        onClick={() => setActiveImg(i)}
                        sx={{
                          position: "relative",
                          width: 60,
                          height: 60,
                          flexShrink: 0,
                          border: "2px solid",
                          borderColor: activeImg === i ? "primary.main" : "divider",
                          borderRadius: 1,
                          cursor: "pointer",
                          overflow: "hidden",
                          bgcolor: "#f8f9fa",
                        }}
                      >
                        <Image
                          src={img}
                          alt={`${product.title} ${i + 1}`}
                          fill
                          style={{ objectFit: "contain", padding: "4px" }}
                          sizes="60px"
                        />
                      </Box>
                    ))}
                  </Box>
                )}
              </Card>
            </Grid>

            {/* Product info */}
            <Grid item xs={12} md={7}>
              <Card sx={{ height: "100%" }}>
                <CardContent sx={{ p: 3 }}>
                  <Chip label={product.category} size="small" sx={{ mb: 1.5, textTransform: "capitalize" }} />
                  <Typography variant="h4" fontWeight={700} gutterBottom>
                    {product.title}
                  </Typography>
                  {product.brand && (
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      by <strong>{product.brand}</strong>
                    </Typography>
                  )}

                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, my: 1.5 }}>
                    <Rating value={product.rating} precision={0.1} readOnly />
                    <Typography variant="body2" color="text.secondary">
                      ({product.rating.toFixed(1)})
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "baseline", gap: 1.5, mb: 2 }}>
                    <Typography variant="h3" fontWeight={700} color="primary.main">
                      ${(product.price * (1 - product.discountPercentage / 100)).toFixed(2)}
                    </Typography>
                    <Typography
                      variant="h5"
                      color="text.secondary"
                      sx={{ textDecoration: "line-through" }}
                    >
                      ${product.price}
                    </Typography>
                    <Chip
                      label={`${Math.round(product.discountPercentage)}% OFF`}
                      color="error"
                      size="small"
                    />
                  </Box>

                  <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                    {product.description}
                  </Typography>

                  <Divider sx={{ my: 2 }} />

                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    {[
                      { icon: <LocalShipping />, label: "Shipping", value: product.shippingInformation },
                      { icon: <Loop />, label: "Returns", value: product.returnPolicy },
                      { icon: <Inventory />, label: "Status", value: product.availabilityStatus },
                      { icon: <Verified />, label: "Warranty", value: product.warrantyInformation },
                    ].map(({ icon, label, value }) => (
                      <Grid item xs={12} sm={6} key={label}>
                        <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
                          <Box sx={{ color: "primary.main", mt: 0.5 }}>{icon}</Box>
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              {label}
                            </Typography>
                            <Typography variant="body2" fontWeight={500}>
                              {value}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>

                  <Divider sx={{ my: 2 }} />

                  {/* Stock indicator */}
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                      <Typography variant="body2">Stock</Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {product.stock} units
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min((product.stock / 100) * 100, 100)}
                      color={product.stock > 50 ? "success" : product.stock > 20 ? "warning" : "error"}
                      sx={{ borderRadius: 4, height: 8 }}
                    />
                  </Box>

                  {/* Tags */}
                  {product.tags?.length > 0 && (
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                      {product.tags.map((tag) => (
                        <Chip key={tag} label={tag} size="small" variant="outlined" />
                      ))}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Reviews */}
            {product.reviews?.length > 0 && (
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      Customer Reviews ({product.reviews.length})
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    {product.reviews.map((review, i) => (
                      <Box key={i} sx={{ mb: 2 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.5 }}>
                          <Avatar sx={{ width: 32, height: 32, fontSize: 14 }}>
                            {review.reviewerName[0]}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              {review.reviewerName}
                            </Typography>
                            <Rating value={review.rating} size="small" readOnly />
                          </Box>
                          <Typography variant="caption" color="text.secondary" sx={{ ml: "auto" }}>
                            {new Date(review.date).toLocaleDateString()}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ pl: 5.5 }}>
                          {review.comment}
                        </Typography>
                        {i < product.reviews.length - 1 && <Divider sx={{ mt: 2 }} />}
                      </Box>
                    ))}
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
        )}
      </DashboardLayout>
    </AuthGuard>
  );
}
