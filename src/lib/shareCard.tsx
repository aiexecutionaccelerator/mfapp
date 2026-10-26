import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { SHARE_HOST } from "@/lib/share";

/**
 * The Mission Fragrances share image — the three bottles on black with a
 * pool of gold light, the headline, and the address. One design, two sizes:
 *
 *   "link"   1200×630  — the preview card when the URL is pasted into a
 *                         text, WhatsApp, Facebook, X or LinkedIn.
 *   "square" 1080×1080 — the image a man posts or sends himself (Instagram,
 *                         Stories, Messages), from Settings → Share.
 *
 * Rendered once at build time. The fonts are the brand's own (Bebas Neue,
 * Inter) as .woff, because the image renderer can't read the .woff2 files
 * the app itself uses.
 */

const font = (pkg: string, file: string) =>
  readFile(join(process.cwd(), "node_modules", "@fontsource", pkg, "files", file));

const image = async (file: string) =>
  `data:image/png;base64,${(
    await readFile(join(process.cwd(), "public", "images", file))
  ).toString("base64")}`;

export const SHARE_SIZES = {
  link: { width: 1200, height: 630 },
  square: { width: 1080, height: 1080 },
} as const;

export async function renderShareCard(kind: keyof typeof SHARE_SIZES) {
  const size = SHARE_SIZES[kind];
  const square = kind === "square";

  const [bebas, inter, interBold, bottles, wordmark] = await Promise.all([
    font("bebas-neue", "bebas-neue-latin-400-normal.woff"),
    font("inter", "inter-latin-400-normal.woff"),
    font("inter", "inter-latin-600-normal.woff"),
    image("3bottleswhite.png"),
    image("mflogo.png"),
  ]);

  // The bottles composite is 680×438.
  const bottlesWidth = square ? 760 : 520;
  const bottlesHeight = Math.round((bottlesWidth * 438) / 680);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#07090D",
          position: "relative",
          fontFamily: "Inter",
        }}
      >
        {/* The light the bottles stand in. */}
        <div
          style={{
            position: "absolute",
            width: square ? 900 : 760,
            height: square ? 520 : 360,
            top: square ? 300 : 120,
            left: square ? 90 : 220,
            borderRadius: "50%",
            background:
              "radial-gradient(ellipse at center, rgba(212,175,55,0.28) 0%, rgba(212,175,55,0.08) 45%, rgba(7,9,13,0) 72%)",
          }}
        />

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={wordmark}
          width={square ? 360 : 300}
          height={Math.round(((square ? 360 : 300) * 84) / 520)}
          alt=""
          style={{ marginBottom: square ? 56 : 18 }}
        />

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={bottles} width={bottlesWidth} height={bottlesHeight} alt="" />

        <div
          style={{
            display: "flex",
            marginTop: square ? 56 : 22,
            fontFamily: "Bebas Neue",
            fontSize: square ? 112 : 76,
            lineHeight: 1,
            color: "#F5F1E8",
            letterSpacing: 1,
          }}
        >
          TURN SCENT INTO ACTION.
        </div>
        <div
          style={{
            display: "flex",
            marginTop: square ? 20 : 12,
            fontSize: square ? 34 : 26,
            color: "#C9C4B6",
          }}
        >
          30 Missions. One minute each.
        </div>
        <div
          style={{
            display: "flex",
            marginTop: square ? 40 : 18,
            fontWeight: 600,
            fontSize: square ? 28 : 22,
            letterSpacing: 4,
            color: "#E8D28A",
          }}
        >
          {SHARE_HOST.toUpperCase()}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Bebas Neue", data: bebas, weight: 400, style: "normal" },
        { name: "Inter", data: inter, weight: 400, style: "normal" },
        { name: "Inter", data: interBold, weight: 600, style: "normal" },
      ],
    },
  );
}
