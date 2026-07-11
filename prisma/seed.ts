import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱  Seeding database…\n");

  const SEED_EMAILS = [
    "superadmin@mail.com",
    "admin@mail.com",
    "mod@mail.com",
    "user@mail.com",
    "user2@mail.com",
    "user3@mail.com",
  ];

  // ── Clean previous seed data (safe dependency order) ─────────────────────
  await prisma.shareTrade.deleteMany();
  await prisma.shareListing.deleteMany();
  await prisma.walletTransaction.deleteMany();
  await prisma.sharePurchaseRequest.deleteMany();
  await prisma.shareOwnership.deleteMany();
  await prisma.depositRequest.deleteMany();
  await prisma.ticketBookingRequest.deleteMany();
  await prisma.ticketReferral.deleteMany();
  await prisma.airTicketListing.deleteMany();
  await prisma.taxiRequest.deleteMany();
  await prisma.lostFoundPost.deleteMany();
  await prisma.notification.deleteMany({ where: { user: { email: { in: SEED_EMAILS } } } });
  await prisma.blogCategory.deleteMany();
  await prisma.otpToken.deleteMany({ where: { user: { email: { in: SEED_EMAILS } } } });
  await prisma.wallet.deleteMany({ where: { user: { email: { in: SEED_EMAILS } } } });
  await prisma.project.deleteMany();
  await prisma.user.deleteMany({ where: { email: { in: SEED_EMAILS } } });

  // ── Users ─────────────────────────────────────────────────────────────────
  const [h1, h2, h3, h4, h5, h6] = await Promise.all([
    bcrypt.hash("password", 12),
    bcrypt.hash("password", 12),
    bcrypt.hash("password", 12),
    bcrypt.hash("password", 12),
    bcrypt.hash("password", 12),
    bcrypt.hash("password", 12),
  ]);

  const superAdmin = await prisma.user.create({
    data: {
      fullName: "Rahman Kabir",
      nidNumber: "1000000000",
      email: "superadmin@mail.com",
      phone: "+65 9000 0001",
      passwordHash: h1,
      role: "SUPER_ADMIN",
      isVerified: true,
    },
  });

  const admin = await prisma.user.create({
    data: {
      fullName: "Moshiur Ahmed",
      nidNumber: "2000000000",
      email: "admin@mail.com",
      phone: "+65 9000 0002",
      passwordHash: h2,
      role: "ADMIN",
      isVerified: true,
    },
  });

  const moderator = await prisma.user.create({
    data: {
      fullName: "Tasnim Hossain",
      nidNumber: "3000000000",
      email: "mod@mail.com",
      phone: "+65 9000 0003",
      passwordHash: h3,
      role: "MODERATOR",
      isVerified: true,
    },
  });

  // Regular users — different financial states for testing
  const user = await prisma.user.create({
    data: {
      fullName: "Jakaria Islam",
      nidNumber: "4000000000",
      email: "user@mail.com",
      phone: "+65 9001 0001",
      passwordHash: h4,
      role: "USER",
      isVerified: true,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      fullName: "Mahbubur Rahman",
      nidNumber: "5000000000",
      email: "user2@mail.com",
      phone: "+65 9001 0002",
      passwordHash: h5,
      role: "USER",
      isVerified: true,
    },
  });

  const user3 = await prisma.user.create({
    data: {
      fullName: "Sumaiya Begum",
      nidNumber: "6000000000",
      email: "user3@mail.com",
      phone: "+65 9001 0003",
      passwordHash: h6,
      role: "USER",
      isVerified: true,
    },
  });

  // ── Wallets ───────────────────────────────────────────────────────────────
  await prisma.wallet.create({ data: { userId: superAdmin.id, balance: 50000 } });
  await prisma.wallet.create({ data: { userId: admin.id, balance: 25000 } });
  await prisma.wallet.create({ data: { userId: moderator.id, balance: 5000 } });
  const userWallet  = await prisma.wallet.create({ data: { userId: user.id,  balance: 15000 } });
  const user2Wallet = await prisma.wallet.create({ data: { userId: user2.id, balance: 8000  } });
  const user3Wallet = await prisma.wallet.create({ data: { userId: user3.id, balance: 2500  } });

  await prisma.walletTransaction.createMany({
    data: [
      { walletId: userWallet.id,  type: "DEPOSIT",        amount: 15000, description: "Initial deposit via bKash",    balanceBefore: 0,     balanceAfter: 15000 },
      { walletId: user2Wallet.id, type: "DEPOSIT",        amount: 10000, description: "Bank transfer deposit",        balanceBefore: 0,     balanceAfter: 10000 },
      { walletId: user2Wallet.id, type: "SHARE_PURCHASE", amount: 2000,  description: "Purchased 10 shares - Halal Food Chain", balanceBefore: 10000, balanceAfter: 8000 },
      { walletId: user3Wallet.id, type: "DEPOSIT",        amount: 2500,  description: "Nagad deposit",               balanceBefore: 0,     balanceAfter: 2500  },
    ],
  });

  // ── Projects ──────────────────────────────────────────────────────────────
  const project1 = await prisma.project.create({
    data: {
      name: "Singapore Tech Fund 2025",
      description: "Diversified technology investment fund targeting Singapore-listed tech companies and startups. Annual dividend 8–12%.",
      totalShares: 1000,
      sharePrice: 500.00,
      availableShares: 620,
      status: "ACTIVE",
      createdById: superAdmin.id,
    },
  });

  const project2 = await prisma.project.create({
    data: {
      name: "Halal Food Chain Initiative",
      description: "Community-owned halal restaurant and food supply chain project across Singapore hawker centres and industrial areas.",
      totalShares: 500,
      sharePrice: 200.00,
      availableShares: 310,
      status: "ACTIVE",
      createdById: admin.id,
    },
  });

  const project3 = await prisma.project.create({
    data: {
      name: "Probashi Remittance Services",
      description: "Low-cost remittance service to Bangladesh using community pooled funds. Target rate: max 0.5% fee.",
      totalShares: 300,
      sharePrice: 300.00,
      availableShares: 180,
      status: "ACTIVE",
      createdById: superAdmin.id,
    },
  });

  // ── Share Ownerships ──────────────────────────────────────────────────────
  // user  : 10 shares in project1, 5 in project2
  // user2 : 10 shares in project2, 5 in project3
  // user3 : 5 shares in project1

  const ownership1 = await prisma.shareOwnership.create({
    data: { projectId: project1.id, ownerId: user.id,  quantity: 10, purchasePrice: 500.00 },
  });
  await prisma.shareOwnership.create({
    data: { projectId: project2.id, ownerId: user.id,  quantity: 5,  purchasePrice: 200.00 },
  });
  const ownership2 = await prisma.shareOwnership.create({
    data: { projectId: project2.id, ownerId: user2.id, quantity: 10, purchasePrice: 200.00 },
  });
  await prisma.shareOwnership.create({
    data: { projectId: project3.id, ownerId: user2.id, quantity: 5,  purchasePrice: 300.00 },
  });
  await prisma.shareOwnership.create({
    data: { projectId: project1.id, ownerId: user3.id, quantity: 5,  purchasePrice: 500.00 },
  });

  // ── Share Purchase Requests ───────────────────────────────────────────────
  // PENDING — user3 wants 3 shares in project2
  await prisma.sharePurchaseRequest.create({
    data: {
      buyerId: user3.id,
      projectId: project2.id,
      quantity: 3,
      totalAmount: 600.00,
      paymentMethod: "BKASH",
      txId: "BKS-2026-001",
      status: "PENDING",
    },
  });
  // APPROVED — user bought into project1 previously
  await prisma.sharePurchaseRequest.create({
    data: {
      buyerId: user.id,
      projectId: project1.id,
      quantity: 10,
      totalAmount: 5000.00,
      paymentMethod: "BANK_TRANSFER",
      txId: "BANK-2025-099",
      status: "APPROVED",
      processedById: admin.id,
    },
  });
  // PENDING — user wants more shares in project3
  await prisma.sharePurchaseRequest.create({
    data: {
      buyerId: user.id,
      projectId: project3.id,
      quantity: 2,
      totalAmount: 600.00,
      paymentMethod: "NAGAD",
      txId: "NGD-2026-007",
      status: "PENDING",
    },
  });

  // ── Share Resell Listings ─────────────────────────────────────────────────
  // user wants to sell 3 of their project1 shares at a premium
  const resellListing = await prisma.shareListing.create({
    data: {
      sellerId: user.id,
      projectId: project1.id,
      quantity: 3,
      askingPrice: 550.00,   // bought at 500, selling at 550
      status: "PENDING",     // admin must approve the listing
    },
  });

  // user2 wants to sell 2 of their project2 shares
  await prisma.shareListing.create({
    data: {
      sellerId: user2.id,
      projectId: project2.id,
      quantity: 2,
      askingPrice: 210.00,
      status: "PENDING",
    },
  });

  // ── Share Trade (user3 wants to buy from user's resell listing) ───────────
  await prisma.shareTrade.create({
    data: {
      listingId: resellListing.id,
      buyerId: user3.id,
      quantity: 2,
      totalAmount: 1100.00,
      paymentMethod: "BKASH",
      txId: "BKS-TRADE-001",
      status: "PENDING",
    },
  });

  // ── Deposit Requests ──────────────────────────────────────────────────────
  await prisma.depositRequest.create({
    data: { userId: user.id,  amount: 5000.00, paymentMethod: "BANK_TRANSFER", txId: "BANK-TXN-001",  status: "PENDING" },
  });
  await prisma.depositRequest.create({
    data: { userId: user2.id, amount: 2000.00, paymentMethod: "BKASH",         txId: "BKS-DEP-002",  status: "APPROVED" },
  });
  await prisma.depositRequest.create({
    data: { userId: user3.id, amount: 1000.00, paymentMethod: "NAGAD",         txId: "NGD-DEP-003",  status: "PENDING" },
  });

  // ── Air Ticket Listings ───────────────────────────────────────────────────
  const ticket1 = await prisma.airTicketListing.create({
    data: {
      airline: "Biman Bangladesh Airlines",
      origin: "Singapore (SIN)",
      destination: "Dhaka (DAC)",
      departDate: new Date("2026-08-15T06:00:00Z"),
      returnDate: new Date("2026-09-01T06:00:00Z"),
      price: 450.00,
      seats: 20,
      status: "PUBLISHED",
    },
  });

  const ticket2 = await prisma.airTicketListing.create({
    data: {
      airline: "Singapore Airlines",
      origin: "Singapore (SIN)",
      destination: "Dhaka (DAC)",
      departDate: new Date("2026-07-20T14:00:00Z"),
      price: 680.00,
      seats: 8,
      status: "PUBLISHED",
    },
  });

  const ticket3 = await prisma.airTicketListing.create({
    data: {
      airline: "Air Asia",
      origin: "Singapore (SIN)",
      destination: "Dhaka (DAC)",
      departDate: new Date("2026-09-05T10:00:00Z"),
      price: 380.00,
      seats: 15,
      status: "PUBLISHED",
    },
  });

  // ── Ticket Referral Codes ─────────────────────────────────────────────────
  // user is a referral agent for ticket1 — earns commission per booking
  const referral1 = await prisma.ticketReferral.create({
    data: {
      referrerId: user.id,
      listingId: ticket1.id,
      referralCode: "JAKARIA-BG001",
      bookingCount: 2,
      totalEarnings: 45.00,  // e.g. 5% of 450 × 2 bookings
    },
  });

  // user2 is a referral agent for ticket2
  await prisma.ticketReferral.create({
    data: {
      referrerId: user2.id,
      listingId: ticket2.id,
      referralCode: "MAHBUB-SQ002",
      bookingCount: 1,
      totalEarnings: 34.00,
    },
  });

  // moderator is a referral agent for ticket3
  await prisma.ticketReferral.create({
    data: {
      referrerId: moderator.id,
      listingId: ticket3.id,
      referralCode: "TASNIM-AK003",
      bookingCount: 0,
      totalEarnings: 0,
    },
  });

  // ── Ticket Booking Requests ───────────────────────────────────────────────
  // user3 booked via user's referral
  await prisma.ticketBookingRequest.create({
    data: {
      userId: user3.id,
      listingId: ticket1.id,
      passengers: 1,
      totalPrice: 450.00,
      referralCode: referral1.referralCode,
      status: "CONFIRMED",
    },
  });
  // user2 booked direct (no referral)
  await prisma.ticketBookingRequest.create({
    data: {
      userId: user2.id,
      listingId: ticket2.id,
      passengers: 2,
      totalPrice: 1360.00,
      status: "PENDING",
    },
  });
  // user pending on ticket3
  await prisma.ticketBookingRequest.create({
    data: {
      userId: user.id,
      listingId: ticket3.id,
      passengers: 1,
      totalPrice: 380.00,
      status: "PENDING",
    },
  });

  // ── Taxi Requests ─────────────────────────────────────────────────────────
  await prisma.taxiRequest.create({
    data: {
      userId: user.id,
      pickupLocation: "Block 22, Geylang Lorong 14",
      destination: "Changi Airport Terminal 2",
      date: new Date("2026-06-20T04:30:00Z"),
      passengerCount: 1,
      vehicleType: "Sedan",
      notes: "Very early morning, please be on time",
      status: "PENDING",
    },
  });
  await prisma.taxiRequest.create({
    data: {
      userId: user2.id,
      pickupLocation: "Mustafa Centre, Little India",
      destination: "Jurong East MRT",
      date: new Date("2026-06-18T08:00:00Z"),
      passengerCount: 3,
      vehicleType: "MPV / Minivan",
      status: "CONFIRMED",
      adminNote: "Driver: Karim, +65 9123 4567",
    },
  });
  await prisma.taxiRequest.create({
    data: {
      userId: user3.id,
      pickupLocation: "Woodlands Checkpoint",
      destination: "Orchard Road",
      date: new Date("2026-06-25T10:00:00Z"),
      passengerCount: 2,
      vehicleType: "Sedan",
      status: "PENDING",
    },
  });

  // ── Lost & Found Posts ────────────────────────────────────────────────────
  await prisma.lostFoundPost.createMany({
    data: [
      // LOST posts
      {
        userId: user.id,
        type: "LOST",
        title: "Lost wallet near Mustafa Centre",
        description: "Black leather wallet lost near Mustafa Centre, Little India on 12 June. Contains NID card, S$80 cash, and bKash card. Please contact if found.",
        location: "Mustafa Centre, Little India",
        images: [],
        status: "OPEN",
      },
      {
        userId: user2.id,
        type: "LOST",
        title: "Lost Samsung Galaxy S24 on MRT",
        description: "Lost my Samsung Galaxy S24 (black) on the North-South Line between Woodlands and City Hall on 10 June. Black case with a Bangladesh flag sticker on the back.",
        location: "North-South Line MRT",
        images: [],
        status: "OPEN",
      },
      {
        userId: user3.id,
        type: "LOST",
        title: "Lost gold ring at Geylang Serai Market",
        description: "Lost a gold ring (22k) at Geylang Serai Market on 8 June. Sentimental value — wedding ring. Please help.",
        location: "Geylang Serai Market",
        images: [],
        status: "OPEN",
      },
      {
        userId: moderator.id,
        type: "LOST",
        title: "Lost work permit card",
        description: "Lost my work permit card near Toa Payoh Bus Interchange. Name: Hossain. Card is blue. Need urgently for work. Contact: +65 9000 0003",
        location: "Toa Payoh Bus Interchange",
        images: [],
        status: "RESOLVED",
      },
      // FOUND posts
      {
        userId: user.id,
        type: "FOUND",
        title: "Found prayer cap and tasbih on bus",
        description: "Found a white prayer cap and green tasbih on SBS Bus 65 near Tampines. Kept safely. Owner please contact to collect.",
        location: "SBS Bus 65, Tampines area",
        images: [],
        status: "OPEN",
      },
      {
        userId: user2.id,
        type: "FOUND",
        title: "Found Bangladeshi passport near Farrer Park",
        description: "Found a Bangladeshi passport on the footpath near Farrer Park MRT exit B. Contact me immediately to collect safely — do not delay as this is an important document.",
        location: "Farrer Park MRT, Exit B",
        images: [],
        status: "RESOLVED",
      },
      {
        userId: user3.id,
        type: "FOUND",
        title: "Found children's school bag on bench",
        description: "Found a small green school bag on a bench at Queenstown MRT. Contains textbooks and pencil box. Looks like a child's bag. Call to collect.",
        location: "Queenstown MRT Station",
        images: [],
        status: "OPEN",
      },
      {
        userId: moderator.id,
        type: "FOUND",
        title: "Found bKash card and cash in taxi",
        description: "Found a bKash card and S$30 cash in a taxi (plate: SHC1234X). Keeping safely. Owner can describe the items to claim.",
        location: "Taxi SHC1234X, Jurong area",
        images: [],
        status: "OPEN",
      },
    ],
  });

  // ── Blog Categories ───────────────────────────────────────────────────────
  await prisma.blogCategory.createMany({
    data: [
      { name: "Community News", slug: "community-news" },
      { name: "Financial Tips", slug: "financial-tips" },
      { name: "Singapore Life", slug: "singapore-life" },
      { name: "Travel & Home", slug: "travel-home" },
      { name: "Islamic Corner", slug: "islamic-corner" },
    ],
  });

  // ── Notifications ─────────────────────────────────────────────────────────
  await prisma.notification.createMany({
    data: [
      {
        userId: user.id,
        title: "Deposit Approved",
        message: "Your deposit of S$15,000 has been approved and credited to your wallet.",
        type: "WALLET",
        isRead: true,
      },
      {
        userId: user.id,
        title: "Share Purchase Approved",
        message: "Your purchase of 10 shares in Singapore Tech Fund 2025 has been approved.",
        type: "PURCHASE",
        isRead: true,
      },
      {
        userId: user.id,
        title: "New Deposit Request Pending",
        message: "Your deposit request of S$5,000 is under review. We'll update you within 2–4 hours.",
        type: "WALLET",
        isRead: false,
      },
      {
        userId: user.id,
        title: "Share Resell Listing Submitted",
        message: "Your request to sell 3 shares in Singapore Tech Fund 2025 at S$550 each is pending admin approval.",
        type: "TRADE",
        isRead: false,
      },
      {
        userId: user2.id,
        title: "Deposit Approved",
        message: "Your deposit of S$2,000 via bKash has been approved.",
        type: "WALLET",
        isRead: true,
      },
      {
        userId: user2.id,
        title: "Ticket Booking Pending",
        message: "Your booking for Singapore Airlines SIN→DAC (2 passengers) is under review.",
        type: "SYSTEM",
        isRead: false,
      },
      {
        userId: user3.id,
        title: "Welcome to Singapur Probashi!",
        message: "Your account has been verified. You can now deposit funds and invest in community projects.",
        type: "SYSTEM",
        isRead: false,
      },
      {
        userId: user3.id,
        title: "Share Purchase Request Submitted",
        message: "Your request to buy 3 shares in Halal Food Chain Initiative is pending admin approval.",
        type: "PURCHASE",
        isRead: false,
      },
    ],
  });

  // ── Done ──────────────────────────────────────────────────────────────────
  console.log("\n✅  Seed complete!\n");
  console.log("┌───────────────────────────────────────────────────────┐");
  console.log("│                  TEST CREDENTIALS                    │");
  console.log("├─────────────┬────────────────────────┬───────────────┤");
  console.log("│ Role        │ Email                  │ Password      │");
  console.log("├─────────────┼────────────────────────┼───────────────┤");
  console.log("│ SUPER_ADMIN │ superadmin@mail.com    │ password      │");
  console.log("│ ADMIN       │ admin@mail.com         │ password      │");
  console.log("│ MODERATOR   │ mod@mail.com           │ password      │");
  console.log("│ USER        │ user@mail.com          │ password      │");
  console.log("│ USER        │ user2@mail.com         │ password      │");
  console.log("│ USER        │ user3@mail.com         │ password      │");
  console.log("└─────────────┴────────────────────────┴───────────────┘");
  console.log("\n  Seeded:  3 projects  |  5 share ownerships");
  console.log("           3 purchase requests  |  2 resell listings  |  1 trade");
  console.log("           3 air tickets  |  3 referral codes  |  3 bookings");
  console.log("           3 deposit requests  |  3 taxi requests");
  console.log("           8 lost & found posts  |  8 notifications\n");
}

main()
  .catch((e) => {
    console.error("❌  Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
