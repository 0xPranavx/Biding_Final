"use client";

import { supabase } from "@/lib/supabaseClient";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";

type User = {
  id: number;
  user_name: string;
  user_type: string;
  user_bid_price: number;
  user_start_price: number;
  user_sold_flg: string;
  user_owner_id: number | null;
  user_profile_url: string;
  owner_name?: string;
};

export default function MainPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const id = params?.id;

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("users")
        .select(
          `
          id,
          user_name,
          user_type,
          user_bid_price,
          user_start_price,
          user_sold_flg,
          user_owner_id,
          user_profile_url,
          owners:owners!users_user_owner_id_fkey(owner_name)
        `
        )
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching user:", error);
        setLoading(false);
        return;
      }

      setUser({
        ...data,
        // owner_name: data.owners?.owner_name ?? null, -- pranav
      });
      setLoading(false);
    };

    if (id) fetchUser();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <p className="text-white text-xl animate-pulse">Loading player details...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <p className="text-red-400 text-xl">No player found!</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex flex-col justify-center items-center text-white">
      <div className="flex flex-col items-center space-y-6">
        {/* Player Image */}
        <div className="relative w-[40vw] h-[40vh]">
          <Image
            src={`https://zobdcchizknpihqxfodv.supabase.co/storage/v1/object/public/users_images/${user.id}.jpg`}
            alt={user.user_name}
            fill
            priority
            className="object-contain drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]"
            unoptimized
          />
        </div>

        {/* Player Info */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">{user.user_name}</h1>
          <p className="text-gray-400 text-lg">{user.user_type}</p>
          <p className="text-green-400 text-xl">
            💰 Bid Price: ₹{user.user_bid_price}
          </p>
          <p className="text-yellow-400">
            Starting Price: ₹{user.user_start_price}
          </p>
          <p className="text-sm">
            {user.user_sold_flg === "Y" ? (
              <span className="text-green-500">
                ✅ Sold to {user.owner_name || "Unknown Owner"}
              </span>
            ) : (
              <span className="text-red-500">❌ Not Sold</span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
