import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ["en", "vi"],

  // Used when no locale matches
  defaultLocale: "vi",

  // The `pathnames` object holds pairs of internal and
  // external paths. Based on the external path, the
  // middleware can automatically generate the internal path.
  pathnames: {
    "/": "/",
    "/hotels": "/hotels",
    "/flights": "/flights",
    "/foodtour": "/foodtour",
    "/tours": "/tours",
    "/admin": "/admin",
    "/admin/tours": "/admin/tours",
    "/admin/users": "/admin/users",
    "/admin/destinations": "/admin/destinations",
    "/admin/hotels": "/admin/hotels",
    "/admin/restaurants": "/admin/restaurants",
    "/admin/countries": "/admin/countries",
    "/admin/settings": "/admin/settings",
    "/admin/ecommerce": "/admin/ecommerce",
    "/admin/airlines": "/admin/airlines",
    "/admin/transports": "/admin/transports",
    "/admin/roles": "/admin/roles",
    "/admin/permissions": "/admin/permissions",
    "/admin/reviews": "/admin/reviews",
    "/admin/food-reviews": "/admin/food-reviews",
    "/admin/guides": "/admin/guides",
    "/admin/conversations": "/admin/conversations",
    "/admin/provinces": "/admin/provinces",
    "/admin/districts": "/admin/districts",
    "/admin/wards": "/admin/wards",
    "/account/profile": "/account/profile",
    "/account/orders": "/account/orders",
    "/account/points": "/account/points",
    "/account/favourites": "/account/favourites",
    "/account/recently-viewed": "/account/recently-viewed",
    "/account/reviews": "/account/reviews",
    "/account/vouchers": "/account/vouchers",
    "/account/vacations": "/account/vacations",
  },
});

// Lightweight wrappers around Next.js' navigation APIs
// that will consider the routing configuration
export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing);
