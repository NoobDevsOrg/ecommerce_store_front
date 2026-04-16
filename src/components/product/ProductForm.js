"use client";

import { useMemo, useState } from "react";
import ImageUploader from "./ImageUploader";
import {
  FormField,
  FormSection,
  PrimaryButton,
  SecondaryButton,
  SelectInput,
  TextInput,
  TextareaInput,
  ToggleField,
} from "./FormPrimitives";
import { categoryOptions, collectionOptions, categoryCollectionMap } from "../../data/productOptions";
import { api } from "../../lib/api";

const emptyForm = {
  name: "",
  slug: "",
  price: "",
  compare_price: "",
  stock_qty: "0",
  category_id: "",
  collection_id: "",
  description: "",
  is_published: false,
  is_featured: false,
};

const slugify = (value) =>
  String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

export default function ProductForm({
  mode = "create",
  initialValues,
  isSubmitting,
  readOnly = false,
  submitLabel,
  onSubmit,
  errorMessage,
  onImagesChanged,
}) {
  const [, setToast] = useState({ open: false, message: "", type: "success" });
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [touched, setTouched] = useState({});

  const [form, setForm] = useState(() => {
    if (!initialValues) {
      return emptyForm;
    }
    return {
      name: initialValues.name || "",
      slug: initialValues.slug || "",
      price: String(initialValues.price ?? ""),
      compare_price: String(initialValues.compare_price ?? ""),
      stock_qty: String(initialValues.stock_qty ?? 0),
      category_id: initialValues.category_id || "",
      collection_id: initialValues.collection_id || "",
      description: initialValues.description || "",
      is_published: Boolean(initialValues.is_published),
      is_featured: Boolean(initialValues.is_featured),
      primary_image_storage_path: initialValues.primary_image_storage_path || "",
    };
  });
  const [images, setImages] = useState([]);
  const [slugTouched, setSlugTouched] = useState(() => Boolean(initialValues));
  const [errors, setErrors] = useState({});

  const existingImages = useMemo(() => {
    return (initialValues?.images || []).map((img) => ({
      id: img.id,
      url: img.url || img.base_url,
      alt_text: img.alt_text,
      isPrimary: img.is_primary,
    }));
  }, [initialValues?.images]);

  const categoryChoices = useMemo(() => {
    if (!form.category_id || categoryOptions.some((option) => option.id === form.category_id)) {
      return categoryOptions;
    }
    return [{ id: form.category_id, name: `Current (${form.category_id})` }, ...categoryOptions];
  }, [form.category_id]);

  const allowedCollectionIds = useMemo(() => {
    if (!form.category_id) {
      return [];
    }
    return categoryCollectionMap[form.category_id] || [];
  }, [form.category_id]);

  const collectionChoices = useMemo(() => {
    const allowedCollectionSet = new Set(allowedCollectionIds);
    const filteredCollections = collectionOptions.filter((option) => allowedCollectionSet.has(option.id));

    if (!form.collection_id || filteredCollections.some((option) => option.id === form.collection_id)) {
      return filteredCollections;
    }
    return [{ id: form.collection_id, name: `Current (${form.collection_id})` }, ...filteredCollections];
  }, [allowedCollectionIds, form.collection_id]);

  const handleDeleteImage = async (productId, imageId) => {
    try {
      await api.delete(`/products/admin/products/${productId}/images/${imageId}`);
      setToast({ open: true, message: "Image deleted", type: "success" });
      if (onImagesChanged) onImagesChanged();
      return true;
    } catch (err) {
      setToast({ open: true, message: err?.message || "Failed to delete image", type: "error" });
      return false;
    }
  };

  const handleSetPrimary = async (productId, imageId) => {
    try {
      await api.put(`/products/admin/products/${productId}/images`, { primary_image_id: imageId });
      setToast({ open: true, message: "Primary image updated", type: "success" });
      if (onImagesChanged) onImagesChanged();
      return true;
    } catch (err) {
      setToast({ open: true, message: err?.message || "Failed to update primary image", type: "error" });
      return false;
    }
  };

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (submitAttempted || touched[key]) {
      setErrors((prev) => ({
        ...prev,
        [key]: validateField(key, value, { ...form, [key]: value }, images, existingImages),
      }));
    }
  };

  const markTouched = (fieldName) => {
    setTouched((prev) => ({ ...prev, [fieldName]: true }));
    setErrors((prev) => ({
      ...prev,
      [fieldName]: validateField(fieldName, form[fieldName], form, images, existingImages),
    }));
  };

  const validate = () => {
    const nextErrors = {
      name: validateField("name", form.name, form, images, existingImages),
      slug: validateField("slug", form.slug, form, images, existingImages),
      price: validateField("price", form.price, form, images, existingImages),
      compare_price: validateField("compare_price", form.compare_price, form, images, existingImages),
      stock_qty: validateField("stock_qty", form.stock_qty, form, images, existingImages),
      category_id: validateField("category_id", form.category_id, form, images, existingImages),
      collection_id: validateField("collection_id", form.collection_id, form, images, existingImages),
      description: validateField("description", form.description, form, images, existingImages),
      images: validateField("images", images, form, images, existingImages, mode),
    };

    Object.keys(nextErrors).forEach((key) => {
      if (!nextErrors[key]) delete nextErrors[key];
    });

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const buildFormData = () => {
    const payload = new FormData();
    payload.append("name", form.name.trim());
    payload.append("slug", form.slug.trim());

    if (form.price !== "") payload.append("price", String(Number(form.price)));
    if (form.compare_price !== "") payload.append("compare_price", String(Number(form.compare_price)));

    payload.append("stock_qty", String(Number(form.stock_qty || 0)));

    if (form.category_id.trim()) payload.append("category_id", form.category_id.trim());
    if (form.collection_id.trim()) payload.append("collection_id", form.collection_id.trim());
    if (form.description.trim()) payload.append("description", form.description.trim());

    payload.append("is_published", String(form.is_published));
    payload.append("is_featured", String(form.is_featured));

    images.forEach((file) => payload.append("images", file));

    return payload;
  };

  const buildJsonPayload = () => ({
    name: form.name.trim(),
    slug: form.slug.trim(),
    price: form.price === "" ? undefined : String(Number(form.price)),
    compare_price: form.compare_price === "" ? undefined : String(Number(form.compare_price)),
    stock_qty: Number(form.stock_qty || 0),
    category_id: form.category_id.trim() || undefined,
    collection_id: form.collection_id.trim() || undefined,
    description: form.description.trim() || undefined,
    is_published: form.is_published,
    is_featured: form.is_featured,
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (readOnly) return;

    setSubmitAttempted(true);
    setTouched({
      name: true,
      slug: true,
      price: true,
      compare_price: true,
      stock_qty: true,
      category_id: true,
      collection_id: true,
      description: true,
      images: true,
    });

    if (!validate()) return;

    if (mode === "create") {
      await onSubmit(buildFormData());
      return;
    }

    if (images.length > 0) {
      await onSubmit(buildFormData());
      return;
    }

    await onSubmit(buildJsonPayload());
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-lg border border-stone-800 bg-[#0c0816] p-4 shadow-sm sm:p-5">
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-stone-400">
          <span className="rounded-full bg-stone-700 px-3 py-1">Basic info</span>
          <span className="rounded-full bg-stone-700 px-3 py-1">Pricing</span>
          <span className="rounded-full bg-stone-700 px-3 py-1">Inventory</span>
          <span className="rounded-full bg-stone-700 px-3 py-1">Media</span>
          <span className="rounded-full bg-stone-700 px-3 py-1">Publishing</span>
        </div>
      </div>

      <FormSection
        title="Basic Info"
        description="Define core product identity so shoppers can discover and trust this listing."
        tone="accent"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            id="product-name"
            label="Product Name"
            required
            helperText="Use a clear commercial name between 3 and 80 characters."
            error={errors.name}
          >
            {({ describedBy, error }) => (
              <TextInput
                id="product-name"
                value={form.name}
                disabled={readOnly}
                onBlur={() => markTouched("name")}
                onChange={(event) => {
                  const nextName = event.target.value;
                  update("name", nextName);
                  if (!slugTouched) update("slug", slugify(nextName));
                }}
                placeholder="Temple Gold Necklace"
                aria-invalid={error}
                aria-describedby={describedBy}
                maxLength={80}
                error={error}
              />
            )}
          </FormField>

          <FormField
            id="product-slug"
            label="URL Slug"
            required
            helperText="Only lowercase letters, numbers, and hyphens are allowed."
            error={errors.slug}
          >
            {({ describedBy, error }) => (
              <TextInput
                id="product-slug"
                value={form.slug}
                disabled={readOnly}
                onBlur={() => markTouched("slug")}
                onChange={(event) => {
                  setSlugTouched(true);
                  update("slug", slugify(event.target.value));
                }}
                placeholder="temple-gold-necklace"
                aria-invalid={error}
                aria-describedby={describedBy}
                maxLength={90}
                error={error}
              />
            )}
          </FormField>

          {mode === "edit" && initialValues?.sku ? (
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-stone-400">SKU</span>
              <span className="inline-flex items-center rounded-lg border border-stone-800 bg-[#161022] px-3 py-2 font-mono text-sm text-stone-300">
                {initialValues.sku}
              </span>
              <span className="text-[11px] text-stone-500">Auto-generated · read-only</span>
            </div>
          ) : null}

          <FormField
            id="product-category"
            label="Category"
            helperText="Choose the closest category for navigation and filtering."
            error={errors.category_id}
          >
            {({ describedBy, error }) => (
              <SelectInput
                id="product-category"
                value={form.category_id}
                disabled={readOnly}
                onBlur={() => markTouched("category_id")}
                onChange={(event) => {
                  const nextCategoryId = event.target.value;
                  const nextAllowedCollectionIds = categoryCollectionMap[nextCategoryId] || [];

                  setForm((prev) => ({
                    ...prev,
                    category_id: nextCategoryId,
                    collection_id: nextAllowedCollectionIds.includes(prev.collection_id) ? prev.collection_id : "",
                  }));
                }}
                aria-invalid={error}
                aria-describedby={describedBy}
                error={error}
              >
                <option value="">Select a category</option>
                {categoryChoices.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </SelectInput>
            )}
          </FormField>

          <div className="md:col-span-2">
            <FormField
              id="product-description"
              label="Description"
              required
              helperText="Add at least 20 characters. Highlight craftsmanship, material, and use-case."
              error={errors.description}
            >
              {({ describedBy, error }) => (
                <TextareaInput
                  id="product-description"
                  rows={5}
                  value={form.description}
                  disabled={readOnly}
                  onBlur={() => markTouched("description")}
                  onChange={(event) => update("description", event.target.value)}
                  placeholder="Describe this piece with details about design language, purity, and audience."
                  aria-invalid={error}
                  aria-describedby={describedBy}
                  maxLength={1200}
                  error={error}
                />
              )}
            </FormField>
          </div>
        </div>
      </FormSection>

      <div className="grid gap-6 lg:grid-cols-2">
        <FormSection title="Pricing" description="Set pricing with accurate sale and compare values.">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField id="product-price" label="Price" required helperText="Base sell price in INR." error={errors.price}>
              {({ describedBy, error }) => (
                <TextInput
                  id="product-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  disabled={readOnly}
                  onBlur={() => markTouched("price")}
                  onChange={(event) => update("price", event.target.value)}
                  placeholder="0.00"
                  aria-invalid={error}
                  aria-describedby={describedBy}
                  error={error}
                />
              )}
            </FormField>

            <FormField
              id="product-compare-price"
              label="Compare Price"
              helperText="Optional. Must be greater than or equal to price."
              error={errors.compare_price}
            >
              {({ describedBy, error }) => (
                <TextInput
                  id="product-compare-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.compare_price}
                  disabled={readOnly}
                  onBlur={() => markTouched("compare_price")}
                  onChange={(event) => update("compare_price", event.target.value)}
                  placeholder="0.00"
                  aria-invalid={error}
                  aria-describedby={describedBy}
                  error={error}
                />
              )}
            </FormField>
          </div>
        </FormSection>

        <FormSection title="Inventory & Catalog" description="Control availability and merchandising placement.">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              id="product-stock"
              label="Stock Quantity"
              required
              helperText="Whole number between 0 and 999999."
              error={errors.stock_qty}
            >
              {({ describedBy, error }) => (
                <TextInput
                  id="product-stock"
                  type="number"
                  min="0"
                  step="1"
                  value={form.stock_qty}
                  disabled={readOnly}
                  onBlur={() => markTouched("stock_qty")}
                  onChange={(event) => update("stock_qty", event.target.value)}
                  placeholder="25"
                  aria-invalid={error}
                  aria-describedby={describedBy}
                  error={error}
                />
              )}
            </FormField>

            <FormField
              id="product-collection"
              label="Collection"
              helperText="Optional. Helps you group products for campaigns."
              error={errors.collection_id}
            >
              {({ describedBy, error }) => (
                <SelectInput
                  id="product-collection"
                  value={form.collection_id}
                  onBlur={() => markTouched("collection_id")}
                  onChange={(event) => update("collection_id", event.target.value)}
                  disabled={readOnly || !form.category_id || collectionChoices.length === 0}
                  aria-invalid={error}
                  aria-describedby={describedBy}
                  error={error}
                >
                  <option value="">
                    {!form.category_id
                      ? "Select a category first"
                      : collectionChoices.length
                        ? "Select a collection"
                        : "No collections available"}
                  </option>
                  {collectionChoices.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </SelectInput>
              )}
            </FormField>
          </div>
        </FormSection>
      </div>

      <FormSection title="Publishing" description="Choose visibility and storefront promotion settings.">
        <div className="grid gap-3 sm:grid-cols-2">
          <ToggleField
            id="product-published"
            label="Publish to Store"
            description="Uncheck to keep this as a draft while you continue editing."
            checked={form.is_published}
            onChange={(checked) => update("is_published", checked)}
            disabled={isSubmitting || readOnly}
          />
          <ToggleField
            id="product-featured"
            label="Mark as Featured"
            description="Highlight this product in key merchandising sections."
            checked={form.is_featured}
            onChange={(checked) => update("is_featured", checked)}
            disabled={isSubmitting || readOnly}
          />
        </div>
      </FormSection>

      <FormSection title="Media" description="Upload rich product photos and define a strong primary image.">
        <ImageUploader
          files={images}
          existingImages={existingImages}
          onChange={(nextImages) => {
            setImages(nextImages);
            if (submitAttempted || touched.images) {
              setErrors((prev) => ({
                ...prev,
                images: validateField("images", nextImages, form, nextImages, existingImages, mode),
              }));
            }
          }}
          disabled={isSubmitting || readOnly}
          productId={mode === "edit" ? initialValues?.id : null}
          onDeleteImage={mode === "edit" && !readOnly ? handleDeleteImage : null}
          onSetPrimary={mode === "edit" && !readOnly ? handleSetPrimary : null}
        />
        {errors.images ? (
          <p className="mt-2 text-xs font-medium text-red-400">! {errors.images}</p>
        ) : null}
      </FormSection>

      {errorMessage ? (
        <div
          role="alert"
          className="rounded-lg border border-red-800 bg-red-900/20 px-4 py-3 text-sm text-red-400"
        >
          {errorMessage}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-stone-800 bg-[#0c0816] p-4 shadow-sm">
        <p className="text-xs text-stone-400">
          {readOnly ? "Read-only mode. Use Edit to modify product details." : "All required fields must be valid before saving."}
        </p>
        <div className="flex items-center gap-2">
          <SecondaryButton type="button" onClick={() => window.history.back()} disabled={isSubmitting}>
            {readOnly ? "Back" : "Cancel"}
          </SecondaryButton>
          {!readOnly ? (
            <PrimaryButton type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving product..." : submitLabel || (mode === "create" ? "Create Product" : "Update Product")}
            </PrimaryButton>
          ) : null}
        </div>
      </div>
    </form>
  );
}

function validateField(fieldName, value, fullForm, images, existingImages, mode = "edit") {
  switch (fieldName) {
    case "name": {
      const trimmed = String(value || "").trim();
      if (!trimmed) return "Product name is required.";
      if (trimmed.length < 3) return "Product name must be at least 3 characters.";
      if (trimmed.length > 80) return "Product name cannot exceed 80 characters.";
      return "";
    }
    case "slug": {
      const trimmed = String(value || "").trim();
      if (!trimmed) return "Slug is required.";
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(trimmed)) {
        return "Use lowercase letters, numbers, and single hyphens only.";
      }
      if (trimmed.length > 90) return "Slug cannot exceed 90 characters.";
      return "";
    }
    case "price": {
      if (value === "" || value === null || value === undefined) return "Price is required.";
      const price = Number(value);
      if (Number.isNaN(price)) return "Enter a valid numeric price.";
      if (price < 0) return "Price cannot be negative.";
      if (price > 9999999) return "Price looks too high. Use a value below 9,999,999.";
      return "";
    }
    case "compare_price": {
      if (value === "" || value === null || value === undefined) return "";
      const comparePrice = Number(value);
      if (Number.isNaN(comparePrice) || comparePrice < 0) return "Compare price must be 0 or greater.";
      const price = Number(fullForm.price);
      if (!Number.isNaN(price) && comparePrice < price) {
        return "Compare price should be greater than or equal to selling price.";
      }
      return "";
    }
    case "stock_qty": {
      if (value === "" || value === null || value === undefined) return "Stock quantity is required.";
      const stock = Number(value);
      if (!Number.isInteger(stock)) return "Stock quantity must be a whole number.";
      if (stock < 0) return "Stock quantity cannot be negative.";
      if (stock > 999999) return "Stock quantity should be below 999999.";
      return "";
    }
    case "category_id": {
      const trimmed = String(value || "").trim();
      if (!trimmed) return "";
      if (!/^[a-z0-9_-]{3,80}$/i.test(trimmed)) return "Category id format is invalid.";
      return "";
    }
    case "collection_id": {
      const trimmed = String(value || "").trim();
      if (!trimmed) return "";
      if (!/^[a-z0-9_-]{3,80}$/i.test(trimmed)) return "Collection id format is invalid.";
      return "";
    }
    case "description": {
      const trimmed = String(value || "").trim();
      if (!trimmed) return "Description is required.";
      if (trimmed.length < 20) return "Description should be at least 20 characters.";
      if (trimmed.length > 1200) return "Description cannot exceed 1200 characters.";
      return "";
    }
    case "images": {
      if (mode === "create" && !images.length && !existingImages.length) {
        return "Please upload at least one product image.";
      }
      return "";
    }
    default:
      return "";
  }
}
