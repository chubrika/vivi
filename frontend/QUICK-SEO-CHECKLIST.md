# Quick SEO Checklist for Google Indexing

## ✅ Immediate Actions (Do Today)

- [ ] **Set up Google Search Console**
  - Go to https://search.google.com/search-console
  - Add property: `https://www.vivi.ge`
  - Verify ownership

- [ ] **Submit Sitemap**
  - In Search Console → Sitemaps
  - Submit: `https://www.vivi.ge/sitemap.xml`

- [ ] **Request Indexing for Key Pages**
  - Homepage: `https://www.vivi.ge`
  - Products page: `https://www.vivi.ge/products`
  - 3-5 important product pages

- [ ] **Add Google Verification Code**
  - Get code from Search Console
  - Add to `.env.local`: `NEXT_PUBLIC_GOOGLE_VERIFICATION=your_code`
  - Redeploy site

## ✅ Technical Checks (Verify)

- [ ] **Test Sitemap**
  - Visit: `https://www.vivi.ge/sitemap.xml`
  - Should show all products
  - Should be valid XML

- [ ] **Test Robots.txt**
  - Visit: `https://www.vivi.ge/robots.txt`
  - Should allow Google
  - Should reference sitemap

- [ ] **Test Structured Data**
  - Visit: https://search.google.com/test/rich-results
  - Test a product URL
  - Should show no errors

- [ ] **Test Mobile-Friendly**
  - Visit: https://search.google.com/test/mobile-friendly
  - Should pass

- [ ] **View Page Source**
  - Right-click → View Page Source on a product page
  - Should see product name, description, price in HTML
  - Should NOT be empty or just loading spinner

## ✅ Content Checks

- [ ] **Product Descriptions**
  - Each product has unique description
  - Descriptions are at least 100 characters
  - Include relevant keywords naturally

- [ ] **Product Images**
  - All products have images
  - Images have proper alt text
  - Images are optimized (not too large)

- [ ] **Product Names**
  - Clear, descriptive names
  - Include brand/model if applicable
  - Not too long (under 60 characters ideal)

## ⏳ Wait & Monitor (1-2 Weeks)

- [ ] **Check Indexing Status**
  - Google Search Console → Coverage
  - Should see pages being indexed
  - Fix any errors shown

- [ ] **Monitor Search Performance**
  - Google Search Console → Performance
  - Track impressions and clicks
  - See which queries show your site

- [ ] **Test Google Search**
  - Search: `site:vivi.ge`
  - Should show indexed pages
  - If nothing, site not indexed yet (wait longer)

## 🚀 Advanced (Optional)

- [ ] **Google Merchant Center**
  - For Google Shopping results
  - Set up product feed
  - Link to Search Console

- [ ] **Google Analytics**
  - Track user behavior
  - See which products are popular
  - Optimize based on data

- [ ] **Build Backlinks**
  - List in Georgian directories
  - Partner with other sites
  - Get featured in articles

## Common Issues

### "No results found for site:vivi.ge"
**Cause**: Site not indexed yet  
**Solution**: Wait 1-2 weeks after submitting sitemap, then check again

### "Page not indexed" in Search Console
**Cause**: Various (robots.txt, duplicate content, etc.)  
**Solution**: Check Coverage report for specific errors

### "Structured data errors"
**Cause**: Missing required fields or invalid format  
**Solution**: Test in Rich Results Test, fix errors

### Products show but not in search results
**Cause**: Low ranking (new site, no authority)  
**Solution**: Build backlinks, create quality content, be patient

## Expected Timeline

- **Day 1**: Submit sitemap, request indexing
- **Week 1**: Google starts crawling
- **Week 2-4**: First pages appear in search
- **Month 2-3**: More pages indexed, better rankings
- **Month 3+**: Full indexing, improved rankings

## Need Help?

1. Check Google Search Console for specific errors
2. Test structured data for issues
3. Verify site is accessible (not behind login)
4. Ensure robots.txt allows crawling
5. Check if site is actually live and accessible

---

**Remember**: SEO takes time. Be patient and consistent! 🚀

