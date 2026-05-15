// Mock data for the GameUp11 Turf Owner Dashboard. 10 entries per module.

export const venues = [
  { id: "V01", name: "GameUp11 Whitefield Arena", city: "Bengaluru", address: "12, Outer Ring Rd, Whitefield", contact: "+91 98801 23456", open: "06:00", close: "23:00", amenities: ["Parking", "Washroom", "Floodlights", "Café"], status: "Active" },
  { id: "V02", name: "GameUp11 HSR Sports Hub", city: "Bengaluru", address: "27th Main, HSR Sector 2", contact: "+91 98801 23457", open: "06:00", close: "23:30", amenities: ["Parking", "Washroom", "Seating", "Water"], status: "Active" },
  { id: "V03", name: "GameUp11 Powai Grounds", city: "Mumbai", address: "Hiranandani, Powai", contact: "+91 98202 34567", open: "06:00", close: "23:00", amenities: ["Parking", "Washroom", "Floodlights"], status: "Active" },
  { id: "V04", name: "GameUp11 Andheri Box", city: "Mumbai", address: "JVLR, Andheri East", contact: "+91 98202 34568", open: "06:30", close: "23:00", amenities: ["Washroom", "Floodlights", "Café"], status: "Active" },
  { id: "V05", name: "GameUp11 Gachibowli Park", city: "Hyderabad", address: "Financial District, Gachibowli", contact: "+91 90000 11223", open: "06:00", close: "23:00", amenities: ["Parking", "Seating", "Water"], status: "Active" },
  { id: "V06", name: "GameUp11 Anna Nagar Court", city: "Chennai", address: "2nd Ave, Anna Nagar", contact: "+91 90000 11224", open: "06:00", close: "22:30", amenities: ["Washroom", "Floodlights"], status: "Active" },
  { id: "V07", name: "GameUp11 Salt Lake Arena", city: "Kolkata", address: "Sector V, Salt Lake", contact: "+91 90000 11225", open: "06:00", close: "23:00", amenities: ["Parking", "Café", "Water"], status: "Active" },
  { id: "V08", name: "GameUp11 Sector 29 Pitch", city: "Gurugram", address: "Sector 29, MG Road", contact: "+91 90000 11226", open: "06:00", close: "23:30", amenities: ["Parking", "Washroom", "Floodlights", "Café"], status: "Active" },
  { id: "V09", name: "GameUp11 Wakad Turf", city: "Pune", address: "Hinjewadi Phase 1, Wakad", contact: "+91 90000 11227", open: "06:00", close: "23:00", amenities: ["Parking", "Washroom"], status: "Inactive" },
  { id: "V10", name: "GameUp11 Kochi Marine", city: "Kochi", address: "Marine Drive, Ernakulam", contact: "+91 90000 11228", open: "06:00", close: "22:30", amenities: ["Seating", "Water", "Café"], status: "Active" },
];

export const turfs = [
  { id: "T01", name: "Turf A", venue: "V01", sport: "Football 5v5", surface: "Artificial Grass", capacity: 10, size: "30x20m", duration: 60, base: 1200, weekend: 1500, peak: 1800, status: "Active" },
  { id: "T02", name: "Turf B", venue: "V01", sport: "Football 7v7", surface: "Artificial Grass", capacity: 14, size: "40x25m", duration: 60, base: 1800, weekend: 2200, peak: 2600, status: "Active" },
  { id: "T03", name: "Box Cricket Pitch", venue: "V02", sport: "Box Cricket", surface: "Turf Mat", capacity: 12, size: "30x15m", duration: 60, base: 1500, weekend: 1800, peak: 2100, status: "Active" },
  { id: "T04", name: "Court 1", venue: "V02", sport: "Badminton", surface: "Synthetic", capacity: 4, size: "13x6m", duration: 60, base: 400, weekend: 500, peak: 600, status: "Active" },
  { id: "T05", name: "Powai Field A", venue: "V03", sport: "Football 5v5", surface: "Artificial Grass", capacity: 10, size: "30x20m", duration: 60, base: 1300, weekend: 1600, peak: 1900, status: "Active" },
  { id: "T06", name: "Powai Field B", venue: "V03", sport: "Football 7v7", surface: "Artificial Grass", capacity: 14, size: "40x25m", duration: 60, base: 2000, weekend: 2400, peak: 2800, status: "Maintenance" },
  { id: "T07", name: "Andheri Box A", venue: "V04", sport: "Box Cricket", surface: "Turf Mat", capacity: 12, size: "30x15m", duration: 60, base: 1700, weekend: 2000, peak: 2400, status: "Active" },
  { id: "T08", name: "Gachibowli Ground", venue: "V05", sport: "Football 7v7", surface: "Artificial Grass", capacity: 14, size: "40x25m", duration: 60, base: 1800, weekend: 2200, peak: 2600, status: "Active" },
  { id: "T09", name: "Chennai Court", venue: "V06", sport: "Tennis", surface: "Hard Court", capacity: 4, size: "24x11m", duration: 60, base: 600, weekend: 800, peak: 1000, status: "Active" },
  { id: "T10", name: "Salt Lake Field", venue: "V07", sport: "Football 5v5", surface: "Artificial Grass", capacity: 10, size: "30x20m", duration: 60, base: 1200, weekend: 1500, peak: 1800, status: "Active" },
];

export const sports = [
  { id: "S01", name: "Football 5v5", icon: "⚽", durations: [60, 90], base: 1200, weekend: 1500, peak: 1800, tax: 18, advance: 50 },
  { id: "S02", name: "Football 7v7", icon: "⚽", durations: [60, 90, 120], base: 1800, weekend: 2200, peak: 2600, tax: 18, advance: 50 },
  { id: "S03", name: "Box Cricket", icon: "🏏", durations: [60, 90, 120], base: 1500, weekend: 1800, peak: 2100, tax: 18, advance: 50 },
  { id: "S04", name: "Badminton", icon: "🏸", durations: [60], base: 400, weekend: 500, peak: 600, tax: 18, advance: 30 },
  { id: "S05", name: "Tennis", icon: "🎾", durations: [60], base: 600, weekend: 800, peak: 1000, tax: 18, advance: 30 },
  { id: "S06", name: "Basketball", icon: "🏀", durations: [60, 90], base: 800, weekend: 1000, peak: 1200, tax: 18, advance: 30 },
  { id: "S07", name: "Volleyball", icon: "🏐", durations: [60, 90], base: 700, weekend: 900, peak: 1100, tax: 18, advance: 30 },
  { id: "S08", name: "Pickleball", icon: "🏓", durations: [60], base: 500, weekend: 700, peak: 900, tax: 18, advance: 30 },
  { id: "S09", name: "Hockey", icon: "🏑", durations: [60, 90], base: 1400, weekend: 1700, peak: 2000, tax: 18, advance: 50 },
  { id: "S10", name: "Futsal", icon: "🥅", durations: [60], base: 1100, weekend: 1400, peak: 1700, tax: 18, advance: 50 },
];

export const customers = [
  { id: "C01", name: "Rohan Mehta", phone: "+91 98765 43210", email: "rohan@example.com", city: "Bengaluru", bookings: 24, hours: 36, spent: 32400, last: "2025-05-12", sport: "Football 5v5", venue: "V01", source: "App", vip: true },
  { id: "C02", name: "Priya Sharma", phone: "+91 98765 43211", email: "priya@example.com", city: "Bengaluru", bookings: 8, hours: 12, spent: 9600, last: "2025-05-10", sport: "Badminton", venue: "V02", source: "App", vip: false },
  { id: "C03", name: "Aakash Verma", phone: "+91 98765 43212", email: "aakash@example.com", city: "Mumbai", bookings: 16, hours: 24, spent: 28800, last: "2025-05-14", sport: "Box Cricket", venue: "V04", source: "Walk-in", vip: true },
  { id: "C04", name: "Sneha Iyer", phone: "+91 98765 43213", email: "sneha@example.com", city: "Mumbai", bookings: 6, hours: 9, spent: 7200, last: "2025-05-09", sport: "Football 5v5", venue: "V03", source: "App", vip: false },
  { id: "C05", name: "Vikram Rao", phone: "+91 98765 43214", email: "vikram@example.com", city: "Hyderabad", bookings: 18, hours: 27, spent: 32400, last: "2025-05-13", sport: "Football 7v7", venue: "V05", source: "App", vip: true },
  { id: "C06", name: "Neha Kapoor", phone: "+91 98765 43215", email: "neha@example.com", city: "Chennai", bookings: 5, hours: 7.5, spent: 4500, last: "2025-05-08", sport: "Tennis", venue: "V06", source: "Referral", vip: false },
  { id: "C07", name: "Kunal Shah", phone: "+91 98765 43216", email: "kunal@example.com", city: "Kolkata", bookings: 11, hours: 16.5, spent: 13200, last: "2025-05-11", sport: "Football 5v5", venue: "V07", source: "App", vip: false },
  { id: "C08", name: "Anita Pillai", phone: "+91 98765 43217", email: "anita@example.com", city: "Gurugram", bookings: 9, hours: 13.5, spent: 16200, last: "2025-05-12", sport: "Football 5v5", venue: "V08", source: "Walk-in", vip: false },
  { id: "C09", name: "Sahil Khan", phone: "+91 98765 43218", email: "sahil@example.com", city: "Pune", bookings: 14, hours: 21, spent: 25200, last: "2025-05-14", sport: "Box Cricket", venue: "V09", source: "App", vip: true },
  { id: "C10", name: "Divya Nair", phone: "+91 98765 43219", email: "divya@example.com", city: "Kochi", bookings: 4, hours: 6, spent: 4800, last: "2025-05-07", sport: "Badminton", venue: "V10", source: "Phone", vip: false },
];

export type BookingStatus = "Confirmed" | "Pending" | "Cancelled" | "Completed" | "No-show";
export type PayStatus = "Paid" | "Partial" | "Unpaid";

export const bookings = [
  { id: "BK1001", customer: "C01", venue: "V01", turf: "T01", sport: "Football 5v5", date: "2025-05-15", start: "18:00", end: "19:00", source: "App",       status: "Confirmed" as BookingStatus, pay: "Paid"    as PayStatus, total: 1500, advance: 1500, balance: 0,    supervisor: "U01" },
  { id: "BK1002", customer: "C02", venue: "V02", turf: "T04", sport: "Badminton",     date: "2025-05-15", start: "07:00", end: "08:00", source: "App",       status: "Completed" as BookingStatus, pay: "Paid"    as PayStatus, total: 500,  advance: 500,  balance: 0,    supervisor: "U02" },
  { id: "BK1003", customer: "C03", venue: "V04", turf: "T07", sport: "Box Cricket",   date: "2025-05-15", start: "20:00", end: "22:00", source: "Walk-in",   status: "Confirmed" as BookingStatus, pay: "Partial" as PayStatus, total: 4000, advance: 2000, balance: 2000, supervisor: "U03" },
  { id: "BK1004", customer: "C04", venue: "V03", turf: "T05", sport: "Football 5v5", date: "2025-05-15", start: "19:00", end: "20:00", source: "App",       status: "Confirmed" as BookingStatus, pay: "Paid"    as PayStatus, total: 1600, advance: 1600, balance: 0,    supervisor: "U04" },
  { id: "BK1005", customer: "C05", venue: "V05", turf: "T08", sport: "Football 7v7", date: "2025-05-15", start: "21:00", end: "22:30", source: "App",       status: "Pending"   as BookingStatus, pay: "Unpaid"  as PayStatus, total: 3300, advance: 0,    balance: 3300, supervisor: "U05" },
  { id: "BK1006", customer: "C06", venue: "V06", turf: "T09", sport: "Tennis",       date: "2025-05-14", start: "06:00", end: "07:00", source: "App",       status: "Completed" as BookingStatus, pay: "Paid"    as PayStatus, total: 800,  advance: 800,  balance: 0,    supervisor: "U06" },
  { id: "BK1007", customer: "C07", venue: "V07", turf: "T10", sport: "Football 5v5", date: "2025-05-14", start: "18:30", end: "19:30", source: "Walk-in",   status: "Cancelled" as BookingStatus, pay: "Unpaid"  as PayStatus, total: 1500, advance: 0,    balance: 0,    supervisor: "U07" },
  { id: "BK1008", customer: "C08", venue: "V01", turf: "T02", sport: "Football 7v7", date: "2025-05-16", start: "19:00", end: "20:00", source: "App",       status: "Confirmed" as BookingStatus, pay: "Partial" as PayStatus, total: 2200, advance: 1100, balance: 1100, supervisor: "U01" },
  { id: "BK1009", customer: "C09", venue: "V02", turf: "T03", sport: "Box Cricket",  date: "2025-05-16", start: "20:00", end: "21:00", source: "App",       status: "Confirmed" as BookingStatus, pay: "Paid"    as PayStatus, total: 1800, advance: 1800, balance: 0,    supervisor: "U02" },
  { id: "BK1010", customer: "C10", venue: "V10", turf: "T10", sport: "Badminton",    date: "2025-05-13", start: "08:00", end: "09:00", source: "Phone",     status: "No-show"   as BookingStatus, pay: "Partial" as PayStatus, total: 500,  advance: 200,  balance: 300,  supervisor: "U07" },
];

export const tournaments = [
  { id: "TN01", name: "Corporate Cup 2025",       organizer: "Acme Corp",      contact: "Ravi Singh",   start: "2025-06-01", end: "2025-06-02", venue: "V01", turfs: ["T01","T02"], slots: 16, model: "Per Slot",  total: 48000, advance: 20000, due: 28000, teams: 12, status: "Upcoming"  },
  { id: "TN02", name: "Sunday Box League",        organizer: "BoxBuddies",     contact: "Aman Patel",   start: "2025-05-18", end: "2025-05-18", venue: "V02", turfs: ["T03"],       slots: 8,  model: "Per Slot",  total: 14400, advance: 7200,  due: 7200,  teams: 8,  status: "Upcoming"  },
  { id: "TN03", name: "Andheri Premier",          organizer: "JVLR Sports",    contact: "Manoj Kumar",  start: "2025-04-20", end: "2025-04-21", venue: "V04", turfs: ["T07"],       slots: 12, model: "Full Day",  total: 36000, advance: 18000, due: 0,     teams: 10, status: "Completed" },
  { id: "TN04", name: "HSR Knockout",             organizer: "HSR Footy",      contact: "Suresh K.",    start: "2025-05-25", end: "2025-05-25", venue: "V02", turfs: ["T03","T04"], slots: 10, model: "Package",   total: 25000, advance: 10000, due: 15000, teams: 6,  status: "Upcoming"  },
  { id: "TN05", name: "Powai Champions",          organizer: "Hiranandani Sp.",contact: "Nikhil Joshi", start: "2025-05-10", end: "2025-05-11", venue: "V03", turfs: ["T05","T06"], slots: 14, model: "Per Slot",  total: 42000, advance: 20000, due: 0,     teams: 8,  status: "Completed" },
  { id: "TN06", name: "Gachibowli Smash",         organizer: "Hyd Smashers",   contact: "Karthik R.",   start: "2025-06-08", end: "2025-06-09", venue: "V05", turfs: ["T08"],       slots: 12, model: "Per Slot",  total: 36000, advance: 12000, due: 24000, teams: 10, status: "Upcoming"  },
  { id: "TN07", name: "Anna Nagar Open",          organizer: "Chennai TC",     contact: "Lakshmi N.",   start: "2025-05-22", end: "2025-05-22", venue: "V06", turfs: ["T09"],       slots: 8,  model: "Full Day",  total: 16000, advance: 8000,  due: 8000,  teams: 8,  status: "Upcoming"  },
  { id: "TN08", name: "Salt Lake Cup",            organizer: "Kolkata FA",     contact: "Bidyut S.",    start: "2025-05-30", end: "2025-05-31", venue: "V07", turfs: ["T10"],       slots: 16, model: "Package",   total: 40000, advance: 16000, due: 24000, teams: 12, status: "Upcoming"  },
  { id: "TN09", name: "Sector 29 Showdown",       organizer: "Gurgaon Arena",  contact: "Arjun T.",     start: "2025-05-12", end: "2025-05-12", venue: "V08", turfs: ["T01"],       slots: 6,  model: "Per Slot",  total: 12000, advance: 6000,  due: 0,     teams: 6,  status: "Active"    },
  { id: "TN10", name: "Kochi Coastal Cup",        organizer: "Kochi Sports",   contact: "Renjith P.",   start: "2025-04-05", end: "2025-04-06", venue: "V10", turfs: ["T10"],       slots: 10, model: "Full Day",  total: 25000, advance: 12500, due: 0,     teams: 8,  status: "Cancelled" },
];

export const maintenance = [
  { id: "MT01", venue: "V01", turf: "T01", issue: "Net replacement",   priority: "Medium", start: "2025-05-16", end: "2025-05-17", status: "Open",        assignee: "U01", cost: 8000  },
  { id: "MT02", venue: "V03", turf: "T06", issue: "Floodlight repair", priority: "High",   start: "2025-05-14", end: "2025-05-18", status: "In Progress", assignee: "U04", cost: 15000 },
  { id: "MT03", venue: "V02", turf: "T03", issue: "Turf cleaning",     priority: "Low",    start: "2025-05-12", end: "2025-05-12", status: "Resolved",    assignee: "U02", cost: 2000  },
  { id: "MT04", venue: "V04", turf: "T07", issue: "Boundary net tear", priority: "Medium", start: "2025-05-15", end: "2025-05-16", status: "In Progress", assignee: "U03", cost: 5500  },
  { id: "MT05", venue: "V05", turf: "T08", issue: "Drainage check",    priority: "High",   start: "2025-05-10", end: "2025-05-13", status: "Resolved",    assignee: "U05", cost: 12000 },
  { id: "MT06", venue: "V06", turf: "T09", issue: "Court line repaint",priority: "Low",    start: "2025-05-20", end: "2025-05-20", status: "Open",        assignee: "U06", cost: 3500  },
  { id: "MT07", venue: "V07", turf: "T10", issue: "Goalpost weld",     priority: "Medium", start: "2025-05-18", end: "2025-05-19", status: "Open",        assignee: "U07", cost: 4500  },
  { id: "MT08", venue: "V08", turf: "T02", issue: "Floodlight bulb",   priority: "Low",    start: "2025-05-13", end: "2025-05-13", status: "Resolved",    assignee: "U01", cost: 1800  },
  { id: "MT09", venue: "V09", turf: "T05", issue: "Surface re-rolling",priority: "High",   start: "2025-05-21", end: "2025-05-23", status: "Open",        assignee: "U04", cost: 22000 },
  { id: "MT10", venue: "V10", turf: "T10", issue: "Café AC repair",    priority: "Medium", start: "2025-05-09", end: "2025-05-10", status: "Resolved",    assignee: "U07", cost: 6500  },
];

export const supervisors = [
  { id: "U01", name: "Manish Yadav",   phone: "+91 90000 22001", venue: "V01", turfs: ["T01","T02"], status: "Active",   permissions: ["Bookings","Slots","Payments"], joined: "2024-08-12" },
  { id: "U02", name: "Ramesh Naidu",   phone: "+91 90000 22002", venue: "V02", turfs: ["T03","T04"], status: "Active",   permissions: ["Bookings","Slots","Maintenance"], joined: "2024-09-01" },
  { id: "U03", name: "Saurabh Pawar",  phone: "+91 90000 22003", venue: "V04", turfs: ["T07"],       status: "Active",   permissions: ["Bookings","Payments"], joined: "2024-10-10" },
  { id: "U04", name: "Imran Sayyed",   phone: "+91 90000 22004", venue: "V03", turfs: ["T05","T06"], status: "Active",   permissions: ["Bookings","Slots","Maintenance","Payments"], joined: "2024-07-19" },
  { id: "U05", name: "Karthik Reddy",  phone: "+91 90000 22005", venue: "V05", turfs: ["T08"],       status: "Active",   permissions: ["Bookings","Slots"], joined: "2024-11-22" },
  { id: "U06", name: "Selvam Kumar",   phone: "+91 90000 22006", venue: "V06", turfs: ["T09"],       status: "Active",   permissions: ["Bookings"], joined: "2025-01-05" },
  { id: "U07", name: "Bidyut Halder",  phone: "+91 90000 22007", venue: "V07", turfs: ["T10"],       status: "Active",   permissions: ["Bookings","Slots","Payments"], joined: "2024-12-15" },
  { id: "U08", name: "Harish Bhat",    phone: "+91 90000 22008", venue: "V08", turfs: ["T02"],       status: "Inactive", permissions: ["Bookings"], joined: "2024-06-30" },
  { id: "U09", name: "Pravin Joshi",   phone: "+91 90000 22009", venue: "V09", turfs: ["T05"],       status: "Active",   permissions: ["Bookings","Maintenance"], joined: "2025-02-11" },
  { id: "U10", name: "Renjith Prasad", phone: "+91 90000 22010", venue: "V10", turfs: ["T10"],       status: "Active",   permissions: ["Bookings","Slots","Payments"], joined: "2025-03-08" },
];

export const payments = [
  { id: "PY5001", booking: "BK1001", amount: 1500, mode: "UPI",  date: "2025-05-15 17:50", by: "U01", ref: "GPay-882211", notes: "Full advance"        },
  { id: "PY5002", booking: "BK1002", amount: 500,  mode: "Card", date: "2025-05-15 06:55", by: "U02", ref: "POS-A19283",  notes: "Card on arrival"     },
  { id: "PY5003", booking: "BK1003", amount: 1000, mode: "Cash", date: "2025-05-15 19:50", by: "U03", ref: "-",           notes: "Cash split 1/2"      },
  { id: "PY5004", booking: "BK1003", amount: 1000, mode: "UPI",  date: "2025-05-15 19:51", by: "U03", ref: "PhonePe-7711",notes: "UPI split 2/2"       },
  { id: "PY5005", booking: "BK1004", amount: 1600, mode: "UPI",  date: "2025-05-15 18:55", by: "U04", ref: "GPay-118822", notes: "Full advance"        },
  { id: "PY5006", booking: "BK1006", amount: 800,  mode: "Cash", date: "2025-05-14 06:00", by: "U06", ref: "-",           notes: "Cash"                },
  { id: "PY5007", booking: "BK1008", amount: 1100, mode: "UPI",  date: "2025-05-15 11:20", by: "U01", ref: "GPay-554433", notes: "50% advance"         },
  { id: "PY5008", booking: "BK1009", amount: 1800, mode: "Wallet",date:"2025-05-15 13:10", by: "U02", ref: "Paytm-998811",notes: "Full payment"        },
  { id: "PY5009", booking: "BK1010", amount: 200,  mode: "Cash", date: "2025-05-13 07:55", by: "U07", ref: "-",           notes: "Token advance"       },
  { id: "PY5010", booking: "BK1005", amount: 0,    mode: "Pending",date:"2025-05-15 10:00",by: "U05", ref: "-",           notes: "Awaiting customer"   },
];

export const reports = [
  { id: "RP01", name: "Daily Revenue",          period: "Today",       value: "₹ 11,500", change: "+12%" },
  { id: "RP02", name: "Weekly Revenue",         period: "This Week",   value: "₹ 78,400", change: "+8%"  },
  { id: "RP03", name: "Monthly Revenue",        period: "This Month",  value: "₹ 3,12,800", change: "+15%" },
  { id: "RP04", name: "Bookings Today",         period: "Today",       value: "27",       change: "+4"   },
  { id: "RP05", name: "Occupancy",              period: "Today",       value: "72%",      change: "+5%"  },
  { id: "RP06", name: "Average Booking Value",  period: "This Month",  value: "₹ 1,420",  change: "+3%"  },
  { id: "RP07", name: "Cancellation Rate",      period: "This Month",  value: "4.2%",     change: "-1%"  },
  { id: "RP08", name: "No-show Rate",           period: "This Month",  value: "2.1%",     change: "-0.4%"},
  { id: "RP09", name: "Tournament Revenue",     period: "This Month",  value: "₹ 86,000", change: "+22%" },
  { id: "RP10", name: "Maintenance Downtime",   period: "This Month",  value: "38 hrs",   change: "-6 hrs"},
];

export const settingsItems = [
  { id: "ST01", label: "Business Name",            value: "GameUp11 Sports Pvt Ltd" },
  { id: "ST02", label: "GSTIN",                    value: "29ABCDE1234F1Z5" },
  { id: "ST03", label: "Default Advance %",        value: "50%" },
  { id: "ST04", label: "Cancellation Window",      value: "6 hours before slot" },
  { id: "ST05", label: "Cancellation Refund",      value: "80% of advance" },
  { id: "ST06", label: "Tax (GST)",                value: "18%" },
  { id: "ST07", label: "Currency",                 value: "INR (₹)" },
  { id: "ST08", label: "Slot Duration Default",    value: "60 min" },
  { id: "ST09", label: "WhatsApp Notifications",   value: "Enabled" },
  { id: "ST10", label: "Email Receipts",           value: "Enabled" },
];

export const slots = (() => {
  // 10 slots across the day for today, used for calendar mini-view
  const states = ["Available","Booked","Available","Blocked","Booked","Available","Maintenance","Booked","Available","Booked"];
  const turfsList = ["T01","T02","T03","T04","T05","T01","T02","T03","T04","T05"];
  return Array.from({length: 10}, (_, i) => ({
    id: `SL${String(i+1).padStart(2,"0")}`,
    time: `${String(8+i).padStart(2,"0")}:00 - ${String(9+i).padStart(2,"0")}:00`,
    turf: turfsList[i],
    state: states[i],
    price: [1200,1500,1500,400,1300,1800,2000,1500,500,1700][i],
  }));
})();

export const dashboardKpis = [
  { label: "Revenue Today",    value: "₹ 11,500",   delta: "+12%", tone: "success" },
  { label: "Revenue Week",     value: "₹ 78,400",   delta: "+8%",  tone: "success" },
  { label: "Revenue Month",    value: "₹ 3,12,800", delta: "+15%", tone: "success" },
  { label: "Bookings Today",   value: "27",         delta: "+4",   tone: "info" },
  { label: "Occupancy",        value: "72%",        delta: "+5%",  tone: "success" },
  { label: "Upcoming",         value: "9",          delta: "next 4h", tone: "info" },
  { label: "Cancelled Today",  value: "2",          delta: "-1",   tone: "warning" },
  { label: "Pending Payments", value: "₹ 4,400",    delta: "3 bookings", tone: "warning" },
  { label: "Avg Booking",      value: "₹ 1,420",    delta: "+3%",  tone: "info" },
  { label: "Top Turf",         value: "Turf B",     delta: "₹ 24k week", tone: "success" },
];

export const dailyBookings = [
  { day: "Mon", bookings: 18, revenue: 21600 },
  { day: "Tue", bookings: 22, revenue: 26400 },
  { day: "Wed", bookings: 19, revenue: 22800 },
  { day: "Thu", bookings: 25, revenue: 31000 },
  { day: "Fri", bookings: 31, revenue: 41800 },
  { day: "Sat", bookings: 38, revenue: 56400 },
  { day: "Sun", bookings: 35, revenue: 51200 },
];

export const paymentBreakdown = [
  { name: "UPI",    value: 48 },
  { name: "Cash",   value: 22 },
  { name: "Card",   value: 14 },
  { name: "Wallet", value: 10 },
  { name: "Bank",   value: 6 },
];

export const sportShare = [
  { name: "Football 5v5", value: 34 },
  { name: "Football 7v7", value: 22 },
  { name: "Box Cricket",  value: 18 },
  { name: "Badminton",    value: 12 },
  { name: "Tennis",       value: 8 },
  { name: "Other",        value: 6 },
];

export function venueName(id: string) {
  return venues.find(v => v.id === id)?.name ?? id;
}
export function turfName(id: string) {
  return turfs.find(t => t.id === id)?.name ?? id;
}
export function customerName(id: string) {
  return customers.find(c => c.id === id)?.name ?? id;
}
export function supervisorName(id: string) {
  return supervisors.find(s => s.id === id)?.name ?? id;
}