import {
  formatCompactDateTime,
  formatCurrency,
  getAuctionStatus,
} from "@/lib/format";
import {
  ArrowRight,
  BadgeCheck,
  Clock3,
  Gavel,
  PlayCircle,
  Search,
  ShieldCheck,
  WalletCards,
} from "lucide-react";
import { useSelector } from "react-redux";
import { Link, Navigate } from "react-router-dom";
import FeaturedAuctions from "./home-sub-components/FeaturedAuctions";
import UpcomingAuctions from "./home-sub-components/UpcomingAuctions";
import Leaderboard from "./home-sub-components/Leaderboard";

const Home = () => {
  const howItWorks = [
    {
      title: "Post Items",
      description: "Auctioneers list items with bid windows and starting prices.",
    },
    {
      title: "Place Bids",
      description: "Bidders compete in real time before the auction closes.",
    },
    {
      title: "Win Notification",
      description: "The highest bidder is notified when the auction ends.",
    },
    {
      title: "Wallet Settlement",
      description:
        "Winning bid funds are captured from the bidder wallet and platform fees are deducted automatically.",
    },
  ];

  const { authChecked, isAuthenticated, leaderboard, user } = useSelector(
    (state) => state.user
  );
  const {
    allAuctions,
    auctionFacets,
    auctionPagination,
    serverTime,
    serverTimeReceivedAt,
  } = useSelector((state) => state.auction);
  const liveAuctions = allAuctions.filter(
    (auction) =>
      getAuctionStatus(auction, undefined, serverTime, serverTimeReceivedAt) ===
      "Live"
  ).length;
  const upcomingAuctions = allAuctions.filter(
    (auction) =>
      getAuctionStatus(auction, undefined, serverTime, serverTimeReceivedAt) ===
      "Upcoming"
  ).length;
  const totalBidVolume = leaderboard.reduce(
    (total, bidder) => total + Number(bidder.moneySpent || bidder.moneyspend || 0),
    0
  );
  const marketplaceStats = [
    ["Live auctions", auctionFacets?.statusCounts?.Live ?? liveAuctions, "Open for bidding now"],
    ["Upcoming", auctionFacets?.statusCounts?.Upcoming ?? upcomingAuctions, "Scheduled future listings"],
    ["Total lots", auctionPagination?.totalItems ?? allAuctions.length, "Published auction items"],
    ["Bid volume", formatCurrency(totalBidVolume), "Tracked winner spend"],
  ];
  const highlightedAuctions = [...allAuctions]
    .filter(
      (auction) =>
        getAuctionStatus(auction, undefined, serverTime, serverTimeReceivedAt) !==
        "Ended"
    )
    .sort((a, b) => new Date(a.endTime || 0) - new Date(b.endTime || 0))
    .slice(0, 3);
  const heroAuction = highlightedAuctions[0] || allAuctions[0];
  const heroStatus = heroAuction
    ? getAuctionStatus(heroAuction, undefined, serverTime, serverTimeReceivedAt)
    : "Live";
  const trustSignals = [
    [ShieldCheck, "KYC seller review"],
    [WalletCards, "Wallet-backed bidding"],
    [BadgeCheck, "Automatic settlement"],
    [Clock3, "Visible auction timing"],
  ];

  if (authChecked && isAuthenticated && user?.role === "Super Admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <>
      <section className="app-page">
        <div className="app-container flex flex-col gap-8">
          <div className="grid gap-5 2xl:grid-cols-[minmax(0,1fr)_380px] 2xl:items-stretch">
            <div className="page-header flex min-h-[440px] flex-col justify-between overflow-hidden bg-ink p-0 text-stone-50">
              <div className="grid gap-8 p-5 sm:p-6 md:p-8 2xl:grid-cols-[minmax(0,1fr)_minmax(280px,380px)] 2xl:items-center">
                <div className="min-w-0">
                  <p className="font-mono-brand max-w-xs text-xs font-semibold uppercase leading-5 text-brass tracking-[0.16em]">
                    Lot No. 001 — Trusted auction marketplace
                  </p>
                  <h1 className="font-display mt-4 max-w-[9ch] text-5xl font-semibold leading-[0.98] sm:text-6xl 2xl:text-7xl">
                    PrimeBid
                  </h1>
                  <p className="mt-5 max-w-xl text-base leading-7 text-stone-300 sm:text-lg">
                    Browse live lots, understand the next bid, and participate
                    with wallet-backed confidence from one focused marketplace.
                  </p>
                  <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                    <Link
                      to="/auctions"
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-brass px-5 py-3 font-semibold text-ink transition hover:bg-stone-50"
                    >
                      <Search className="h-5 w-5" />
                      Browse Auctions
                    </Link>
                    {!isAuthenticated ? (
                      <>
                        <Link
                          to="/demo"
                          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-brass/40 px-5 py-3 font-semibold text-brass transition hover:bg-brass/10"
                        >
                          <PlayCircle className="h-5 w-5" />
                          Try Demo
                        </Link>
                        <Link
                          to="/sign-up"
                          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-white/15 px-5 py-3 font-semibold text-white transition hover:bg-white/10"
                        >
                          Create Account
                          <ArrowRight className="h-5 w-5" />
                        </Link>
                      </>
                    ) : (
                      <Link
                        to="/dashboard"
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-white/15 px-5 py-3 font-semibold text-white transition hover:bg-white/10"
                      >
                        Open Dashboard
                        <ArrowRight className="h-5 w-5" />
                      </Link>
                    )}
                  </div>
                </div>

                {heroAuction && (
                  <Link
                    to={`/auction/item/${heroAuction._id}`}
                    className="group w-full max-w-md justify-self-start overflow-hidden rounded-lg border border-white/10 bg-white/[0.06] shadow-2xl shadow-black/30 transition hover:-translate-y-0.5 hover:bg-white/10 2xl:max-w-none 2xl:justify-self-end"
                  >
                    <div className="relative aspect-[16/10] bg-stone-800">
                      <img
                        src={heroAuction.image?.url || "/imageHolder.jpg"}
                        alt={heroAuction.title}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                      <span className="status-pill absolute left-3 top-3 border-pine/30 bg-pine-bg text-pine">
                        <span className="h-2 w-2 rounded-full bg-pine" />
                        {heroStatus}
                      </span>
                    </div>
                    <div className="p-4">
                      <p className="font-display line-clamp-2 text-xl font-semibold leading-snug text-white">
                        {heroAuction.title}
                      </p>
                      <div className="mt-4 grid gap-3 sm:grid-cols-2 2xl:grid-cols-1 min-[1560px]:grid-cols-2">
                        <div className="min-h-[92px] rounded-md bg-white/10 p-3">
                          <p className="text-xs font-semibold text-stone-300">
                            Current bid
                          </p>
                          <p className="paddle-figure paddle-figure-accent mt-2 w-fit text-xl">
                            {formatCurrency(
                              heroAuction.currentBid || heroAuction.startingBid
                            )}
                          </p>
                        </div>
                        <div className="min-h-[92px] rounded-md bg-white/10 p-3">
                          <p className="text-xs font-semibold text-stone-300">
                            Ends
                          </p>
                          <p className="font-mono-brand mt-2 text-lg font-semibold leading-tight tabular-nums">
                            {formatCompactDateTime(heroAuction.endTime)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                )}
              </div>
              <div className="grid border-t border-white/10 bg-white/[0.03] sm:grid-cols-2 lg:grid-cols-4">
                {trustSignals.map(([Icon, label]) => (
                  <div
                    key={label}
                    className="flex min-h-14 items-center gap-3 border-t border-white/10 px-5 py-3 text-sm font-semibold leading-5 text-stone-200 first:border-t-0 sm:border-l sm:first:border-l-0 sm:[&:nth-child(2)]:border-t-0 lg:border-t-0"
                  >
                    <Icon className="h-5 w-5 shrink-0 text-brass" />
                    {label}
                  </div>
                ))}
              </div>
            </div>

            <aside className="page-panel grid content-between gap-4">
              <div>
                <p className="app-kicker">Market Snapshot</p>
                <h2 className="font-display mt-2 text-2xl font-semibold text-ink">
                  Auction activity at a glance
                </h2>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
              {marketplaceStats.map(([title, value, description]) => (
                <div
                  key={title}
                  className="rounded-md border border-stone-200 bg-stone-50 p-4"
                >
                  <p className="text-sm font-semibold text-stone-500">
                    {title}
                  </p>
                  <p className="font-display mt-2 text-2xl font-semibold text-ink">
                    {value}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-stone-600">
                    {description}
                  </p>
                </div>
              ))}
              </div>
              {highlightedAuctions.length > 0 && (
                <div className="grid gap-3">
                  <p className="font-display text-sm font-semibold text-ink">
                    Closing queue
                  </p>
                  {highlightedAuctions.map((auction) => (
                    <Link
                      key={auction._id}
                      to={`/auction/item/${auction._id}`}
                      className="grid gap-3 rounded-md border border-stone-200 p-3 transition hover:border-brass/40 hover:bg-brass/[0.05] sm:grid-cols-[56px_minmax(0,1fr)_auto] sm:items-center"
                    >
                      <img
                        src={auction.image?.url || "/imageHolder.jpg"}
                        alt={auction.title}
                        className="h-14 w-14 rounded-md object-cover"
                      />
                      <span className="min-w-0">
                        <span className="block truncate font-semibold text-ink">
                          {auction.title}
                        </span>
                        <span className="mt-1 flex items-center gap-1 text-xs font-semibold text-stone-500">
                          <Clock3 className="h-3.5 w-3.5 shrink-0" />
                          {formatCompactDateTime(auction.endTime)}
                        </span>
                      </span>
                      <span className="paddle-figure paddle-figure-accent w-fit text-sm">
                        {formatCurrency(auction.currentBid || auction.startingBid)}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </aside>
          </div>

          <div className="grid gap-5">
            <h3 className="font-display text-2xl font-semibold text-ink md:text-3xl">
              How it works
            </h3>
            <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
              {howItWorks.map((element, index) => {
                return (
                  <div
                    key={element.title}
                    className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm"
                  >
                    <span className="font-mono-brand mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-ink text-sm font-semibold text-brass">
                      {index === 0 ? <Gavel className="h-5 w-5" /> : `0${index + 1}`}
                    </span>
                    <h5 className="font-display font-semibold text-ink">
                      {element.title}
                    </h5>
                    <p className="mt-2 leading-6 text-stone-600">
                      {element.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
          <FeaturedAuctions />
          <UpcomingAuctions />
          <Leaderboard />
        </div>
      </section>
    </>
  );
};

export default Home;
