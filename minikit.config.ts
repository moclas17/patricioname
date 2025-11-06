const ROOT_URL =
  process.env.NEXT_PUBLIC_URL ||
  (process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`) ||
  "http://localhost:3000";

/**
 * MiniApp configuration object. Must follow the mini app manifest specification.
 *
 * @see {@link https://docs.base.org/mini-apps/features/manifest}
 */
export const minikitConfig = {
  accountAssociation: {
    header: "eyJmaWQiOjMxNzkwOCwidHlwZSI6ImF1dGgiLCJrZXkiOiIweDRGNmE4MjQ1QTk5MDlhYTk3MjIwNTgxOTAxZjI4NUE2Zjc3MjAyNkEifQ",
    payload: "eyJkb21haW4iOiJwYXRyaWNpb25hbWUudmVyY2VsLmFwcCJ9",
    signature: "PndFur+Ym7/Aoj2Okkv4CWZCern+H/Eqmky26E4JV0QpLAt9oxPsNboaCRFUZ6Oe7CKSvv6zcL+r6Y+q90rCyhs=",
  },
  baseBuilder: {
    ownerAddress: "0x08a4EC9a4EAe18ffEe2E36412eA4f50dBb2611EE",
  },
  miniapp: {
    version: "1",
    name: "patricioname",
    subtitle: "",
    description: "",
    screenshotUrls: [],
    iconUrl: `${ROOT_URL}/icon.png`,
    splashImageUrl: `${ROOT_URL}/splash.png`,
    splashBackgroundColor: "#000000",
    homeUrl: ROOT_URL,
    webhookUrl: `${ROOT_URL}/api/webhook`,
    primaryCategory: "utility",
    tags: ["example"],
    heroImageUrl: `${ROOT_URL}/hero.png`,
    tagline: "",
    ogTitle: "",
    ogDescription: "",
    ogImageUrl: `${ROOT_URL}/hero.png`,
  },
} as const;
