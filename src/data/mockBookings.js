// Sample booking data as provided in the assessment
export const mockBookings = [
  {
    id: "BK-1001",
    customer: "Acme Wind",
    vessel: "Nordic Star",
    status: "confirmed",
    startDate: "2026-01-10",
    endDate: "2026-01-22",
  },
  {
    id: "BK-1002",
    customer: "BlueWave",
    vessel: "Sea Finch",
    status: "pending",
    startDate: "2026-02-03",
    endDate: "2026-02-05",
  },
  {
    id: "BK-1003",
    customer: "Oceanix",
    vessel: "Asteria",
    status: "cancelled",
    startDate: "2026-01-28",
    endDate: "2026-01-31",
  },
  // Adding a few more bookings for better testing
  {
    id: "BK-1004",
    customer: "Maritime Solutions",
    vessel: "Ocean Pioneer",
    status: "confirmed",
    startDate: "2026-02-15",
    endDate: "2026-02-20",
  },
  {
    id: "BK-1005",
    customer: "Deep Sea Logistics",
    vessel: "Blue Horizon",
    status: "pending",
    startDate: "2026-03-01",
    endDate: "2026-03-10",
  },
  {
    id: "BK-1006",
    customer: "Coastal Transport",
    vessel: "Wave Rider",
    status: "cancelled",
    startDate: "2026-02-25",
    endDate: "2026-02-28",
  },
];

// Booking status options for creating new bookings (excluding cancelled)
export const BOOKING_STATUSES = [
  { value: "confirmed", label: "Confirmed" },
  { value: "pending", label: "Pending" },
];

// All possible booking statuses (for display/filtering)
export const ALL_BOOKING_STATUSES = [
  { value: "confirmed", label: "Confirmed" },
  { value: "pending", label: "Pending" },
  { value: "cancelled", label: "Cancelled" },
];
