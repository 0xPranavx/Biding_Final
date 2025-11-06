"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Image from "next/image";
import { Link } from "lucide-react";
import { useRouter } from "next/navigation";
import router from "next/router";

type Owner = {
  owner_id: number;
  created_at: string;
  owner_name: string;
  owner_team_name: string;
  owner_fund: number;
  owner_image_url: string;
};

export function OwnerTable({ owners }: { owners: Owner[] }) {
const router = useRouter(); 

  return (
    <Card className="shadow-md w-full bg-[#0E0915] text-white border-0 z-20">
      <CardHeader className="text-2xl">ACL Owners</CardHeader>
      <Image src={"/fade_gradient.svg"} alt = 'broo' fill className=" transform rotate-180 absolute inset-0 w-screen h-screen object-cover opacity-25" />
      <CardDescription className="pl-6 text-blue-400" > List of owners details, click on Links below For more details.</CardDescription>
      <CardContent className="text-md text-white">
        <Table>
          <TableHeader className="text-white">
            <TableRow className="text-white">
              <TableHead className="text-white">Profile</TableHead>
              <TableHead className="text-white">Owner Name</TableHead>
              <TableHead className="text-white">Team Name</TableHead>
              <TableHead className="text-white">Available Fund (₹)</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {owners.map((owner) => (
              
              <TableRow key={owner.owner_id} onClick={() => router.push(`/owners/${owner.owner_id}`)} className="z-10" >
                
                <TableCell>
                 
                  <Avatar className="h-12 w-12 z-10">
                    <AvatarImage
                      src={owner.owner_image_url}
                      alt={owner.owner_name}
                    />
                    <AvatarFallback>
                      {owner.owner_name[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                
                </TableCell>

                <TableCell className="font-medium text-md z-10">
                   
                  {owner.owner_name}
                 
                </TableCell>
                <TableCell>{owner.owner_team_name}</TableCell>
                <TableCell>{owner.owner_fund}</TableCell>
                
              </TableRow>
              
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
