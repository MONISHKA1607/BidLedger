import { useEffect, useMemo, useState } from "react";
import { Clock3, Heart } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  formatCompactDateTime,
  formatCurrency,
  getAuctionCountdown,
  getAuctionStatus,
} from "@/lib/format";
import {
  getTrustBadgeClass,
  normalizeTrustBadges,
} from "@/lib/sellerQuality";
import { addToWatchlist, removeFromWatchlist } from "@/store/slices/userSlice";

/* eslint-disable react/prop-types */
const statusClass = {
  Live: "border border-pine/30 bg-pine-bg text-pine",
  Upcoming: "border border-brass/30 bg-brass/10 text-brass-strong",
  Ended: "border border-stone-200 bg-stone-100 text-stone-500",
  Invalid: "border border-red-200 bg-red-50 text-red-700",
};

const Card = ({
  imgSrc,
  title,
  startingBid,
  currentBid,
  category,
  startTime,
  endTime,
  runtimeStatus,
  auctionServerTime,
  createdBy,
  sellerQuality,
  id,
}) => {
  const { serverTime, serverTimeReceivedAt } = useSelector(
    (state) => state.auction
  );
  const auctionTime = useMemo(
    () => ({ startTime, endTime, runtimeStatus, serverTime: auctionServerTime }),
    [auctionServerTime, endTime, runtimeStatus, startTime]
  );
  const [timeLeft, setTimeLeft] = useState(() =>
    getAuctionCountdown(auctionTime, undefined, serverTime, serverTimeReceivedAt)
  );
  const status = getAuctionStatus(
    auctionTime,
    undefined,
    serverTime,
    serverTimeReceivedAt
  );
  const dispatch = useDispatch();
  const { isAuthenticated, user, watchlist, watchlistLoading } = useSelector(
    (state) => state.user
  );
  const createdById = createdBy?._id || createdBy;
  const isOwnAuction = createdById?.toString?.() === user?._id?.toString?.();
  const isSaved = watchlist.some((auction) => auction._id === id);

  useEffect(() => {
    setTimeLeft(
      getAuctionCountdown(auctionTime, undefined, serverTime, serverTimeReceivedAt)
    );
    const timer = setInterval(() => {
      setTimeLeft(
        getAuctionCountdown(auctionTime, undefined, serverTime, serverTimeReceivedAt)
      );
    }, 1000);
    return () => clearInterval(timer);
  }, [auctionTime, serverTime, serverTimeReceivedAt]);

  const formatTimeLeft = ({ days, hours, minutes, seconds }) => {
    const pad = (num) => String(num).padStart(2, "0");
    return `${days}d ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  };

  const latestBid = Number(currentBid || startingBid || 0);
  const trustBadges = normalizeTrustBadges(sellerQuality, createdBy).slice(0, 2);
  const scheduleLabel =
    status === "Upcoming" ? "Starts" : status === "Ended" ? "Ended" : "Ends";
  const scheduleDate = status === "Upcoming" ? startTime : endTime;
  const handleWatchlist = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (isSaved) {
      dispatch(removeFromWatchlist(id));
    } else {
      dispatch(addToWatchlist(id));
    }
  };

  return (
    <article className="app-card app-card-hover group relative flex min-h-[400px] flex-col overflow-hidden">
      {isAuthenticated && !isOwnAuction && (
        <button
          type="button"
          onClick={handleWatchlist}
          disabled={watchlistLoading}
          aria-pressed={isSaved}
          className={`absolute right-3 top-3 z-10 rounded-md p-2 shadow-sm ring-1 ring-stone-200/70 transition ${
            isSaved
              ? "bg-rose-50 text-rose-600 hover:bg-rose-100"
              : "bg-white/95 text-stone-500 hover:bg-brass/10 hover:text-brass-strong"
          } disabled:cursor-not-allowed disabled:opacity-60`}
          aria-label={isSaved ? "Remove from watchlist" : "Save to watchlist"}
        >
          <Heart className={`h-5 w-5 ${isSaved ? "fill-current" : ""}`} />
        </button>
      )}
      <Link
        to={`/auction/item/${id}`}
        className="block focus:outline-none focus:ring-2 focus:ring-brass"
      >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-100">
        <img
          src={imgSrc || "/imageHolder.jpg"}
          alt={title}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
        <span
          className={`absolute left-3 top-3 rounded-md px-3 py-1 text-xs font-semibold shadow-sm ${
            statusClass[status] || statusClass.Invalid
          }`}
        >
          {status}
        </span>
        {category && (
          <span className="absolute bottom-3 left-3 max-w-[calc(100%-1.5rem)] truncate rounded-md bg-white/95 px-3 py-1 font-mono-brand text-xs font-semibold text-ink shadow-sm">
            {category}
          </span>
        )}
      </div>
      </Link>
      <div className="flex flex-1 flex-col justify-between gap-4 p-4">
        <Link to={`/auction/item/${id}`} className="focus:outline-none">
          <h5 className="font-display line-clamp-2 text-lg font-semibold leading-snug text-ink group-hover:text-brass-strong">
            {title}
          </h5>
        </Link>
        <div className="space-y-3">
          <div className="grid gap-3 min-[420px]:grid-cols-2">
            <p className="min-h-[74px] rounded-md bg-stone-50 px-3 py-2 text-sm text-stone-500">
              Current
              <span className="paddle-figure paddle-figure-accent mt-1 w-full text-base">
                {formatCurrency(latestBid)}
              </span>
            </p>
            <p className="min-h-[74px] rounded-md bg-stone-50 px-3 py-2 text-sm text-stone-500">
              Starting
              <span className="paddle-figure mt-1 w-full text-base">
                {formatCurrency(startingBid)}
              </span>
            </p>
          </div>
          <div className="rounded-md border border-brass/20 bg-brass/[0.06] px-3 py-2 text-sm font-semibold text-brass-strong">
            <span className="flex items-center gap-2 leading-5">
              <Clock3 className="h-4 w-4 shrink-0" />
              <span className="font-mono-brand">
                {Object.keys(timeLeft).length > 1
                  ? `${timeLeft.type}: ${formatTimeLeft(timeLeft)}`
                  : "Time's up!"}
              </span>
            </span>
            <span className="mt-1 block text-xs font-medium text-ink/60">
              {scheduleLabel} {formatCompactDateTime(scheduleDate)}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {trustBadges.map((badge) => (
              <span
                key={badge.id}
                className={`rounded-md border px-2.5 py-1 text-xs font-bold ${getTrustBadgeClass(
                  badge.tone
                )}`}
                title={badge.description}
              >
                {badge.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
};

export default Card;
