import { prisma } from "../lib/prisma";

async function main() {
  console.log("--- STARTING DEMO DATA CLEANUP ---");

  const [
    trades,
    listings,
    certs,
    purchases,
    ownerships,
    buyRequests,
    taxis,
    airTickets,
    checkoutItems,
    checkouts,
    reminders,
    notifications,
    txs,
  ] = await prisma.$transaction([
    prisma.shareTrade.deleteMany({}),
    prisma.shareListing.deleteMany({}),
    prisma.shareCertificate.deleteMany({}),
    prisma.sharePurchaseRequest.deleteMany({}),
    prisma.shareOwnership.deleteMany({}),
    prisma.shareBuyRequest.deleteMany({}),
    prisma.taxiRequest.deleteMany({}),
    prisma.airTicketRequest.deleteMany({}),
    prisma.checkoutItem.deleteMany({}),
    prisma.checkout.deleteMany({}),
    prisma.reminder.deleteMany({}),
    prisma.notification.deleteMany({}),
    prisma.walletTransaction.deleteMany({}),
  ]);

  // Reset wallet balances to 0.00
  const walletReset = await prisma.wallet.updateMany({
    data: { balance: 0 },
  });

  // Reset availableShares on any existing projects
  const projects = await prisma.project.findMany();
  for (const p of projects) {
    await prisma.project.update({
      where: { id: p.id },
      data: { availableShares: p.totalShares },
    });
  }

  console.log("Deleted records:");
  console.log(`- Share Trades: ${trades.count}`);
  console.log(`- Share Listings: ${listings.count}`);
  console.log(`- Share Certificates: ${certs.count}`);
  console.log(`- Share Purchase Requests: ${purchases.count}`);
  console.log(`- Share Ownerships: ${ownerships.count}`);
  console.log(`- Share Buy Requests: ${buyRequests.count}`);
  console.log(`- Taxi Requests: ${taxis.count}`);
  console.log(`- Air Ticket Requests: ${airTickets.count}`);
  console.log(`- Checkout Items: ${checkoutItems.count}`);
  console.log(`- Checkouts: ${checkouts.count}`);
  console.log(`- Reminders: ${reminders.count}`);
  console.log(`- Notifications: ${notifications.count}`);
  console.log(`- Wallet Transactions: ${txs.count}`);
  console.log(`- Wallets Reset to 0: ${walletReset.count}`);
  console.log(`- Projects Available Shares Restored: ${projects.length}`);
  console.log("--- CLEANUP COMPLETED SUCCESSFULLY ---");
}

main()
  .catch((e) => {
    console.error("Cleanup failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
