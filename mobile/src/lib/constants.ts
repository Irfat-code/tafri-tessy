// Mirrors the website's lib/booking.ts, lib/categories.ts and lib/nigeria.ts.
// The API checks these values, so keep them in sync with the website.

export const CATEGORIES = [
  { key: "all", label: "All" },
  { key: "wedding", label: "Wedding" },
  { key: "birthday", label: "Birthday" },
  { key: "home", label: "Home Decor" },
  { key: "funeral", label: "Funeral" },
  { key: "seasonal", label: "Seasonal" },
];

export const CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  CATEGORIES.filter((c) => c.key !== "all").map((c) => [c.key, c.label])
);

export const OCCASIONS = ["Wedding", "Birthday", "Home Decor", "Funeral / Memorial", "Seasonal / Holiday", "Corporate Event", "Other"];
export const WREATH_TYPES = ["Door wreath", "Wall hanging", "Table centrepiece", "Standing wreath", "Not sure yet"];
export const BUDGETS = ["Under ₦30,000", "₦30,000 – ₦50,000", "₦50,000 – ₦100,000", "Above ₦100,000"];
export const MAX_PHOTO_BYTES = 4 * 1024 * 1024;

export const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", "Cross River",
  "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT - Abuja", "Gombe", "Imo", "Jigawa", "Kaduna",
  "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun",
  "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara",
];

// Flat delivery fee in kobo (₦5,000). The server sends the real value in /api/mobile/config.
export const DEFAULT_DELIVERY_KOBO = 500000;

// Bundled copies of the website's public/wreaths photos.
export const PHOTOS = {
  hero: require("../../assets/wreaths/hero.jpg"),
  rose: require("../../assets/wreaths/rose.jpg"),
  sunflower: require("../../assets/wreaths/sunflower.jpg"),
  garden: require("../../assets/wreaths/garden.jpg"),
  funeral: require("../../assets/wreaths/funeral.jpg"),
  christmas: require("../../assets/wreaths/christmas.jpg"),
  lavender: require("../../assets/wreaths/lavender.jpg"),
};

export const SHOP_OCCASIONS = [
  { label: "Wedding", key: "wedding", image: PHOTOS.rose },
  { label: "Birthday", key: "birthday", image: PHOTOS.sunflower },
  { label: "Home Decor", key: "home", image: PHOTOS.garden },
  { label: "Funeral", key: "funeral", image: PHOTOS.funeral },
  { label: "Seasonal", key: "seasonal", image: PHOTOS.christmas },
  { label: "Custom", key: "custom", image: PHOTOS.lavender },
];
