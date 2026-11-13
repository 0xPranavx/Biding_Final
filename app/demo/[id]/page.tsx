"use client"
import AuctionScreen from "@/components/ui/auction"
export default function Page() {
  return (
    <AuctionScreen
   player={{ name: "Pranav Jejurkar", type: "Batsman", image: "https://qfgknkzzqdavctepawkf.supabase.co/storage/v1/object/public/users/42.png" }}
  startingBid={500}
   increment={500}
   onBid={({ amount, bids }) => console.log(amount, bids)}
 />
    
    
  )
}