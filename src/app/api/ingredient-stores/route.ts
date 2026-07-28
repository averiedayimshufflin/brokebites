import { NextResponse } from "next/server";

type OverpassElement = {
  id: number;
  lat?: number;
  lon?: number;
  center?: {
    lat: number;
    lon: number;
  };
  tags?: {
    name?: string;
    shop?: string;
    brand?: string;
    opening_hours?: string;
    website?: string;
    phone?: string;
    "addr:street"?: string;
    "addr:housenumber"?: string;
    "addr:city"?: string;
  };
};

type GooglePlace = {
  id?: string;
  displayName?: {
    text?: string;
  };
  formattedAddress?: string;
  location?: {
    latitude?: number;
    longitude?: number;
  };
  primaryType?: string;
  businessStatus?: string;
  googleMapsUri?: string;
  websiteUri?: string;
  nationalPhoneNumber?: string;
  rating?: number;
  userRatingCount?: number;
  currentOpeningHours?: {
    openNow?: boolean;
    weekdayDescriptions?: string[];
  };
};

const MAX_RADIUS_MILES = 25;
const METERS_PER_MILE = 1609.344;

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function getDistanceMiles(fromLat: number, fromLon: number, toLat: number, toLon: number) {
  const earthRadiusMiles = 3958.8;
  const latDistance = toRadians(toLat - fromLat);
  const lonDistance = toRadians(toLon - fromLon);
  const a =
    Math.sin(latDistance / 2) * Math.sin(latDistance / 2) +
    Math.cos(toRadians(fromLat)) *
      Math.cos(toRadians(toLat)) *
      Math.sin(lonDistance / 2) *
      Math.sin(lonDistance / 2);

  return earthRadiusMiles * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function getAvailabilityHint(shopType: string, ingredient: string) {
  const ingredientText = ingredient.toLowerCase();

  if (shopType === "supermarket" || shopType === "grocery") {
    return `Likely carries ${ingredientText}; stock is not live.`;
  }

  if (shopType === "convenience") {
    return `May carry basics like ${ingredientText}; check before going.`;
  }

  return `Possible source for ${ingredientText}; availability is not live.`;
}

function getGoogleAvailabilityHint(place: GooglePlace, ingredient: string) {
  const ingredientText = ingredient.toLowerCase();
  const isOpen = place.currentOpeningHours?.openNow;
  const status =
    place.businessStatus === "OPERATIONAL"
      ? "operational"
      : place.businessStatus?.toLowerCase().replaceAll("_", " ") || "listed";
  const openText =
    typeof isOpen === "boolean" ? (isOpen ? "open now" : "not open now") : "hours unknown";

  return `Likely source for ${ingredientText}; ${status}, ${openText}. Live item stock is not available.`;
}

function getAddress(tags: OverpassElement["tags"]) {
  const street = [tags?.["addr:housenumber"], tags?.["addr:street"]]
    .filter(Boolean)
    .join(" ");

  return [street, tags?.["addr:city"]].filter(Boolean).join(", ");
}

async function loadGooglePlacesStores({
  lat,
  lon,
  ingredient,
  radiusMeters,
}: {
  lat: number;
  lon: number;
  ingredient: string;
  radiusMeters: number;
}) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return null;
  }

  const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask":
        "places.id,places.displayName,places.formattedAddress,places.location,places.primaryType,places.businessStatus,places.googleMapsUri,places.websiteUri,places.nationalPhoneNumber,places.rating,places.userRatingCount,places.currentOpeningHours",
    },
    body: JSON.stringify({
      textQuery: `${ingredient} grocery store`,
      includedType: "grocery_store",
      maxResultCount: 12,
      locationBias: {
        circle: {
          center: {
            latitude: lat,
            longitude: lon,
          },
          radius: radiusMeters,
        },
      },
    }),
    next: { revalidate: 900 },
  });

  if (!response.ok) {
    throw new Error("Google Places did not respond.");
  }

  const data = (await response.json()) as { places?: GooglePlace[] };

  return (data.places ?? [])
    .map((place) => {
      const storeLat = place.location?.latitude;
      const storeLon = place.location?.longitude;

      if (!storeLat || !storeLon) return null;

      return {
        id: place.id || `${storeLat}-${storeLon}`,
        name: place.displayName?.text || "Nearby grocery store",
        lat: storeLat,
        lon: storeLon,
        shopType: place.primaryType?.replaceAll("_", " ") || "grocery store",
        distanceMiles: Number(getDistanceMiles(lat, lon, storeLat, storeLon).toFixed(1)),
        address: place.formattedAddress || "",
        openingHours: place.currentOpeningHours?.weekdayDescriptions?.join(" | ") || "",
        website: place.websiteUri || "",
        phone: place.nationalPhoneNumber || "",
        googleMapsUri: place.googleMapsUri || "",
        rating: place.rating ?? null,
        userRatingCount: place.userRatingCount ?? null,
        availability: getGoogleAvailabilityHint(place, ingredient),
        availabilitySource: "Google Places details",
      };
    })
    .filter(Boolean)
    .sort((first, second) => first!.distanceMiles - second!.distanceMiles);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = Number(searchParams.get("lat"));
  const lon = Number(searchParams.get("lon"));
  const ingredient = searchParams.get("ingredient")?.trim() || "ingredient";
  const radiusMiles = Math.min(
    Math.max(Number(searchParams.get("radiusMiles")) || 5, 1),
    MAX_RADIUS_MILES
  );

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return NextResponse.json(
      { error: "Location is required to find nearby stores." },
      { status: 400 }
    );
  }

  const radiusMeters = Math.round(radiusMiles * METERS_PER_MILE);

  try {
    const googleStores = await loadGooglePlacesStores({
      lat,
      lon,
      ingredient,
      radiusMeters,
    });

    if (googleStores) {
      return NextResponse.json({
        stores: googleStores,
        source: "google_places",
        stockNotice:
          "Google Places provides store details, not live grocery inventory. Availability is estimated.",
      });
    }
  } catch {
    // Fall through to OpenStreetMap so the feature remains usable without Google.
  }

  const query = `
    [out:json][timeout:8];
    (
      node["shop"~"supermarket|grocery|convenience|greengrocer|butcher|deli"](around:${radiusMeters},${lat},${lon});
      way["shop"~"supermarket|grocery|convenience|greengrocer|butcher|deli"](around:${radiusMeters},${lat},${lon});
      relation["shop"~"supermarket|grocery|convenience|greengrocer|butcher|deli"](around:${radiusMeters},${lat},${lon});
    );
    out center tags 30;
  `;

  try {
    const response = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "User-Agent": "BrokeBites/1.0 (https://github.com/averiedayimshufflin/brokebites)",
      },
      body: new URLSearchParams({ data: query }),
      next: { revalidate: 900 },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Store map data did not respond. Try a smaller radius." },
        { status: 502 }
      );
    }

    const data = (await response.json()) as { elements?: OverpassElement[] };
    const stores = (data.elements ?? [])
      .map((element) => {
        const storeLat = element.lat ?? element.center?.lat;
        const storeLon = element.lon ?? element.center?.lon;

        if (!storeLat || !storeLon) return null;

        const shopType = element.tags?.shop || "store";
        const name = element.tags?.name || element.tags?.brand || "Nearby food store";
        const distanceMiles = getDistanceMiles(lat, lon, storeLat, storeLon);

        return {
          id: String(element.id),
          name,
          lat: storeLat,
          lon: storeLon,
          shopType,
          distanceMiles: Number(distanceMiles.toFixed(1)),
          address: getAddress(element.tags),
          openingHours: element.tags?.opening_hours || "",
          website: element.tags?.website || "",
          phone: element.tags?.phone || "",
          googleMapsUri: "",
          rating: null,
          userRatingCount: null,
          availability: getAvailabilityHint(shopType, ingredient),
          availabilitySource: "OpenStreetMap store type",
        };
      })
      .filter(Boolean)
      .sort((first, second) => first!.distanceMiles - second!.distanceMiles)
      .slice(0, 18);

    return NextResponse.json({
      stores,
      source: "openstreetmap",
      stockNotice:
        "OpenStreetMap provides store locations, not live grocery inventory. Availability is estimated.",
    });
  } catch {
    return NextResponse.json(
      { error: "Could not load nearby stores right now." },
      { status: 502 }
    );
  }
}
