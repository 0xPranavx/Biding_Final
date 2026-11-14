"use client";

import { useEffect, useRef, useState } from "react";
// import { useEffect, useRef, useState } from "react";
import React from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import { User } from "lucide-react";

/**
 * Ashirwad Premier League – full-screen player auction (fits the viewport, no scrolling).
 * Left: player + golden mandala. Right: type, name, current bid, Place bid.
 * Bottom: team logo buttons. Clicking a team marks the player SOLD to that team
 * (plays a themed SOLD animation). Status starts as unsold.
 *
 * <AuctionScreen
 *   key={player.id}            // new key per player = fresh unsold state
 *   player={{ name: "Pranav Jejurkar", type: "Batsman", image: "/players/pranav.png" }}
 *   startingBid={500}
 *   increment={500}
 *   onBid={({ amount, bids }) => {}}
 *   onSold={({ team, amount }) => {}}
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

const BEBAS = "var(--font-bebas), 'Bebas Neue', Impact, 'Arial Narrow', sans-serif";

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

// Keyframes live here so the component works without touching tailwind.config.
// The @import loads Bebas Neue with no setup; see the next/font note at the bottom for the Next.js way.
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap');
@keyframes auc-in-left{from{opacity:0;transform:translateX(-48px)}to{opacity:1;transform:none}}
@keyframes auc-in-right{from{opacity:0;transform:translateX(48px)}to{opacity:1;transform:none}}
@keyframes auc-rise{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:none}}
@keyframes auc-drop{from{opacity:0;transform:translateY(-32px)}to{opacity:1;transform:none}}
@keyframes auc-pop{0%{transform:scale(1)}40%{transform:scale(1.12)}100%{transform:scale(1)}}
@keyframes auc-float{0%{opacity:0;transform:translateY(8px)}20%{opacity:1}100%{opacity:0;transform:translateY(-40px)}}
@keyframes auc-spin{to{transform:rotate(360deg)}}
@keyframes auc-dot{0%,100%{opacity:1}50%{opacity:.25}}
@keyframes auc-fade{from{opacity:0}to{opacity:1}}
@keyframes auc-zoom{from{opacity:0;transform:scale(.6)}to{opacity:1;transform:none}}
@keyframes auc-flash{0%,35%{opacity:0}42%{opacity:.5}100%{opacity:0}}
@keyframes auc-slam{0%{opacity:0;transform:scale(3.4) rotate(-14deg)}55%{opacity:1;transform:scale(.9) rotate(-6deg)}72%{transform:scale(1.05) rotate(-6deg)}100%{opacity:1;transform:scale(1) rotate(-6deg)}}
@keyframes auc-stamp{from{opacity:0;transform:scale(2) rotate(-16deg)}to{opacity:1;transform:scale(1) rotate(-8deg)}}
@keyframes auc-burst{0%{opacity:0;transform:translate(-50%,-50%) rotate(45deg) scale(1)}12%{opacity:1}100%{opacity:0;transform:translate(calc(-50% + var(--dx)),calc(-50% + var(--dy))) rotate(225deg) scale(.3)}}
.auc-in-left{animation:auc-in-left .8s cubic-bezier(.2,.8,.2,1) both}
.auc-in-right{animation:auc-in-right .8s .15s cubic-bezier(.2,.8,.2,1) both}
.auc-rise{animation:auc-rise .7s cubic-bezier(.2,.8,.2,1) both}
.auc-drop{animation:auc-drop .7s cubic-bezier(.2,.8,.2,1) both}
.auc-pop{animation:auc-pop .35s ease-out;transform-origin:left bottom}
.auc-float{animation:auc-float .9s ease-out forwards}
.auc-spin{animation:auc-spin 160s linear infinite}
.auc-spin-rev{animation:auc-spin 200s linear infinite reverse}
.auc-dot{animation:auc-dot 1.4s ease-in-out infinite}
.auc-fade{animation:auc-fade .35s ease-out both}
.auc-zoom{animation:auc-zoom .9s cubic-bezier(.2,.8,.2,1) both}
.auc-flash{opacity:0;animation:auc-flash 1.2s ease-out both}
.auc-slam{animation:auc-slam .9s cubic-bezier(.2,.8,.2,1) .1s both}
.auc-stamp{animation:auc-stamp .5s cubic-bezier(.2,.8,.2,1) .3s both}
.auc-spark{animation:auc-burst 1.3s ease-out both}
@media (prefers-reduced-motion:reduce){[class*="auc-"]{animation:none!important}.auc-spark{display:none}}
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
        style={{}}
      />

      {/* cropped red mandala, bottom-right */}
      <Mandala
        tone="#ef3b3b"
        dot="#fb7185"
        className="auc-spin-rev absolute -bottom-56 -right-56 h-[28rem] w-[28rem] opacity-85 sm:-bottom-72 sm:-right-72 sm:h-[38rem] sm:w-[38rem]"
        style={{}}
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

// Gold/cream sparks (plus the blue and red of the corner mandalas) that burst out when the stamp lands
const SPARKS = Array.from({ length: 30 }, (_, i) => {
  const a = (i / 30) * Math.PI * 2 + (i % 3) * 0.12;
  const d = 26 + ((i * 37) % 26); // vmin
  return {
    dx: Math.cos(a) * d,
    dy: Math.sin(a) * d,
    color: ["#e9b949", "#fbf0cf", "#4338ff", "#ef3b3b"][i % 4],
    size: 6 + (i % 4) * 3,
    delay: 0.5 + (i % 5) * 0.03,
  };
});

// Full-screen SOLD moment: sunburst + spinning mandala, SOLD stamp slams in, sparks burst, deal details rise
function SoldOverlay({ deal, playerName, playerImage, ownerName , ownerId , onClose }) {
  return (
    <div
      role="dialog"
      aria-label="Player sold"
      onClick={onClose}
      className="auc-fade absolute inset-0 z-50 flex cursor-pointer items-center justify-center overflow-hidden bg-black/90"
    >
      {/* sunburst rays */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="auc-spin h-[150vmin] w-[150vmin]"
          style={{
            animationDuration: "50s",
            background:
              "repeating-conic-gradient(rgba(232,211,160,0.16) 0 5deg, transparent 5deg 15deg)",
            maskImage: "radial-gradient(circle closest-side, black 25%, transparent 100%)",
            WebkitMaskImage: "radial-gradient(circle closest-side, black 25%, transparent 100%)",
          }}
        />
      </div>

      {/* golden mandala */}
      <div className="auc-zoom absolute inset-0 flex items-center justify-center">
        <Mandala
          tone="#e8d3a0"
          className="auc-spin h-[min(92vh,92vw)] w-[min(92vh,92vw)] opacity-35"
          style={{ animationDuration: "70s" }}
        />
      </div>

      {/* flash on impact */}
      <div className="auc-flash pointer-events-none absolute inset-0 bg-[#fbf0cf]" />

      {/* sparks */}
      {SPARKS.map((sp, i) => (
        <span
          key={i}
          className="auc-spark pointer-events-none absolute left-1/2 top-1/2"
          style={{
            width: sp.size,
            height: sp.size,
            background: sp.color,
            animationDelay: `${sp.delay}s`,
            "--dx": `${sp.dx}vmin`,
            "--dy": `${sp.dy}vmin`,
          }as React.CSSProperties}
        />
      ))}

      <div className="relative z-10 flex flex-col items-center gap-[4vmin] px-4 sm:flex-row sm:gap-[6vmin]">
        {/* the player */}
        <img
          src={playerImage}
          alt={playerName}
          className="auc-zoom aspect-[4/5] h-[min(34vh,50vmin)] rounded-2xl object-cover object-top drop-shadow-[0_20px_28px_rgba(0,0,0,0.7)] sm:h-[min(58vh,64vmin)]"
        />

        <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
          {/* the stamp (medium size) */}
          <div className="auc-slam border-[0.5vmin] border-double border-[#e8d3a0] px-[3vmin] py-[0.6vmin]">
            <span
              className="block bg-gradient-to-b from-[#fbf0cf] via-[#e8d3a0] to-[#b8923f] bg-clip-text leading-none text-transparent"
              style={{
                fontFamily: BEBAS,
                fontSize: "clamp(3.25rem, 13vmin, 8rem)",
                letterSpacing: "0.08em",
              }}
            >
              SOLD
            </span>
          </div>

          {/* the deal */}
          <div className="auc-rise mt-[3.5vmin] flex flex-col items-center gap-2 [animation-delay:.8s] sm:items-start">
            <p className="text-lg font-bold sm:text-4xl">{playerName}</p>
            <p className="text-lg text-semibold text-[#e9b949] sm:text-2xl">SOLD TO </p>
            <div className="flex items-center gap-4">
              <span className="block h-12 w-11 sm:h-[8vmin] sm:w-[7vmin]">
                {/* <TeamLogo team={deal.team} /> */}
                <img src={`/${ownerId}.jpeg`} className="border rounded-full " width = '200' height = '200' alt="broo"/>
              </span>
              <span
                className="text-[#f4f1e8] text-4xl"
                style={{ fontFamily: BEBAS, fontSize: "clamp(2rem, 6vmin, 4rem)", letterSpacing: "0.04em" }}
              >
               {ownerName}
              </span>
            </div>
            <p
              className="font-bold tabular-nums text-[#e9b949]"
              style={{ fontSize: "clamp(1.75rem, 5.5vmin, 3.5rem)" }}
            >
              for {formatINR(deal.amount)}
            </p>
          </div>
        </div>
      </div>

      <p className="absolute bottom-5 text-sm text-white/40">Tap anywhere to continue</p>
    </div>
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
    owner_team_name : string ;
};

export default function AuctionScreen({
//   player,
//   startingBid = 100,
//   increment = 500,
//   onBid,
//   onSold,
}) {

//     const startingBid=500
   const increment=500

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

         const [bid, setBid] = useState(0);
  const [bids, setBids] = useState(0);
  const [sold, setSold] = useState(null); // null = unsold, otherwise { team, amount }
  const [showSold, setShowSold] = useState(false);
  const [Ownername , setOwnername] = useState('');
  const [OwnerId , setOwnerId] = useState(0) ;
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
        const ProcessBid = async (userId: number, ownerId: number, bidAmount: number) => {
                try {
                    // 1. Get current owner fund
                    const { data: ownerData, error: ownerError } = await supabase
                        .from("owners")
                        .select("owner_fund, owner_name")
                        .eq("owner_id", ownerId)
                        .single();
        
                    if (ownerError) throw ownerError;
                    if (!ownerData) throw new Error("Owner not found");
        
                    if (ownerData.owner_fund < bidAmount) {
                        throw new Error(`Insufficient funds. ${ownerData.owner_name} has only ₹${ownerData.owner_fund}`);
                    }
        
                 const { data: userData, error: userCheckError } = await supabase
                     .from("users")
                     .select("user_sold_flg")
                    .eq("id", userId)
                     .single();
                    if (userCheckError) throw userCheckError;
                      if (!userData) throw new Error("User not found");
        
                    if (userData.user_sold_flg === "Y") {
                   throw new Error("This user is already sold.");
                    }
        
                    // 2. Update user table
                    const { data: updatedUser, error: userError } = await supabase
                        .from("users")
                        .update({
                            user_bid_price: bidAmount,
                            user_sold_flg: "Y",
                            user_owner_id: ownerId,
                        })
                        .eq("id", userId)
                        .select("*")
                        .single();
        
                    if (userError) throw userError;
        
                    // 3. Deduct fund from owner
                    const { data: updatedOwner, error: deductError } = await supabase
                        .from("owners")
                        .update({
                            owner_fund: ownerData.owner_fund - bidAmount,
                        })
                        .eq("owner_id", ownerId)
                        .select("*")
                        .single();
        
                    if (deductError) throw deductError;
        
                    return { success: true, updatedUser, updatedOwner };
                } catch (error) {
                    console.error("Error placing bid:", error);
                    return { success: false, error: error.message };
                }
            };
        
            const handleBid = async ( UserId: number, OwnerId: number , OwnerName:string) => {
                if (!user) return;
                
                setBidLoading(true);
                setMessage("");
        
                const result = await ProcessBid(UserId, OwnerId, bid);
        
                if (result.success) {
                    setMessage(`Bid placed successfully!`);
                    setSoldFlg('Y');
                    setSold({owners,amount: bid,});
                    setShowSold(true);
                    setOwnername(OwnerName);
                    setOwnerId(OwnerId);
                    
                    
                } else {
                    setMessage(`Error: ${result.error}`);
                }
                setBidLoading(false);
            };

        useEffect(() => {
                if (user) {
                    setBid(user.user_bid_price);
                }
            }, [user]);
    
        useEffect(() => {
             fetchUser();
            fetchOwners();
       
        }, [userId]); 

        useEffect(() => {
  if (soldFlg !== 'Y' || !user || owners.length === 0) return;

  const owner = owners.find(
    (o) => o.owner_id === user.user_owner_id
  );

  if (!owner) return;

  setSold({
    owners,
    amount: user.user_bid_price,
  });

  setShowSold(true);
}, [soldFlg, user, owners]);

        

 

  // bid amount: as large as fits the column (max 6rem), shrinking only for very long amounts
  const amountFont = `min(6rem, calc(var(--col) / ${formatINR(bid).length * 0.62}))`;
  // player name never wraps: it shrinks to fit the column instead
  
  // ticks in steps of a fifth of the increment (100 when the increment is 500)
  const shown = useCountUp(bid, 450, Math.max(1, increment / 5));

  const placeBid = () => {
    // if (sold) return;
    const amount = bid + increment;
    setBid(amount);
    setBids((b) => b + 1);
    // onBid?.({ amount, bids: bids + 1 });
  };

  const sell = (team) => {
    if (sold) return;
    setSold({ team, amount: bid });
    setShowSold(true);
    // onSold?.({ team, amount: bid });
  };

  // SOLD overlay closes by itself, on click, or on Escape
  useEffect(() => {
    if (!showSold) return;
    const timer = setTimeout(() => setShowSold(false), 6000);
    const onKey = (e) => e.key === "Escape" && setShowSold(false);
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", onKey);
    };
  }, [showSold]);

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
          --img-h is the player height, --col is the width of the right column. */}
      <div className="relative min-h-0 flex-1 px-5 py-2 [--col:clamp(18rem,38vw,38rem)] [--img-h:clamp(9rem,calc((100dvh_-_29rem)/1.1),22rem)] sm:px-12 sm:[--img-h:clamp(12rem,min(calc((100dvh_-_13rem)/1.2),44vw),38rem)] lg:px-20">
        <div className="mx-auto grid h-full w-full max-w-[90rem] content-center items-center justify-items-center gap-y-3 sm:grid-cols-[auto_auto] sm:justify-center sm:justify-items-start sm:gap-x-[calc(var(--img-h)*0.25_+_2rem)] sm:gap-y-0">
          {/* Player details */}
          <div className="auc-in-right text-center sm:col-start-2 sm:row-start-1 sm:w-[var(--col)] sm:self-end sm:pb-5 sm:text-left">
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
              alt={user.user_name}
              className="relative h-full w-full rounded-2xl object-cover object-top drop-shadow-[0_20px_28px_rgba(0,0,0,0.65)]"
            />
            {/* SOLD stamp that stays on the photo once the player is sold */}
            {sold && (
              <div className="pointer-events-none absolute inset-x-0 bottom-[8%] flex justify-center">
                <div
                  className="auc-stamp border-4 border-double border-[#e8d3a0] bg-black/55 px-4 text-[#e8d3a0]"
                  style={{
                    fontFamily: BEBAS,
                    fontSize: "clamp(2.5rem, 7vmin, 4.5rem)",
                    letterSpacing: "0.1em",
                    lineHeight: 1.1,
                  }}
                >
                  SOLD
                </div>
              </div>
            )}
          </div>

          {/* Bidding: left-aligned with the player name */}
          <div className="auc-in-right w-full max-w-md text-center sm:col-start-2 sm:row-start-2 sm:w-[var(--col)] sm:max-w-none sm:self-start sm:pt-5 sm:text-left">
            <p className="text-sm text-[#f4f1e8]/60 sm:text-lg">Current bid</p>
            <div className="relative">
              <p
                key={bids}
                aria-live="polite"
                className="auc-pop whitespace-nowrap font-bold leading-tight tabular-nums text-[#e9b949]"
                style={{ fontSize: amountFont }}
              >
                {formatINR(shown)}
              </p>
              {bids > 0 && !sold && (
                <span
                  key={`chip-${bids}`}
                  className="auc-float absolute -top-3 right-0 rounded-full bg-[#e8d3a0] px-2.5 py-0.5 text-sm font-semibold text-black"
                >
                  +{formatINR(increment)}
                </span>
              )}
            </div>
            <div className="mx-auto mt-3 w-3/5 min-w-[9rem] drop-shadow-[0_0_10px_rgba(232,211,160,0.25)] transition hover:drop-shadow-[0_0_18px_rgba(232,211,160,0.55)] sm:mx-0">
              <button
                type="button"
                onClick={placeBid}
                disabled={!!sold}
                className=" text-lg w-full bg-gradient-to-b from-[#fbf0cf] via-[#e8d3a0] to-[#b8923f] py-1.5 text-base font-bold text-black transition [clip-path:polygon(4%_0,96%_0,100%_50%,96%_100%,4%_100%,0_50%)] enabled:hover:brightness-110 enabled:focus-visible:brightness-125 enabled:active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {sold ? "Sold" : "Place bid"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Team buttons: click one to sell the player to that team */}
      <nav
        aria-label="Sell to a team"
        className="auc-rise relative z-10 shrink-0 px-4 py-2 [animation-delay:.5s]"
      >
        <div className="mx-auto flex max-w-3xl justify-center gap-5 sm:gap-12">
          {owners.map((owner) => {
            const isWinner = sold?.owners.owner_id === owner.owner_id;
            return (
              <button
                key={owner.owner_id}
                type="button"
                onClick={() => handleBid(uuser, owner.owner_id , owner.owner_team_name)}
                disabled={bidLoading ||
                                    user.user_sold_flg === "Y" ||
                                    owner.owner_fund < bid}
                aria-label={sold ? owner.owner_name : `Sell to ${owner.owner_name}`}
                className={`group flex flex-col items-center gap-1 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#e9b949] ${
                  sold && !isWinner ? "opacity-30" : ""
                } ${sold ? "cursor-default" : ""}`}
              >
                 <img src={`/${owner.owner_id}.jpeg`} className="border rounded-full " width = '60' height = '60' alt="broo"/>
              </button>
            );
          })}
        </div>
      </nav>

      {/* {showSold && sold && ( */}
      { soldFlg == 'Y' && showSold && sold && (
        <SoldOverlay
          deal={sold}
          playerName={user.user_name}
          playerImage={`https://qfgknkzzqdavctepawkf.supabase.co/storage/v1/object/public/users/${user.id}.png`}
          ownerName= {Ownername}
          ownerId={OwnerId}
          onClose={() => setShowSold(false)}
        />
      )}
    </main>
  );
}

/*
 * Fonts (optional, the Next.js way). Bebas Neue already loads through the @import in CSS above.
 * app/layout.js
 *
 * import { Barlow_Condensed, Bebas_Neue } from "next/font/google";
 * const barlow = Barlow_Condensed({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-barlow" });
 * const bebas = Bebas_Neue({ subsets: ["latin"], weight: "400", variable: "--font-bebas" });
 * // <body className={`${barlow.variable} ${bebas.variable}`}>
 */
