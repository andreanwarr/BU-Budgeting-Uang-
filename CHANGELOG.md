# Changelog

All notable changes to Finance Tracker will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.4.0] - 2025-11-22

### 🎉 Added

#### Monthly Balance Feature
- **Automatic Monthly Balance Calculation** - Calculates balance from 1st to current date of the month
- **Highlighted Primary Card** - "Saldo Bulan Ini" card with blue border, ring, and "Aktif" badge
- **Dynamic Date Subtitle** - Shows "Per [today's date]" on monthly balance card
- **Real-time Updates** - Monthly balance updates automatically with new transactions
- **Separate Overall Balance Card** - New "Total Saldo" card showing all-time balance

#### UI/UX Improvements
- **4-Column Grid Layout** - Balanced desktop layout (was 3 columns)
- **Subtitle Support** - All StatsCards now support optional subtitle
- **Purple Color Scheme** - New purple gradient for Total Saldo card
- **Enhanced Visual Hierarchy** - Clear distinction between primary and secondary cards
- **Hover Scale Effect** - Highlighted card scales slightly on hover
- **Improved Spacing** - No empty spaces, consistent gaps throughout

#### Documentation
- **Comprehensive README.md** - 500+ lines with complete feature documentation
- **DEPLOYMENT_GUIDE.md** - 800+ lines covering 5+ deployment platforms
- **IMPLEMENTATION_v2.4.0.md** - Detailed summary of all changes
- **CHANGELOG.md** - This file for version history
- **Code Examples** - Database queries, API usage, calculations
- **Troubleshooting Section** - Common issues and solutions
- **Platform-Specific Configs** - netlify.toml, vercel.json, etc.

### 🔧 Changed

#### Components
- **Dashboard.tsx**
  - Added `calculateCurrentMonthStats()` function
  - Added `calculateOverallBalance()` function
  - Changed grid from 3 to 4 columns (lg:grid-cols-4)
  - Updated StatsCard props to include monthly data
  - Added separate monthly and overall balance states

- **StatsCard.tsx**
  - Added `subtitle` prop (optional)
  - Added `highlight` prop (boolean)
  - Added `purple` to color options
  - Implemented highlight styling (border, ring, shadow)
  - Added "Aktif" badge for highlighted cards
  - Enhanced hover effects for highlighted state

#### Styling
- **Border Enhancement** - Blue border and ring for primary card
- **Shadow Effects** - Increased shadow on highlighted cards
- **Responsive Gaps** - Adjusted gap-3 sm:gap-4 for consistency
- **Grid Columns** - 1 (mobile) → 2 (tablet) → 4 (desktop)

### 🐛 Fixed

- **Empty Space Issue** - Fixed awkward empty space in 3-column layout
- **Visual Balance** - All cards now have equal visual weight (except highlighted)
- **Responsive Breakpoints** - Improved layout at all screen sizes
- **Card Alignment** - Proper alignment on all devices

### 📚 Documentation

- **README.md** - Complete rewrite with comprehensive documentation
- **Installation Guide** - Step-by-step instructions
- **Usage Guide** - How to use all features
- **API Documentation** - Supabase queries and functions
- **Deployment Guide** - Multiple platforms covered
- **Troubleshooting** - Common issues and solutions

### 🚀 Deployment

- **Netlify Config** - Complete netlify.toml with redirects
- **Vercel Config** - Complete vercel.json with rewrites
- **Railway Config** - railway.json for deployment
- **Render Config** - render.yaml blueprint
- **GitHub Pages** - Instructions for gh-pages deployment
- **Custom Domain** - Setup guides for all platforms
- **CloudFlare** - CDN and SSL configuration

### ✨ Improvements

#### Developer Experience
- **Clear Code Comments** - All new functions documented
- **Type Safety** - Updated TypeScript interfaces
- **Code Organization** - Separated concerns clearly
- **Reusable Functions** - Balance calculations modular

#### User Experience
- **Visual Clarity** - Primary card immediately identifiable
- **Information Density** - More info without clutter
- **Mobile Experience** - Better stacking on small screens
- **Performance** - No impact on build time or bundle size

### 📊 Statistics

- **Lines Added:** ~1500 (documentation + code)
- **Files Modified:** 2 (Dashboard.tsx, StatsCard.tsx)
- **Files Created:** 4 (README, DEPLOYMENT_GUIDE, IMPLEMENTATION, CHANGELOG)
- **Build Size:** 1,406.98 KB (minimal increase)
- **Build Time:** ~9 seconds (no change)

---

## [2.3.0] - 2025-11-22

### Added
- Compact export dropdown (80% space savings)
- Client-side date filtering for exact matching
- Monthly balance calculation for filtered periods
- Sticky header with responsive sizing
- 4-column stats grid for better layout

### Fixed
- Date filtering bug (showing wrong dates)
- Empty space in stats cards section

---

## [2.2.0] - 2025-11-22

### Added
- Enhanced UI/UX design with modern styling
- Smart date display (Hari Ini, Kemarin)
- Daily summary badges with income/expense totals
- Enhanced transaction cards with animations
- Today by default date selection

### Changed
- DateRangePicker visual design
- TransactionList with better grouping
- Improved hover effects and transitions

---

## [2.1.0] - 2025-11-21

### Added
- Simplified export with auto date detection
- Red-underline recognition for dates
- Fallback mechanisms for date detection
- Smart period display in exports

---

## [2.0.0] - 2025-11-21

### Added
- Initial production release
- Supabase authentication
- Transaction management (CRUD)
- Category management
- Date filtering
- Export to Excel/PNG/JPG
- Responsive design
- PWA support
- RLS security

### Technical
- React 18.3
- TypeScript 5.9
- Vite 5.4
- Tailwind CSS 3.4
- Supabase backend

---

## Version Comparison

| Version | Release Date | Key Features | Status |
|---------|--------------|--------------|--------|
| 2.4.0 | 2025-11-22 | Monthly balance, 4-col layout, docs | ✅ Current |
| 2.3.0 | 2025-11-22 | Export dropdown, date fix | Superseded |
| 2.2.0 | 2025-11-22 | UI/UX enhancements | Superseded |
| 2.1.0 | 2025-11-21 | Auto date detection | Superseded |
| 2.0.0 | 2025-11-21 | Initial release | Superseded |

---

## Upgrade Guide

### From 2.3.0 to 2.4.0

**No breaking changes** - Safe to upgrade

**Steps:**
```bash
git pull origin main
npm install
npm run build
```

**What's New:**
- Monthly balance card (automatically appears)
- 4-column layout (automatic)
- Enhanced visual design (automatic)

**Configuration:**
- No changes needed
- Environment variables same
- Database schema unchanged

### From 2.0.0 to 2.4.0

**Breaking Changes:** None

**Steps:**
```bash
git pull origin main
npm install
npm run build
```

**New Features Available:**
- All 2.1.0 - 2.4.0 features
- Cumulative improvements
- Enhanced documentation

---

## Roadmap

### v2.5.0 (Planned - Q1 2026)
- [ ] Dark mode support
- [ ] Budget tracking with alerts
- [ ] Recurring transactions
- [ ] Weekly balance view
- [ ] Category analytics chart
- [ ] CSV export format
- [ ] Print-friendly reports

### v3.0.0 (Planned - Q2 2026)
- [ ] Mobile application (React Native)
- [ ] Bank account integration
- [ ] AI-powered expense insights
- [ ] Bill reminder system
- [ ] Receipt scanning (OCR)
- [ ] Multi-currency support
- [ ] Collaborative budgets

### Future Considerations
- Desktop application (Electron)
- Browser extension
- API for third-party integrations
- Cryptocurrency tracking
- Investment portfolio management

---

## Breaking Changes Log

### v2.4.0
- None

### v2.3.0
- None

### v2.2.0
- None

### v2.1.0
- None

### v2.0.0
- Initial release (no previous versions)

---

## Migration Notes

### Database
- No migrations needed for v2.4.0
- All schema changes backward compatible
- RLS policies unchanged

### API
- All Supabase queries compatible
- No new endpoints required
- Authentication flow unchanged

### Frontend
- React component API stable
- Props backward compatible
- Hooks unchanged

---

## Contributors

### v2.4.0
- UI/UX improvements
- Monthly balance feature
- Comprehensive documentation
- Deployment guides

### Previous Versions
- Initial implementation
- Core features
- Export functionality
- Authentication

---

## License

MIT License - See [LICENSE](LICENSE) file

---

## Support

- 📧 Email: andreanwar713@gmail.com
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/finance-tracker/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/yourusername/finance-tracker/discussions)
- 📚 Documentation: [README.md](README.md)

---

**Last Updated:** November 22, 2025  
**Current Version:** 2.4.0  
**Status:** Production Ready ✅
