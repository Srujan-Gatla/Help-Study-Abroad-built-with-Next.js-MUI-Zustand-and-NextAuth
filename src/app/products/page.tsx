// src/app/products/page.tsx
"use client";

import React, { useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Alert,
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Chip,
  CircularProgress,
  FormControl,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Pagination,
  Rating,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
} from "@mui/material";
import { Search } from "@mui/icons-material";
import AuthGuard from "@/components/AuthGuard";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useProductsStore } from "@/store/productsStore";
import { Product } from "@/types";

// Memoized product card component to prevent re-renders
const ProductCard = React.memo(function ProductCard({
  product,
  onClick,
}: {
  product: Product;
  onClick: (id: number) => void;
}) {
  const discountedPrice = useMemo(
    () =>
      (product.price * (1 - product.discountPercentage / 100)).toFixed(2),
    [product.price, product.discountPercentage]
  );

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        transition: "transform 0.2s, box-shadow 0.2s",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
        },
      }}
    >
      <CardActionArea
        onClick={() => onClick(product.id)}
        sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "stretch" }}
      >
        <Box sx={{ position: "relative", pt: "60%", bgcolor: "#f8f9fa" }}>
          <Image
            src={product.thumbnail}
            alt={product.title}
            fill
            style={{ objectFit: "contain", padding: "8px" }}
            sizes="(max-width:600px) 100vw, (max-width:900px) 50vw, 33vw"
          />
          {product.discountPercentage > 5 && (
            <Chip
              label={`-${Math.round(product.discountPercentage)}%`}
              color="error"
              size="small"
              sx={{
                position: "absolute",
                top: 8,
                right: 8,
                fontWeight: 700,
              }}
            />
          )}
        </Box>
        <CardContent sx={{ flex: 1 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}
          >
            {product.category}
          </Typography>
          <Typography
            variant="subtitle2"
            fontWeight={600}
            sx={{
              mt: 0.5,
              mb: 1,
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {product.title}
          </Typography>
          <Rating value={product.rating} precision={0.1} size="small" readOnly />
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
            <Typography variant="h6" fontWeight={700} color="primary.main">
              ${discountedPrice}
            </Typography>
            {product.discountPercentage > 1 && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ textDecoration: "line-through" }}
              >
                ${product.price}
              </Typography>
            )}
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
});

export default function ProductsPage() {
  const router = useRouter();
  const {
    products,
    total,
    currentPage,
    limit,
    searchQuery,
    selectedCategory,
    categories,
    loading,
    error,
    fetchProducts,
    fetchCategories,
    setPage,
    setSearchQuery,
    setCategory,
  } = useProductsStore();

  const totalPages = useMemo(() => Math.ceil(total / limit), [total, limit]);

  useEffect(() => {
    fetchProducts(currentPage, searchQuery, selectedCategory);
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const q = e.target.value;
      setSearchQuery(q);
      fetchProducts(1, q, "");
    },
    [setSearchQuery, fetchProducts]
  );

  const handleCategoryChange = useCallback(
    (e: SelectChangeEvent) => {
      const cat = e.target.value;
      setCategory(cat);
      fetchProducts(1, "", cat);
    },
    [setCategory, fetchProducts]
  );

  const handlePageChange = useCallback(
    (_: React.ChangeEvent<unknown>, page: number) => {
      setPage(page);
      fetchProducts(page, searchQuery, selectedCategory);
    },
    [setPage, fetchProducts, searchQuery, selectedCategory]
  );

  const handleCardClick = useCallback(
    (id: number) => router.push(`/products/${id}`),
    [router]
  );

  return (
    <AuthGuard>
      <DashboardLayout>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Products
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {total} products available
          </Typography>

          {/* Filters row */}
          <Box
            sx={{
              display: "flex",
              gap: 2,
              mb: 3,
              flexDirection: { xs: "column", sm: "row" },
            }}
          >
            <TextField
              placeholder="Search products..."
              value={searchQuery}
              onChange={handleSearch}
              sx={{ flex: 1, maxWidth: { sm: 400 } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={selectedCategory}
                label="Category"
                onChange={handleCategoryChange}
              >
                <MenuItem value="">All Categories</MenuItem>
                {categories.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Grid container spacing={2.5}>
                {products.length === 0 ? (
                  <Grid item xs={12}>
                    <Typography textAlign="center" color="text.secondary" py={6}>
                      No products found
                    </Typography>
                  </Grid>
                ) : (
                  products.map((product) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                      <ProductCard product={product} onClick={handleCardClick} />
                    </Grid>
                  ))
                )}
              </Grid>

              {totalPages > 1 && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                  <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={handlePageChange}
                    color="primary"
                    shape="rounded"
                  />
                </Box>
              )}
            </>
          )}
        </Box>
      </DashboardLayout>
    </AuthGuard>
  );
}
