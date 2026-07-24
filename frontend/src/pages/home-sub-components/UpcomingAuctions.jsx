import { useAuctionTicker } from "@/hooks/useAuctionTicker";
import {
  formatCompactDateTime,
  formatCurrency,
  getAuctionStatus,
  getServerNowMs,
} from "@/lib/format";
import { RiAuctionFill } from "react-icons/ri";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

const UpcomingAuctions = () => {
  const { allAuctions, serverTime, serverTimeReceivedAt } = useSelector(
    (state) => state.auction
  );
  useAuctionTicker();

  const today = new Date(getServerNowMs(serverTime, serverTimeReceivedAt));
  const todayString = today.toDateString();

  const auctionsStartingToday = allAuctions.filter((item) => {
    const auctionDate = new Date(item.startTime);
    return (
      auctionDate.toDateString() === todayString &&
      getAuctionStatus(item, undefined, serverTime, serverTimeReceivedAt) ===
        "Upcoming"
    );
  });

  return (
    <>
      <section className="my-8">
        <h3 className="mb-4 text-2xl font-semibold text-ink font-display md:text-3xl">
          Upcoming Auctions
        </h3>
        <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
          <div className="flex min-h-[210px] flex-col justify-between rounded-lg bg-ink p-6 text-white shadow-sm">
            <span className="w-fit rounded-md bg-brass p-3 text-white">
              <RiAuctionFill />
            </span>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brass">
                Auctions for
              </p>
              <h3 className="mt-2 text-3xl font-semibold">Today</h3>
              <p className="mt-3 text-sm text-slate-300">
                {auctionsStartingToday.length} auction
                {auctionsStartingToday.length === 1 ? "" : "s"} starting today
              </p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
            {auctionsStartingToday.slice(0, 6).map((element) => (
              <Link
                to={`/auction/item/${element._id}`}
                key={element._id}
                className="flex min-w-0 gap-4 rounded-lg border border-stone-200 bg-white p-3 shadow-sm transition duration-200 hover:border-brass/30 hover:shadow-md"
              >
                <img
                  src={element.image?.url || "/imageHolder.jpg"}
                  alt={element.title}
                  className="h-20 w-20 shrink-0 rounded-md object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 font-semibold leading-6 text-ink font-display">
                    {element.title}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-brass-strong">
                    {formatCurrency(element.currentBid || element.startingBid)}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {formatCompactDateTime(element.startTime)}
                  </p>
                </div>
              </Link>
            ))}
            {auctionsStartingToday.length === 0 && (
              <div className="rounded-lg border border-dashed border-stone-300 bg-white p-6 text-slate-600">
                No auctions are scheduled to start today.
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default UpcomingAuctions;
