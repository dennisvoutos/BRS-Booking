# BRS Brokers - Vessel Booking Management System

A modern, accessible React application for managing vessel bookings with Greek date formatting (DD/MM/YYYY). Built as a technical assessment for BRS Brokers.

## 🚀 Live Demo

**Visit the live application:** [https://dennisvoutos.github.io/BRS-Booking/](https://dennisvoutos.github.io/BRS-Booking/)

The application is deployed on GitHub Pages and fully functional online.

## ✨ Features

- **Welcome Experience**: Interactive onboarding modal showcasing key features (shows once per session)
- **Search & Filter**: Search bookings by customer name, filter by status and date range
- **Greek Date Format**: DD/MM/YYYY date display and input with custom calendar picker
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Accessibility First**: Full keyboard navigation, screen reader support, WCAG compliant
- **State Management**: Loading, empty, and error states with graceful error handling
- **Form Validation**: Comprehensive client-side validation with real-time feedback
- **Mock API**: Simulated network calls with realistic delays and error scenarios
- **Comprehensive Testing**: 154 comprehensive unit and integration tests

## 🛠 Technology Stack

- **React 19.2.0** - Modern React with hooks
- **JavaScript (ES6+)** - No TypeScript for this implementation
- **CSS3** - Custom styling with modern CSS features
- **React Testing Library** - Comprehensive test coverage
- **Local Storage** - Persistent data storage for new bookings

## 📋 Project Structure

```
src/
├── components/             # React components (CSS Modules)
│   ├── BookingsPage/          # Main bookings management
│   ├── BookingDetailModal/    # Booking details modal
│   ├── CreateBookingForm/     # Create/edit booking form
│   ├── WelcomeModal/          # Onboarding welcome experience
│   ├── GreekDateInput/        # Custom Greek date picker
│   ├── SearchAndFilters/      # Search and filter controls
│   ├── LoadingSkeleton/       # Loading state components
│   ├── ThemeToggle/          # Light/dark mode toggle
│   └── ToastNotification/     # Toast notification system
├── contexts/              # React Context providers
│   ├── ThemeContext.js       # Theme management
│   └── ToastContext.js       # Toast notifications
├── hooks/                # Custom React hooks
│   ├── useBookings.js        # Bookings data management
│   ├── useKeyboardNavigation.js  # Accessibility navigation
│   └── useSessionStorage.js  # Session storage management
├── services/             # API services
│   └── bookingService.js     # Mock API with network simulation
├── data/                # Static data and constants
│   └── mockBookings.js       # Sample booking data
├── utils/               # Utility functions
│   ├── bookingUtils.js       # Booking utilities & validation
│   ├── accessibility.js      # Accessibility helpers
│   └── themeUtils.js         # Theme management utilities
├── __tests__/           # Test suites
│   └── *.test.js            # Component and hook tests
└── App.js               # Main application component
```

## 🚀 Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/dennisvoutos/BRS-Booking.git
   cd BRS-Booking
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Available Scripts

- `npm start` - Runs the development server
- `npm test` - Runs the test suite
- `npm run build` - Creates a production build
- `npm run eject` - Ejects from Create React App (not recommended)

## 🧪 Testing

The application includes **154 comprehensive tests** covering:
- Search and filter functionality
- Form validation and user interactions
- Loading, error, and empty states
- Welcome modal and onboarding experience
- Accessibility features and keyboard navigation
- Session storage management
- Component rendering in light/dark themes

Run tests with:
```bash
npm test
```

### Test Coverage
- **9 test suites** covering all major components
- **154 individual tests** ensuring reliable functionality
- **Unit tests** for hooks, utilities, and components
- **Integration tests** for user workflows
- **Accessibility tests** for WCAG compliance

## 🚢 Deployment

**Current Deployment:** The application is currently deployed on GitHub Pages at [https://dennisvoutos.github.io/BRS-Booking/](https://dennisvoutos.github.io/BRS-Booking/)

### Alternative Deployment Options

The repository includes configuration files for additional deployment platforms (currently not in use):

#### Vercel Configuration (`vercel.json`)
- **Purpose**: Configures deployment to Vercel platform
- **Features**: 
  - Sets project name and build configuration
  - Enables SPA routing by redirecting all routes to `/index.html`
  - Uses `@vercel/static-build` for React apps
- **Usage**: Connect your GitHub repo to Vercel for zero-config deployment

#### Netlify Configuration (`netlify.toml`)
- **Purpose**: Configures deployment to Netlify platform
- **Features**:
  - Specifies build command (`npm run build`) and output directory (`build`)
  - Handles client-side routing with proper redirects
  - Sets Node.js version for consistent builds
- **Usage**: Connect your GitHub repo to Netlify for automatic deployments

### Manual Deployment
```bash
npm run build
# Upload the 'build' folder to your web server
```

**Note:** While `vercel.json` and `netlify.toml` are included for flexibility, the current deployment uses GitHub Pages via the `gh-pages` branch.

## 🎯 Key Implementation Decisions

### Architecture Decisions
- **React 18+ with Hooks**: Modern functional components with useState, useEffect, useMemo for optimal performance
- **Custom Hooks Pattern**: Created `useBookings` for centralized state management and `useKeyboardNavigation` for accessibility
- **Component Composition**: Modular architecture with single responsibility components (BookingsPage, CreateBookingForm, etc.)
- **Context API**: Used for cross-cutting concerns (Theme, Toast notifications) to avoid prop drilling
- **CSS Modules**: Scoped styling to prevent conflicts while maintaining maintainability
- **Mock Service Layer**: Implemented realistic API simulation with `bookingService.js` for network delays and error scenarios

### UX/UI Decisions
- **Modal vs Drawer**: Chose modals for booking details and forms to maintain focus and provide clear task boundaries
- **Dual View Modes**: Implemented both table and card views to accommodate different user preferences and screen sizes
- **Greek Date Format (DD/MM/YYYY)**: Custom `GreekDateInput` component with calendar picker for localized user experience
- **Status Color System**: Consistent color coding (green=confirmed, amber=pending, red=cancelled) with proper contrast ratios
- **Responsive Strategy**: Mobile-first design with horizontal scroll for table data integrity
- **Loading States**: Multiple skeleton variants for different UI contexts to provide immediate feedback

### Accessibility Decisions
- **Keyboard Navigation**: Comprehensive tab order, arrow key navigation, and escape key handling throughout
- **Focus Management**: Automatic focus trapping in modals with return focus to triggering elements
- **Screen Reader Support**: Extensive ARIA labels, live regions for dynamic content, and descriptive text
- **Skip Links**: Quick navigation for keyboard users to main content areas
- **Color Independence**: All information conveyed through color also available via text/icons

### Performance Decisions
- **Debounced Search (300ms)**: Prevents excessive API calls and re-renders during rapid typing
- **Memoized Calculations**: Used `useMemo` for expensive filter operations and sorted data
- **Efficient Re-renders**: Strategic use of `useCallback` to prevent unnecessary child component updates
- **Local Storage Caching**: Persist user-created bookings across sessions for better UX

## 🔧 Configuration

### Environment Variables
The application uses local storage and mock data, so no environment variables are required for basic functionality.

### Customization
- **Booking Statuses**: Modify `BOOKING_STATUSES` in `src/data/mockBookings.js`
- **API Delay**: Adjust delay in `src/services/bookingService.js`
- **Color Theme**: Update CSS custom properties in component stylesheets

## 🚀 What I'd Improve With More Time

Based on the assignment requirements, here's what I would enhance given additional development time:

### Technical Enhancements
- **TypeScript Integration**: Add comprehensive type safety for better development experience and runtime error prevention
- **Advanced State Management**: Implement Zustand or Redux Toolkit for more complex application state scenarios
- **Real Backend Integration**: Replace mock service with REST/GraphQL API integration including authentication
- **Data Caching Strategy**: Implement React Query or SWR for sophisticated caching, background updates, and optimistic updates
- **Performance Optimization**: Add React.memo strategically, implement virtualization for large datasets, code splitting with React.lazy
- **Testing Enhancement**: Add E2E tests with Playwright/Cypress, visual regression testing, and performance testing
- **Error Boundaries**: Implement comprehensive error boundary strategy with error reporting service integration

### Advanced Features
- **Multi-tenant Support**: Add organization/workspace management for different shipping companies
- **Advanced Filtering**: Date range presets (This Week, Next Month), multi-select status filters, saved filter combinations
- **Bulk Operations**: Select multiple bookings for batch status updates, bulk export, mass delete with confirmation
- **Calendar Integration**: Alternative calendar view with drag-and-drop rescheduling, conflict detection, timeline view
- **Real-time Collaboration**: WebSocket integration for live updates when multiple users edit same bookings
- **Export Capabilities**: PDF reports with company branding, Excel export with formatting, CSV for data analysis
- **Audit Trail**: Track all booking changes with user attribution and timestamps for compliance

### UX/UI Improvements
- **Progressive Web App**: Add service worker for offline support, app installation, push notifications
- **Advanced Search**: Full-text search across all fields, search history, search suggestions, saved searches
- **Data Visualization**: Dashboard with booking statistics, charts for trends, capacity utilization graphs
- **Accessibility Plus**: Voice navigation support, high contrast themes, text-to-speech for booking details
- **Internationalization**: Multi-language support beyond Greek dates, RTL language support, currency localization
- **Mobile Enhancements**: Native mobile app feel, swipe gestures, mobile-specific interactions
- **Customizable Interface**: User preferences for default views, column visibility, personal themes

### DevOps & Monitoring
- **CI/CD Pipeline**: Automated testing, deployment pipelines, preview environments for pull requests
- **Monitoring**: Application performance monitoring, user analytics, error tracking with Sentry
- **Security**: Implement CSP headers, security headers, dependency vulnerability scanning
- **Documentation**: Storybook for component documentation, API documentation, deployment guides

## 📖 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🤝 Contributing

This is a technical assessment project, but feedback is welcome:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## 📄 License

This project is created for educational/assessment purposes.

## 👨‍💻 Author

**Dionysis Voutoufianakis**
- Technical Assessment for BRS Brokers
- Completed: November 2025

---

*Built with ❤️ and attention to accessibility, performance, and user experience.*
