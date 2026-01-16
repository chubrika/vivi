# SEO Implementation Guide

This document outlines the SEO implementation for vivi.ge.

## Overview

The SEO implementation includes:
- Comprehensive metadata (title, description, Open Graph, Twitter Cards)
- Structured data (JSON-LD) for products, organization, website, and breadcrumbs
- Dynamic sitemap generation
- Robots.txt configuration
- Proper language and locale settings

## Environment Variables

Add these to your `.env.local` file:

```env
NEXT_PUBLIC_SITE_URL=https://www.vivi.ge
NEXT_PUBLIC_API_URL=https://api.vivi.ge
NEXT_PUBLIC_GOOGLE_VERIFICATION=your_google_verification_code
NEXT_PUBLIC_YANDEX_VERIFICATION=your_yandex_verification_code
```

## Features

### 1. Root Layout Metadata
- Comprehensive SEO metadata in `app/layout.tsx`
- Organization and Website structured data
- Proper language attribute (ka for Georgian)

### 2. Product Pages
- Dynamic metadata generation based on product data
- Product structured data (Schema.org Product)
- Breadcrumb structured data
- Open Graph images from product images

### 3. Shop Pages
- Dynamic metadata for individual shop pages
- Breadcrumb navigation structured data

### 4. Sitemap
- Automatically generated at `/sitemap.xml`
- Includes all active products and categories
- Updates daily

### 5. Robots.txt
- Configured at `/robots.txt`
- Blocks admin, auth, and private pages
- Points to sitemap

## Testing

1. **Google Search Console**: Submit your sitemap
2. **Rich Results Test**: Test structured data at https://search.google.com/test/rich-results
3. **Facebook Sharing Debugger**: Test Open Graph tags at https://developers.facebook.com/tools/debug/
4. **Twitter Card Validator**: Test Twitter cards at https://cards-dev.twitter.com/validator

## Best Practices

1. **Images**: Ensure all product images are properly optimized and accessible
2. **Descriptions**: Keep meta descriptions between 150-160 characters
3. **Titles**: Keep titles under 60 characters for optimal display
4. **Structured Data**: Regularly validate structured data for errors
5. **Sitemap**: Monitor sitemap for errors in Google Search Console

## Next Steps

1. Add Google Analytics and Google Tag Manager
2. Implement canonical URLs for paginated content
3. Add hreflang tags for multi-language support (if needed)
4. Implement lazy loading for images
5. Add alt text to all images
6. Monitor Core Web Vitals

