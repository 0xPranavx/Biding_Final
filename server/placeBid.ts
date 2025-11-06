
import { supabase } from "@/lib/supabaseClient";

type BidParams = {
  userId: number;       // ID of the player being bought
  ownerId: number;      // ID of the owner who is buying
  bidAmount: number;    // Bidding price entered
};

export const placeBid = async ({ userId, ownerId, bidAmount }: BidParams) => {
  try {
    // 1. Get current owner fund
    const { data: ownerData, error: ownerError } = await supabase
      .from("owners")
      .select("owner_fund")
      .eq("owner_id", ownerId)
      .single();

    if (ownerError) throw ownerError;
    if (!ownerData) throw new Error("Owner not found");

    if (ownerData.owner_fund < bidAmount) {
      throw new Error("Insufficient funds");
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
    return { success: false, error };
  }
};
