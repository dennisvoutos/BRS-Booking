# BRS Brokers - Vessel Booking Management System

A modern, accessible React application for managing vessel bookings. Built as a technical assessment for BRS Brokers.

## 🚀 Live Demo

[Deploy URL will be added here]

## ✨ Features

- **Search & Filter**: Search bookings by customer name, filter by status and date range
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Accessibility First**: Full keyboard navigation, screen reader support, WCAG compliant
- **State Management**: Loading, empty, and error states with graceful error handling
- **Form Validation**: Client-side validation with real-time feedback
- **Mock API**: Simulated network calls with realistic delays and error scenarios
- **Comprehensive Testing**: Unit tests for critical functionality

## 🛠 Technology Stack

- **React 19.2.0** - Modern React with hooks
- **JavaScript (ES6+)** - No TypeScript for this implementation
- **CSS3** - Custom styling with modern CSS features
- **React Testing Library** - Comprehensive test coverage
- **Local Storage** - Persistent data storage for new bookings

## 📋 Project Structure

```
src/
├── components/          # React components
│   ├── BookingsPage.js     # Main bookings management page
│   ├── BookingDetailModal.js  # Booking details modal
│   ├── CreateBookingForm.js   # Create new booking form
│   └── *.css              # Component-specific styles
├── hooks/              # Custom React hooks
│   └── useBookings.js     # Bookings data management
├── services/           # API services
│   └── bookingService.js  # Mock API with network simulation
├── data/               # Static data and constants
│   └── mockBookings.js    # Sample booking data
├── utils/              # Utility functions
│   ├── bookingUtils.js    # Booking-related utilities
│   └── accessibility.js   # Accessibility helpers
└── App.js              # Main application component
```

## 🚀 Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone [repository-url]
   cd bookings-page
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

The application includes comprehensive tests for:
- Search and filter functionality
- Form validation
- Loading and error states
- User interactions
- Accessibility features

Run tests with:
```bash
npm test
```

## 🚢 Deployment

The application is configured for deployment on multiple platforms:

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Vercel will automatically detect it's a React app
3. Deploy with zero configuration

### Netlify
1. Connect your GitHub repository to Netlify
2. Build command: `npm run build`
3. Publish directory: `build`

### Manual Deployment
```bash
npm run build
# Upload the 'build' folder to your web server
```

## 🎯 Key Implementation Decisions

### Architecture Decisions
- **Component-based Architecture**: Modular, reusable components
- **Custom Hooks**: Centralized state management with `useBookings`
- **Mock API Layer**: Realistic network simulation for demonstration
- **Local Storage**: Persistent storage for created bookings

### UX/UI Decisions
- **Modal vs Drawer**: Used modals for better focus management
- **Inline Editing**: Chose separate forms for better validation UX
- **Status Colors**: Intuitive color coding (green=confirmed, amber=pending, red=cancelled)
- **Responsive Tables**: Horizontal scroll on mobile for data integrity

### Accessibility Decisions
- **Focus Management**: Automatic focus trapping in modals
- **Keyboard Navigation**: Full keyboard support throughout
- **Screen Reader Support**: Comprehensive ARIA labels and live regions
- **Color Contrast**: WCAG AA compliant color schemes

### Performance Decisions
- **Debounced Search**: Efficient filtering without excessive re-renders
- **Memoized Filters**: Optimized filter calculations
- **Lazy Loading**: Components load only when needed

## 🔧 Configuration

### Environment Variables
The application uses local storage and mock data, so no environment variables are required for basic functionality.

### Customization
- **Booking Statuses**: Modify `BOOKING_STATUSES` in `src/data/mockBookings.js`
- **API Delay**: Adjust delay in `src/services/bookingService.js`
- **Color Theme**: Update CSS custom properties in component stylesheets

## 🚀 Future Improvements

Given more time, I would implement:

### Technical Enhancements
- **TypeScript**: Add type safety and better development experience
- **State Management**: Redux Toolkit or Zustand for complex state
- **API Integration**: Replace mock service with real backend
- **Caching**: Implement React Query for data caching
- **Code Splitting**: Lazy load components for better performance

### Feature Enhancements
- **Advanced Filters**: Date range presets, multiple status selection
- **Bulk Operations**: Select and modify multiple bookings
- **Export Functionality**: PDF/Excel export of booking data
- **Real-time Updates**: WebSocket integration for live updates
- **User Management**: Authentication and user roles

### UX Improvements
- **Drag & Drop**: Reorder bookings or reschedule dates
- **Calendar View**: Alternative view showing bookings on calendar
- **Advanced Search**: Search by vessel, date, or booking ID
- **Notifications**: Toast notifications for user feedback
- **Offline Support**: Service worker for offline functionality

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
