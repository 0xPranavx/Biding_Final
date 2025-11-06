"use client";

import * as React from "react";
// import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

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

export function UserCarousel({ users }: { users: User[] }) {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gray-100 overflow-hidden">
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        // plugins={[Autoplay({ delay: 4000 })]}
        className="w-full h-full"
      >
        <CarouselContent className="h-full">
          {users.map((user) => (
           
            <CarouselItem key={user.id} className="w-full h-full flex items-center justify-center">
              <Card className="w-full h-full flex items-center justify-center bg-white rounded-none border-none shadow-none">
                <CardContent className="flex flex-col items-center justify-center text-center gap-6">
                  <Avatar className="h-32 w-32">
                    <AvatarImage
                      src={`https://zobdcchizknpihqxfodv.supabase.co/storage/v1/object/public/users_images/${user.id}.jpg`}
                      alt={user.user_name}
                    />
                    <AvatarFallback>{user.user_name[0]}</AvatarFallback>
                  </Avatar>

                  <h2 className="font-bold text-3xl">{user.user_name}</h2>
                  <p className="text-lg text-muted-foreground">
                    {user.user_type}
                  </p>

                  <div className="flex flex-col gap-2 mt-4 text-xl">
                    <p>
                      <strong>Start Price:</strong> ₹{user.user_start_price}
                    </p>
                    <p>
                      <strong>Bid Price:</strong> ₹{user.user_bid_price}
                    </p>
                  </div>

                  <div className="mt-4">
                    {user.user_sold_flg === "Y" ? (
                      <p className="text-green-600 font-semibold text-xl">
                        Sold to: {user.owner_name || "Unknown Owner"}
                      </p>
                    ) : (
                      <p className="text-red-500 font-semibold text-xl">
                        Not Sold
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </CarouselItem>
            
            
          ))}
        </CarouselContent>
       

        <CarouselPrevious className="absolute left-6 top-1/2 transform -translate-y-1/2 scale-125" />
        <CarouselNext className="absolute right-6 top-1/2 transform -translate-y-1/2 scale-125" />
      </Carousel>
    </div>
  );
}
