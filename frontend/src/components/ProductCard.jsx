import { useNavigate } from "react-router-dom";
import { Star, ArrowUpRight, MapPin, Heart } from "lucide-react";

function ProductCard({
  product,
  showNearby = false,
  radiusKm = 30,
  isWishlisted = false,
  onToggleWishlist,
}) {
  const navigate = useNavigate();

  if (!product) {
    return null;
  }

  // =====================================================
  // IMAGE
  // =====================================================

  const image =
    product.images?.[0]?.url ||
    (typeof product.images?.[0] === "string" ? product.images[0] : "") ||
    product.image ||
    product.imageUrl ||
    product.thumbnail ||
    "";

  // =====================================================
  // BASIC INFO
  // =====================================================

  const title = product.title || product.name || "Product";

  const brand =
    product.brand || product.seller?.name || product.sellerName || "";

  // =====================================================
  // PRICE
  // =====================================================

  const price = Number(
    product.price ?? product.sellingPrice ?? product.salePrice ?? 0,
  );

  const mrp = Number(
    product.mrp ?? product.originalPrice ?? product.oldPrice ?? 0,
  );

  const hasDiscount = mrp > price && price > 0;

  const discountPct = hasDiscount
    ? Math.round(((mrp - price) / mrp) * 100)
    : Number(product.discount || 0);

  // =====================================================
  // RATING
  // =====================================================

  const rating = Number(product.rating ?? product.averageRating ?? 0);

  const reviewCount = Number(
    product.numReviews ??
      product.reviewCount ??
      (Array.isArray(product.reviews) ? product.reviews.length : 0),
  );

  // =====================================================
  // DISTANCE / DELIVERY
  // =====================================================

  const hasDistance =
    product.distance !== undefined &&
    product.distance !== null &&
    Number.isFinite(Number(product.distance));

  const distance = hasDistance ? Number(product.distance) : null;

  const isWithinDeliveryRange = hasDistance && distance <= Number(radiusKm);

  // =====================================================
  // WISHLIST
  // =====================================================

  const handleWishlist = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (onToggleWishlist) {
      onToggleWishlist(product);
    }
  };

  // =====================================================
  // PRODUCT DETAILS
  // =====================================================

  const handleOpenProduct = () => {
    navigate(`/products/${product._id}`);
  };

  return (
    <div
      onClick={handleOpenProduct}
      className="group flex h-full min-w-0 cursor-pointer flex-col overflow-hidden bg-white"
    >
      {/* =================================================
          PRODUCT IMAGE
      ================================================= */}

      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-slate-100 sm:rounded-xl">
        {image ? (
          <img
            src={image}
            alt={title}
            loading="lazy"
            className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.03]"
            onError={(event) => {
              event.currentTarget.style.display = "none";

              const fallback = event.currentTarget.nextElementSibling;

              if (fallback) {
                fallback.classList.remove("hidden");
              }
            }}
          />
        ) : null}

        {/* IMAGE FALLBACK */}

        <div
          className={`${
            image ? "hidden" : ""
          } flex h-full w-full items-center justify-center text-3xl text-slate-300`}
        >
          🛍️
        </div>

        {/* =================================================
            CATEGORY
        ================================================= */}

        {product.category && (
          <span className="absolute top-2 left-2 max-w-[65%] truncate rounded-full bg-white/95 px-2 py-1 text-[8px] font-semibold tracking-wide text-slate-600 uppercase shadow-sm sm:text-[10px]">
            {product.category}
          </span>
        )}

        {/* =================================================
            DISCOUNT
        ================================================= */}

        {discountPct > 0 && (
          <span className="absolute bottom-2 left-2 rounded bg-green-600 px-1.5 py-1 text-[9px] font-bold text-white shadow-sm sm:px-2 sm:text-[10px]">
            {discountPct}% OFF
          </span>
        )}

        {/* =================================================
            WISHLIST
        ================================================= */}

        {onToggleWishlist && (
          <button
            type="button"
            onClick={handleWishlist}
            aria-label={
              isWishlisted ? "Remove from wishlist" : "Add to wishlist"
            }
            className="absolute top-2 right-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 shadow-sm transition active:scale-90 sm:h-9 sm:w-9"
          >
            <Heart
              size={17}
              strokeWidth={2}
              className={
                isWishlisted ? "fill-red-500 text-red-500" : "text-slate-700"
              }
            />
          </button>
        )}

        {/* =================================================
            QUICK VIEW
        ================================================= */}

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            handleOpenProduct();
          }}
          aria-label="View product"
          className="absolute right-2 bottom-2 hidden h-8 w-8 items-center justify-center rounded-full bg-white text-slate-700 shadow-md transition-all duration-300 sm:flex sm:translate-y-2 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100"
        >
          <ArrowUpRight size={15} />
        </button>
      </div>

      {/* =================================================
          PRODUCT CONTENT
      ================================================= */}

      <div className="flex min-w-0 flex-1 flex-col px-0.5 pt-2 pb-1">
        {/* =================================================
            BRAND
        ================================================= */}

        {brand && (
          <p className="truncate text-[11px] leading-tight font-bold text-slate-900 sm:text-[13px]">
            {brand}
          </p>
        )}

        {/* =================================================
            TITLE
        ================================================= */}

        <h3
          title={title}
          className="mt-0.5 line-clamp-2 min-h-[26px] text-[11px] leading-tight font-medium text-slate-700 sm:min-h-[32px] sm:text-xs"
        >
          {title}
        </h3>

        {/* =================================================
            RATING
        ================================================= */}

        {rating > 0 && (
          <div className="mt-1.5 flex items-center gap-1">
            <span className="flex items-center gap-0.5 rounded bg-green-50 px-1.5 py-0.5 text-[9px] font-semibold text-green-700 sm:text-[10px]">
              {rating.toFixed(1)}

              <Star size={9} fill="currentColor" strokeWidth={1.5} />
            </span>

            {reviewCount > 0 && (
              <span className="truncate text-[9px] text-slate-400 sm:text-[10px]">
                {reviewCount >= 1000
                  ? `${Math.round(reviewCount / 1000)}k`
                  : reviewCount}
              </span>
            )}
          </div>
        )}

        {/* =================================================
            PRICE
        ================================================= */}

        <div className="mt-1 flex min-w-0 flex-wrap items-baseline gap-x-1.5">
          {discountPct > 0 && (
            <span className="text-[10px] font-semibold text-green-600 sm:text-xs">
              ↓{discountPct}%
            </span>
          )}

          {hasDiscount && (
            <span className="text-[10px] text-slate-400 line-through sm:text-xs">
              ₹{mrp.toLocaleString("en-IN")}
            </span>
          )}

          <span className="text-[15px] font-bold text-slate-900 sm:text-[17px]">
            ₹{price.toLocaleString("en-IN")}
          </span>
        </div>

        {/* =================================================
            DELIVERY / OFFER
        ================================================= */}

        <div className="mt-1.5 flex min-w-0 flex-wrap gap-1">
          {/* FREE DELIVERY */}

          {price >= 499 && (
            <span className="max-w-full truncate rounded bg-indigo-50 px-1.5 py-0.5 text-[9px] font-semibold text-indigo-700 sm:text-[10px]">
              Free Delivery
            </span>
          )}

          {/* =================================================
              LOCATION BADGE
          ================================================= */}

          {showNearby && (
            <>
              {hasDistance ? (
                <span
                  className={`max-w-full truncate rounded px-1.5 py-0.5 text-[9px] font-semibold sm:text-[10px] ${
                    isWithinDeliveryRange
                      ? "bg-green-50 text-green-700"
                      : "bg-amber-50 text-amber-700"
                  }`}
                >
                  <MapPin size={9} className="mr-0.5 inline" />
                  {distance.toFixed(1)} km
                </span>
              ) : (
                <span className="max-w-full truncate rounded bg-green-50 px-1.5 py-0.5 text-[9px] font-semibold text-green-700 sm:text-[10px]">
                  <MapPin size={9} className="mr-0.5 inline" />
                  Within {radiusKm} KM
                </span>
              )}
            </>
          )}
        </div>

        {/* =================================================
            VIEW DETAILS
        ================================================= */}

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            handleOpenProduct();
          }}
          className="mt-2 w-full rounded-lg bg-slate-900 px-2 py-2 text-[10px] font-semibold text-white transition-all duration-200 hover:bg-indigo-600 active:scale-[0.98] sm:mt-3 sm:rounded-xl sm:px-3 sm:py-2.5 sm:text-xs"
        >
          View Details
        </button>
      </div>
    </div>
  );
}

export default ProductCard;
