import { useNavigate } from "react-router-dom";
import { Star, ArrowUpRight, MapPin } from "lucide-react";

function ProductCard({ product }) {
  const navigate = useNavigate();

  const hasDiscount =
    product.mrp && Number(product.mrp) > Number(product.price);

  const discountPct = hasDiscount
    ? Math.round(
        ((Number(product.mrp) - Number(product.price)) / Number(product.mrp)) *
          100,
      )
    : null;

  // =====================================================
  // DELIVERY / DISTANCE
  // =====================================================

  const hasDistance =
    product.distance !== undefined &&
    product.distance !== null &&
    Number.isFinite(Number(product.distance));

  const distance = hasDistance ? Number(product.distance) : null;

  const isWithinDeliveryRange = hasDistance && distance <= 30;

  return (
    <div
      onClick={() => navigate(`/products/${product._id}`)}
      className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-[0_16px_40px_-12px_rgba(15,23,42,0.18)]"
    >
      {/* =====================================================
          PRODUCT IMAGE
      ===================================================== */}

      {product.images?.[0]?.url && (
        <div className="relative flex h-52 w-full shrink-0 items-center justify-center overflow-hidden bg-slate-50 sm:h-56 md:h-60">
          <img
            src={product.images[0].url}
            alt={product.title}
            className="h-full max-h-[88%] w-auto max-w-[90%] object-contain transition-transform duration-500 ease-out group-hover:scale-[1.06]"
          />

          {/* =================================================
              TOP LEFT BADGES
          ================================================= */}

          <div className="absolute top-2 left-2 flex max-w-[75%] flex-col items-start gap-1.5 sm:top-3 sm:left-3">
            {product.category && (
              <span className="max-w-full truncate rounded-full border border-slate-200 bg-white/95 px-2 py-1 text-[9px] font-semibold tracking-wide text-slate-600 uppercase shadow-sm sm:px-2.5 sm:text-[10.5px]">
                {product.category}
              </span>
            )}

            {discountPct && (
              <span className="rounded-full bg-rose-500 px-2 py-1 text-[9px] font-bold text-white shadow-sm sm:px-2.5 sm:text-[10.5px]">
                {discountPct}% OFF
              </span>
            )}

            {/* =================================================
                DISTANCE BADGE
            ================================================= */}

            {hasDistance && (
              <span
                className={`flex items-center gap-1 rounded-full px-2 py-1 text-[9px] font-bold shadow-sm sm:px-2.5 sm:text-[10.5px] ${
                  isWithinDeliveryRange
                    ? "bg-emerald-500 text-white"
                    : "bg-amber-500 text-white"
                }`}
              >
                <MapPin size={10} className="shrink-0" />
                {distance.toFixed(1)} km away
              </span>
            )}
          </div>

          {/* =================================================
              QUICK VIEW ICON
          ================================================= */}

          <div className="absolute right-2 bottom-2 flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-700 opacity-100 shadow-md transition-all duration-300 sm:right-3 sm:bottom-3 sm:translate-y-2 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100">
            <ArrowUpRight size={15} />
          </div>
        </div>
      )}

      {/* =====================================================
          PRODUCT CONTENT
      ===================================================== */}

      <div className="flex flex-1 flex-col border-t border-slate-100 p-4 sm:p-5">
        {/* =================================================
            TITLE
        ================================================= */}

        <h3 className="mb-1 line-clamp-1 text-sm font-semibold text-slate-800 sm:text-[15px]">
          {product.title}
        </h3>

        {/* =================================================
            DESCRIPTION
        ================================================= */}

        <p className="mb-3 line-clamp-2 min-h-[2.5em] text-xs leading-relaxed text-slate-500 sm:text-[13px]">
          {product.description}
        </p>

        {/* =================================================
            DELIVERY STATUS
        ================================================= */}

        {hasDistance && (
          <div className="mb-3">
            {isWithinDeliveryRange ? (
              <div className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-[10px] font-semibold text-emerald-700 sm:text-xs">
                <MapPin size={12} className="shrink-0" />
                Available for 30 KM delivery
              </div>
            ) : (
              <div className="flex items-center gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1.5 text-[10px] font-semibold text-amber-700 sm:text-xs">
                <MapPin size={12} className="shrink-0" />
                Outside 30 KM delivery range
              </div>
            )}
          </div>
        )}

        {/* =================================================
            RATING
        ================================================= */}

        {product.rating > 0 && (
          <div className="mb-3 flex items-center gap-1.5">
            <span className="flex items-center gap-0.5 rounded bg-emerald-50 px-1.5 py-0.5 text-[11px] font-semibold text-emerald-700 sm:text-xs">
              {product.rating}

              <Star
                size={10}
                fill="currentColor"
                className="sm:h-[11px] sm:w-[11px]"
              />
            </span>

            {product.numReviews > 0 && (
              <span className="text-[11px] text-slate-400 sm:text-xs">
                ({product.numReviews})
              </span>
            )}
          </div>
        )}

        {/* =================================================
            PRICE
        ================================================= */}

        <div className="mb-4 flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="text-lg font-bold text-slate-900 sm:text-xl">
            ₹{Number(product.price).toLocaleString("en-IN")}
          </span>

          {hasDiscount && (
            <span className="text-xs text-slate-400 line-through sm:text-sm">
              ₹{Number(product.mrp).toLocaleString("en-IN")}
            </span>
          )}
        </div>

        {/* =================================================
            VIEW DETAILS BUTTON
        ================================================= */}

        <button
          onClick={(e) => {
            e.stopPropagation();

            navigate(`/products/${product._id}`);
          }}
          className="mt-auto w-full rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white transition-all duration-200 hover:bg-indigo-600 active:scale-[0.98] sm:text-sm"
        >
          View Details
        </button>
      </div>
    </div>
  );
}

export default ProductCard;
