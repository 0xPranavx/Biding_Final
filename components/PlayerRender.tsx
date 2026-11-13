"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";

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


const PlayerRender = () => {
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

    // Initialize bid counter when user loads
    useEffect(() => {
        if (user) {
            setBidCounter(user.user_bid_price);
        }
    }, [user]);

    // Real-time subscription
    

    const placeBid = async (userId: number, ownerId: number, bidAmount: number) => {
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

    const handleBid = async ( UserId: number, OwnerId: number) => {
        if (!user) return;
        
        setBidLoading(true);
        setMessage("");

        const result = await placeBid(UserId, OwnerId, bidCounter);

        if (result.success) {
            setMessage(`Bid placed successfully!`);
            setSoldFlg('Y');
        } else {
            setMessage(`Error: ${result.error}`);
        }
        setBidLoading(false);
    };

    // Counter controls
    const increaseBid = (amount: number) => {
        setBidCounter(prev => prev + amount);
    };

    const decreaseBid = (amount: number) => {
        setBidCounter(prev => Math.max(user?.user_start_price || 0, prev - amount));
    }   ;

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
         fetchUser();
        fetchOwners();
   
    }, [userId]);

    if (loading) {
        return (
            <div className="fixed inset-0 w-screen h-screen overflow-hidden flex items-center justify-center">
                <div className="text-white text-xl">Loading player...</div>
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="fixed inset-0 w-screen h-screen overflow-hidden flex items-center justify-center">
                <div className="text-white text-xl">Player not found</div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 w-screen h-screen overflow-hidden ">
   

 

            {/* Player Content */}
            
<div className="absolute bottom-40 left-0 w-full z-10 px-16">
    <div className="flex items-center justify-between w-full">

        {/* LEFT SIDE - Player Image & Details */}
        <div className=" w-[550px] h-[550px] relative flex flex-col items-center justify-center w-1/2">
 <div>
    <img
                src={`https://qfgknkzzqdavctepawkf.supabase.co/storage/v1/object/public/users/${user.id}.png`}
                alt={user.user_name}
                className="object-contain z-20"
            />
         {/* Sold Status */}
            {soldFlg === 'Y' && (
                <img
                    src="/sold.png"
                    alt="Sold"
                    className="absolute inset-0 w-180 h-180 object-contain z-20 pointer-events-none mt-20"
                />
            )}
 </div>
            
            {/* RIGHT SIDE - Bidding Counter */}
        <div className="relative flex flex-col items-center mt-10 justify-center w-1/2">

            {/* Current Bid */}
            <div className="text-white text-[64px] font-extrabold flex items-center gap-8">

                {/* Decrement */}
                <button
                    onClick={() => decreaseBid(500)}
                    disabled={bidCounter <= user.user_start_price}
                    className="w-16 h-16 bg-black/60 text-white rounded-full flex items-center justify-center text-4xl font-bold disabled:opacity-50 hover:bg-red-700 transition-colors"
                >
                    -
                </button>

                {/* Bid Amount */}
                <span className="min-w-[280px] text-center">
                    {bidCounter.toLocaleString()}
                </span>

                {/* Increment */}
                <button
                    onClick={() => increaseBid(500)}
                    className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center text-4xl font-bold hover:bg-green-700 transition-colors"
                >
                    +
                </button>

            </div>

            {/* Sold Status */}
            {/* {soldFlg === 'Y' && (
                <img
                    src="/sold.png"
                    alt="Sold"
                    className="w-96 object-contain mt-8"
                />
            )} */}

        </div>

        </div>
<div className="relative flex flex-col items-center justify-center w-1/2">
{/* Player Name */}
            <div className="text-white text-[58px] capitalize font-extrabold z-40 text-center">
                {user.user_name.toUpperCase()}
            </div>

            {/* Player Type */}
            <div className="text-white text-[36px] capitalize font-bold z-40 mt-2">
                {user.user_type.toUpperCase()}
            </div></div>
        


        

    </div>
</div>


            {/* Bidding Buttons */}
            <div className="fixed bottom-2 left-0 w-full px-3 z-50">
                <div className="">
                    <div className="text-center mb-2">
                        {/* <h3 className="text-white text-base font-semibold">
                            Place Bid (${bidCounter.toLocaleString()})
                        </h3> */}
                        {/* <p className="text-white/60 text-xs">
                            Sell player to selected team
                        </p> */}
                    </div>

                    {/* Team Buttons */}
                    <div className="flex gap-1.5 justify-center flex-wrap">
                        {owners.map((owner) => (
                            <button
                                key={owner.owner_id}
                                onClick={() => handleBid(uuser, owner.owner_id , )}
                                disabled={
                                    bidLoading ||
                                    user.user_sold_flg === "Y" ||
                                    owner.owner_fund < bidCounter
                                }
                                className=" text-white py-2 px-3 rounded-lg font-semibold text-xs disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:from-blue-700 hover:to-purple-700 active:scale-95"
                            >
                                {/* <div className="truncate text-base ">{owner.owner_name}</div> */}
                                    {/* <div className="text-[10px] opacity-80 truncate">
                                        ₹{owner.owner_fund.toLocaleString()}
                                    </div> */}
                                    <Image src={`/${owner.owner_id}.jpeg`} className="border rounded-full " width = '60' height = '60' alt="broo"/>
                            </button>
                        ))}
                    </div>

                    {/* Message */}
                    {message && (
                        <div
                            className={`mt-2 p-1.5 rounded-lg text-center text-xs font-medium ${
                                message.includes("Error") || message.includes("Insufficient")
                                    ? "bg-red-500/20 text-red-200 border border-red-500/30"
                                    : "bg-green-500/20 text-green-200 border border-green-500/30"
                            }`}
                        >
                            {message}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PlayerRender;