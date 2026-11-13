"use client";

import { useEffect, useRef, useState } from "react";
import React from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import { User } from "lucide-react";

/**
 * Ashirwad Premier League – full-screen player auction (fits the viewport, no scrolling).
 * Header on top, player image + bidding counter on the left, player details on the right,
 * five team logo buttons at the bottom.
 *
 * <AuctionScreen
 *   player={{ name: "Arjun Rao", type: "All-rounder", image: "/players/arjun.jpg" }}
 *   startingBid={100}
 *   increment={500}
 *   onBid={({ amount, bids }) => console.log(amount, bids)}
 *   onTeamClick={(team) => {}}   // optional – team buttons do nothing until you pass this
 * />
 */

// Dummy teams – swap names, colours and logos for your real ones
const TEAMS = [
  { id: "tk", name: "Thunder Kings", short: "TK", from: "#2563eb", to: "#1e3a8a" },
  { id: "rs", name: "Royal Strikers", short: "RS", from: "#a855f7", to: "#581c87" },
  { id: "st", name: "Super Titans", short: "ST", from: "#facc15", to: "#a16207" },
  { id: "df", name: "Desert Falcons", short: "DF", from: "#fb923c", to: "#9a3412" },
  { id: "nh", name: "Night Hawks", short: "NH", from: "#14b8a6", to: "#134e4a" },
];

// plain rupees with Indian digit grouping, e.g. ₹1,100
const formatINR = (n) => `₹${Math.round(n).toLocaleString("en-IN")}`;

// smoothly count the shown number up to the new bid
function useCountUp(target, duration = 400, step = 1) {
  const [value, setValue] = useState(target);
  const from = useRef(target);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setValue(target);
      from.current = target;
      return;
    }
    const start = performance.now();
    const origin = from.current;
    let raf;
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      let next = origin + (target - origin) * (1 - Math.pow(1 - t, 3));
      next = t >= 1 ? target : step > 1 ? Math.round(next / step) * step : next;
      setValue(next);
      from.current = next;
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, step]);

  return value;
}

// Keyframes live here so the component works without touching tailwind.config
const CSS = `
@keyframes auc-in-left{from{opacity:0;transform:translateX(-48px)}to{opacity:1;transform:none}}
@keyframes auc-in-right{from{opacity:0;transform:translateX(48px)}to{opacity:1;transform:none}}
@keyframes auc-rise{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:none}}
@keyframes auc-drop{from{opacity:0;transform:translateY(-32px)}to{opacity:1;transform:none}}
@keyframes auc-pop{0%{transform:scale(1)}40%{transform:scale(1.12)}100%{transform:scale(1)}}
@keyframes auc-float{0%{opacity:0;transform:translateY(8px)}20%{opacity:1}100%{opacity:0;transform:translateY(-40px)}}
@keyframes auc-breathe{0%,100%{opacity:.6}50%{opacity:1}}
@keyframes auc-spin{to{transform:rotate(360deg)}}
@keyframes auc-dot{0%,100%{opacity:1}50%{opacity:.25}}
.auc-in-left{animation:auc-in-left .8s cubic-bezier(.2,.8,.2,1) both}
.auc-in-right{animation:auc-in-right .8s .15s cubic-bezier(.2,.8,.2,1) both}
.auc-rise{animation:auc-rise .7s cubic-bezier(.2,.8,.2,1) both}
.auc-drop{animation:auc-drop .7s cubic-bezier(.2,.8,.2,1) both}
.auc-pop{animation:auc-pop .35s ease-out;transform-origin:left bottom}
.auc-float{animation:auc-float .9s ease-out forwards}
.auc-breathe{animation:auc-breathe 7s ease-in-out infinite}
.auc-spin{animation:auc-spin 160s linear infinite}
.auc-spin-rev{animation:auc-spin 200s linear infinite reverse}
.auc-dot{animation:auc-dot 1.4s ease-in-out infinite}
@media (prefers-reduced-motion:reduce){[class*="auc-"]{animation:none!important}}
`;

// ---- Auction mandala (inspired by the APL auction reference) ----
// Decagon rings: dotted band, brick band, then a circle of gavels and pins around the centre.
const N = 10;
const polar = (r, deg) => {
  const a = ((deg - 90) * Math.PI) / 180;
  return [r * Math.cos(a), r * Math.sin(a)];
};
const poly = (r) => Array.from({ length: N }, (_, i) => polar(r, (i * 360) / N));
const toPts = (pts) => pts.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(" ");
const edgeDots = (r, perEdge) => {
  const v = poly(r);
  const out = [];
  v.forEach((p, i) => {
    const q = v[(i + 1) % N];
    for (let j = 0; j < perEdge; j++) {
      const t = j / perEdge;
      out.push([p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t]);
    }
  });
  return out;
};
const DOTS_OUTER = edgeDots(97, 13);
const DOTS_INNER = edgeDots(93, 13);
const GAVELS = Array.from({ length: N }, (_, i) => (i * 360) / N);
const PINS = GAVELS.map((a) => a + 180 / N);

function Mandala({ tone, dot = "#ffffff", className = "", style }) {
  return (
    <svg viewBox="-100 -100 200 200" className={className} style={style} aria-hidden>
      <g fill={dot}>
        {DOTS_OUTER.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="0.85" />
        ))}
        {DOTS_INNER.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="0.55" opacity=".7" />
        ))}
      </g>
      <g fill="none" stroke={tone}>
        <polygon points={toPts(poly(88))} strokeWidth="0.8" />
        <polygon points={toPts(poly(84))} strokeWidth="5" strokeDasharray="4.5 1.4" />
        <polygon points={toPts(poly(79))} strokeWidth="0.8" />
        <polygon points={toPts(poly(75))} strokeWidth="0.5" />
        <polygon points={toPts(poly(33))} strokeWidth="1.2" />
        <polygon points={toPts(poly(30))} strokeWidth="0.5" />
      </g>
      {/* gavels */}
      <g fill={tone}>
        {GAVELS.map((a) => (
          <g key={a} transform={`rotate(${a})`}>
            <rect x="-1" y="-62" width="2" height="26" />
            <rect x="-4.6" y="-68" width="9.2" height="7" rx="1" />
          </g>
        ))}
      </g>
      {/* pins between the gavels */}
      <g fill="none" stroke={tone} strokeWidth="0.9">
        {PINS.map((a) => (
          <g key={a} transform={`rotate(${a})`}>
            <line x1="0" y1="-38" x2="0" y2="-62" />
            <ellipse cx="0" cy="-65" rx="2.4" ry="3.6" />
          </g>
        ))}
      </g>
    </svg>
  );
}

// Faint gold diamond lattice with a dot at each centre
const LATTICE = `url("data:image/svg+xml,${encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'>" +
    "<path d='M24 0L48 24L24 48L0 24Z' fill='none' stroke='%23e8d3a0' stroke-opacity='0.14' stroke-width='1'/>" +
    "<circle cx='24' cy='24' r='1.6' fill='%23e8d3a0' fill-opacity='0.28'/>" +
    "</svg>"
).replace(/%2523/g, "%23")}")`;

function Backdrop() {
  const latticeMask = "radial-gradient(ellipse at 40% 50%, transparent 18%, black 85%)";
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* pattern: strongest toward the edges, clear behind the player */}
      <div
        className="absolute inset-0"
        style={{ backgroundImage: LATTICE, maskImage: latticeMask, WebkitMaskImage: latticeMask }}
      />

      {/* cropped blue mandala, top-right */}
      <Mandala
        tone="#4338ff"
        dot="#7c7cff"
        className="auc-spin-rev absolute -right-56 -top-56 h-[28rem] w-[28rem] opacity-90 sm:-right-72 sm:-top-72 sm:h-[38rem] sm:w-[38rem]"
      />

      {/* cropped red mandala, bottom-right */}
      <Mandala
        tone="#ef3b3b"
        dot="#fb7185"
        className="auc-spin-rev absolute -bottom-56 -right-56 h-[28rem] w-[28rem] opacity-85 sm:-bottom-72 sm:-right-72 sm:h-[38rem] sm:w-[38rem]"
      />
    </div>
  );
}

function Header() {
  return (
    <header className="auc-drop relative z-10 flex shrink-0 flex-col items-center px-4 pt-3">
      <h2 className="bg-gradient-to-b from-[#fbf0cf] via-[#e8d3a0] to-[#b8923f] bg-clip-text text-2xl  mt-2 font-bold tracking-wide text-transparent sm:text-5xl">
        ASHIRWAD PREMIER LEAGUE 2026
      </h2>
      <p className="bg-gradient-to-b from-[#fbf0cf] via-[#e8d3a0] to-[#b8923f] bg-clip-text text-2xl mt-1 font-bold tracking-wide text-transparent sm:text-5xl">
        AUCTION
      </p>
    </header>
  );
}

// Dummy shield logo – replace with your team images
function TeamLogo({ team }) {
  const gid = `auc-g-${team.id}`;
  return (
    <svg viewBox="0 0 64 64" className="h-full w-full" aria-hidden>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={team.from} />
          <stop offset="1" stopColor={team.to} />
        </linearGradient>
      </defs>
      <path
        d="M32 3 L58 12 V32 C58 47 46 58 32 62 C18 58 6 47 6 32 V12 Z"
        fill={`url(#${gid})`}
        stroke="#f4f1e8"
        strokeWidth="2.5"
      />
      <path d="M32 3 L58 12 V24 H6 V12 Z" fill="#fff" fillOpacity=".15" />
      <text
        x="32"
        y="44"
        textAnchor="middle"
        fontSize="21"
        fontWeight="700"
        fill="#fff"
        style={{ fontFamily: "inherit" }}
      >
        {team.short}
      </text>
    </svg>
  );
}

type User = {
    id: number;
    created_at: string;
    user_name: string;
    user_type: string;
    user_bid_price: number;
    user_start_price: number;
    user_sold_flg: string;
    user_owner_id: number | null;
    user_profile_url: string;
};

type Owner = {
    owner_id: number;
    owner_name: string;
    owner_fund: number;
    owner_logo?: string;
};

export default function AuctionScreen({
  player,
  startingBid = 100,
  increment = 500,
  onBid,
  onTeamClick,
}) {

  const params = useParams();
        const userId = params.id;
        const uuser = Number(userId);
        const [user, setUser] = useState<User | null>(null);
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState<string | null>(null);
        const [soldFlg , setSoldFlg] = useState<string> ('');
        
        // Bidding state
        const [owners, setOwners] = useState<Owner[]>([]);
        const [bidLoading, setBidLoading] = useState(false);
        const [message, setMessage] = useState("");
        const [bidCounter, setBidCounter] = useState(0);

    const fetchUser = async () => {
            if (!userId) return;
    
            try {
                setLoading(true);
                const { data, error } = await supabase
                    .from("users")
                    .select("*")
                    .eq("id", userId)
                    .single();
    
                if (error) {
                    throw error;
                }
    
                setUser(data);
                setSoldFlg(data.user_sold_flg);
            } catch (err) {
                console.error("Error fetching user:", err);
                setError("Failed to load player data");
            } finally {
                setLoading(false);
            }
        };
    
        const fetchOwners = async () => {
            try {
                const { data, error } = await supabase
                    .from("owners")
                    .select("*")
                    .order("owner_id", { ascending: true });
    
                if (error) {
                    throw error;
                }
    
                setOwners(data || []);
            } catch (err) {
                console.error("Error fetching owners:", err);
            }
        };

        useEffect(() => {
                if (user) {
                    setBidCounter(user.user_bid_price);
                }
            }, [user]);
    
        useEffect(() => {
             fetchUser();
            fetchOwners();
       
        }, [userId]); 
  
  const [bid, setBid] = useState(startingBid);
  const [bids, setBids] = useState(0);
  // bid amount is as large as fits the panel (max 6rem), shrinking only for very long amounts
  const amountFont = `min(6rem, calc((clamp(18rem, 36vw, 34rem) - 2rem) / ${formatINR(bid).length * 0.62}))`;
  // ticks in steps of a fifth of the increment (100 when the increment is 500)
  const shown = useCountUp(bid, 450, Math.max(1, increment / 5));

  const placeBid = () => {
    const amount = bid + increment;
    setBid(amount);
    setBids((b) => b + 1);
    onBid?.({ amount, bids: bids + 1 });};
  
    if (loading) {
        return (
            <div className="fixed inset-0 w-screen h-screen overflow-hidden flex items-center justify-center">
                <div className="text-white text-xl">Loading player...</div>
            </div>
        );
    }
     

  return (
    // h-screen is the fallback for browsers without dvh
    <main
      className="relative flex h-screen w-full flex-col overflow-hidden bg-black text-[#f4f1e8]"
      style={{
        height: "100dvh",
        fontFamily: "var(--font-barlow), 'Arial Narrow', sans-serif",
      }}
    >
      <style>{CSS}</style>
      <Backdrop />
      <Header />

      {/* Stage: player (with mandala) on the left, details + bidding on the right.
          --img-h is the player height; the mandala is 1.3x that, so it fits between header and team bar. */}
      <div className="relative min-h-0 flex-1 px-5 py-2 [--img-h:clamp(9rem,calc((100dvh_-_29rem)/1.1),22rem)] sm:px-12 sm:[--img-h:clamp(12rem,min(calc((100dvh_-_13rem)/1.2),44vw),38rem)] lg:px-20">
        <div className="mx-auto grid h-full w-full max-w-6xl content-center items-center justify-items-center gap-y-3 sm:grid-cols-[auto_auto] sm:justify-center sm:justify-items-start sm:gap-x-[calc(var(--img-h)*0.25_+_2rem)] sm:gap-y-0">
          {/* Player details */}
          <div className="auc-in-right text-center sm:col-start-2 sm:row-start-1 sm:w-[clamp(18rem,36vw,34rem)] sm:self-end sm:pb-5 sm:text-left">
            <div className="flex items-center justify-center gap-3 sm:justify-start">
              <span className="inline-block rounded-full bg-gradient-to-r from-[#e9b949] to-orange-500 px-4 py-1 text-base font-semibold text-black sm:text-lg">
                {user.user_type}
              </span>
              <span className="flex items-center gap-2 text-base text-[#f4f1e8]/70 sm:text-lg">
                <span className="auc-dot h-2.5 w-2.5 rounded-full bg-emerald-400" />
                Live
              </span>
            </div>
            <h1
              className="auc-rise mt-2 break-words font-bold leading-[0.95] tracking-tight [animation-delay:.35s] sm:mt-3"
              style={{ fontSize: "clamp(2.25rem, min(7vw, 11vh), 6rem)" }}
            >
              {user.user_name}
            </h1>
          </div>

          {/* Player image with the golden mandala turning behind it */}
          <div className="auc-in-left relative aspect-[4/5] h-[var(--img-h)] sm:col-start-1 sm:row-span-2 sm:row-start-1">
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{
                height: "calc(var(--img-h) * 1.3)",
                aspectRatio: "1",
                clipPath: "inset(0 0 11.5% 0)",
              }}
            >
              <Mandala
                tone="#e8d3a0"
                className="auc-spin h-full w-full opacity-60"
                style={{ animationDuration: "90s" }}
              />
            </div>
            <img
              src={`https://qfgknkzzqdavctepawkf.supabase.co/storage/v1/object/public/users/${user.id}.png`}
              alt={player.name}
              className="relative h-full w-full rounded-2xl object-cover object-top drop-shadow-[0_20px_28px_rgba(0,0,0,0.65)]"
            />
          </div>

          {/* Bidding counter */}
          <div className="auc-in-right w-full max-w-md sm:col-start-2 sm:row-start-2 sm:w-[clamp(18rem,36vw,34rem)] sm:max-w-none sm:self-start sm:pt-5">
            <div className="rounded-2xl bg-white/5 p-4 text-center ring-1 ring-white/10">
              <p className="text-sm text-[#f4f1e8]/60 sm:text-base">Current bid</p>
              <div className="relative mt-1">
                <p
                  key={bids}
                  aria-live="polite"
                  className="auc-pop whitespace-nowrap font-bold leading-tight tabular-nums text-[#e9b949]"
                  style={{ fontSize: amountFont, transformOrigin: "center bottom" }}
                >
                  {formatINR(shown)}
                </p>
                {bids > 0 && (
                  <span
                    key={`chip-${bids}`}
                    className="auc-float absolute -top-3 left-0 right-0 mx-auto w-fit rounded-full bg-[#e8d3a0] px-2.5 py-0.5 text-sm font-semibold text-black"
                  >
                    +{formatINR(increment)}
                  </span>
                )}
              </div>
              <div className="mx-auto mt-3 w-3/5 min-w-[9rem] drop-shadow-[0_0_10px_rgba(232,211,160,0.25)] transition hover:drop-shadow-[0_0_18px_rgba(232,211,160,0.55)]">
                <button
                  type="button"
                  onClick={placeBid}
                  className="w-full bg-gradient-to-b from-[#fbf0cf] via-[#e8d3a0] to-[#b8923f] py-1.5 text-base font-bold text-black [clip-path:polygon(4%_0,96%_0,100%_50%,96%_100%,4%_100%,0_50%)] transition hover:brightness-110 focus-visible:brightness-125 active:scale-[0.98]"
                >
                  Place bid
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Team logos (buttons, no action yet) */}
      <nav
        aria-label="Teams"
        className="auc-rise relative z-10 shrink-0  px-4 py-2 [animation-delay:.5s]"
      >
        <div className="mx-auto flex max-w-3xl justify-center gap-5 sm:gap-12">
          {TEAMS.map((team) => (
            <button
              key={team.id}
              type="button"
              onClick={() => onTeamClick?.(team)}
              aria-label={team.name}
              className="group flex flex-col items-center gap-1 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#e9b949]"
            >
              <span className="block h-11 w-10 opacity-90 transition duration-200 group-hover:-translate-y-0.5 group-hover:scale-110 group-hover:opacity-100 sm:h-12 sm:w-11">
                <TeamLogo team={team} />
              </span>
              <span className="hidden text-xs text-[#f4f1e8]/60 sm:block">{team.name}</span>
            </button>
          ))}
        </div>
      </nav>
    </main>
  );
}

/*
 * app/layout.js
 *
 * import { Barlow_Condensed } from "next/font/google";
 * const barlow = Barlow_Condensed({
 *   subsets: ["latin"],
 *   weight: ["500", "600", "700"],
 *   variable: "--font-barlow",
 * });
 * // <body className={barlow.variable}>
 */
