# Product Catalog and Storefront Updates

This document describes the current product-catalog backend changes and the
matching frontend work, along with the related storefront navigation and cart
updates.

## Overview

The catalog now supports multiple product photos and reusable colored tags.
Customers can open a dedicated product-details page, browse a product's photos,
and add a chosen quantity to their bag. Administrators can manage product
photos and tags from the product-management screen. The storefront navbar stays
fixed while scrolling, and customers can remove individual items during
checkout.

## Backend

### Product model and responses

- Products have a one-to-many relationship with `ProductImage` records:
  - `url`: required URL, up to 500 characters.
  - `altText`: optional accessibility description, up to 150 characters.
  - `sortOrder`: optional non-negative display position.
- Products have a many-to-many relationship with reusable `Tag` records:
  - `name`: unique, up to 50 characters.
  - `colorHex`: optional hexadecimal color.
- Product list and single-product queries include the category, photos, and
  tags. Photos are ordered by `sortOrder`.
- Creating or updating a product accepts `images` and `tagIds`. Updating
  `images` replaces the product's image collection; `tagIds: []` clears its
  tags.
- The existing `portionSize` entity property remains in the model.

### Product API

| Method and route | Access | Purpose |
| --- | --- | --- |
| `GET /products/storefront` | Public | List available, non-archived products; supports existing pagination and filters. |
| `GET /products/storefront/:id` | Public | Fetch product details, including category, photos, and tags. Archived or unavailable products return not found. |
| `GET /products` | `products:read` | List products for administration, with photos and tags. |
| `GET /products/:id` | `products:read` | Fetch one product for administration. |
| `POST /products` | `products:create` | Create a product with optional `images` and `tagIds`. |
| `PATCH /products/:id` | `products:update` | Update product fields, photos, and tags. |
| `DELETE /products/:id` | `products:delete` | Archive a product. |
| `PATCH /products/:id/toggle-availability` | `products:update` | Toggle product availability. |
| `PATCH /products/:id/restore` | `products:update` | Restore an archived product. |

Example product additions:

```json
{
  "images": [
    {
      "url": "https://example.com/cake-front.jpg",
      "altText": "Chocolate cake viewed from the front",
      "sortOrder": 0
    }
  ],
  "tagIds": ["123e4567-e89b-12d3-a456-426614174000"]
}
```

### Tags API

| Method and route | Access | Purpose |
| --- | --- | --- |
| `GET /tags` | Public | List tags for storefront and admin selection. |
| `POST /tags` | `products:create` | Create a tag with a name and optional valid 3- or 6-digit hex color. |
| `DELETE /tags/:id` | `products:delete` | Delete a tag. The database relation cascades removal of its product-tag links. |

### Image upload API

- `POST /upload/images` accepts multipart form data using the `files` field and
  returns an `imageUrls` array.
- Up to 10 files are accepted. Each file is limited to 5 MB and must be PNG,
  JPEG/JPG, or WebP.
- `POST /upload/image` remains available for a single `file`.
- Uploading requires `products:create`; files are stored in Cloudinary's
  `torino-dessert` folder.

### Database migration and deployment caution

Migration `1791383812121-EnhanceProductCatalog` adds `product_images`, `tags`,
and `product_tags`, with foreign keys and indexes. It also changes the product
image/portion-size columns.

**Review this migration's data effect before applying it to a database with
existing products.** It renames `image_url` to `portion_size`, then drops and
recreates `portion_size`. This removes the prior image URL values and does not
preserve them as rows in `product_images`. Back up or migrate existing image
URLs before running it if they need to be retained.

## Frontend

### Storefront catalog and product detail

- Product API types and helpers represent product images and tags, choose the
  first product image for card thumbnails, load a single public product, list
  tags, and upload multiple photos.
- Catalog cards link the product image and name to `/products/{id}`. They show
  up to two tags with each tag's configured color. The tag marker is a simple
  colored dot rather than a decorative sparkle icon.
- `/products/[id]` fetches the public details endpoint and provides:
  - A product photo gallery with previous/next controls and selectable
    thumbnails.
  - Category, name, price, description, and tags.
  - Quantity selection and add-to-bag behavior.
  - Loading, unavailable/not-found, and retryable request-error states.
- `portionSize` is displayed if returned by the API. The current backend
  `CreateProductDto` does **not** declare `portionSize`, so it cannot currently
  be created or updated through the product write endpoints; the admin form
  therefore does not submit that field.

### Product administration

- The admin product form supports manually entered image URLs, multiple image
  uploads, optional alt text, reordering, and removal.
- The interface enforces a maximum of 10 photos and rejects selected files
  larger than 5 MB before upload. Upload controls are gated by
  `products:create`.
- Administrators can associate existing tags with products, create tags with
  a name and color, and delete tags. Create/delete controls follow the backend
  `products:create` and `products:delete` permissions.
- Admin product rows use the first new-format photo, with a fallback to
  `imageUrl` for older response data.
- Product and tag changes invalidate the appropriate React Query cache entries
  so the admin and storefront reflect the updated catalog.

### Storefront navigation and cart

- The storefront navbar is fixed to the top of the viewport and has a
  compensating spacer beneath it so page content is not covered.
- Checkout's order summary includes a remove button for each product. Removing
  an item updates the persisted cart and recalculates the subtotal and total.

## Frontend validation

The product schema validates image URLs, non-negative integer image order,
maximum 10 images, tag UUIDs, and the existing product fields. The tag schema
validates a non-empty name and a 3- or 6-digit hex color.

## Verification performed

- Frontend TypeScript check: `npm run typecheck`
- Frontend lint: `npm run lint`
- Production build: `npm run build`

Typecheck and lint passed after the latest navbar and checkout-cart changes.
The production build passed after the product catalog work; it was not rerun
after the final navbar/cart presentation changes.
