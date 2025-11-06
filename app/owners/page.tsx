"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { OwnerTable } from "@/components/OwnerTable";
import Link from "next/link";
import Image from "next/image";

type Owner = {
  owner_id: number;
  created_at: string;
  owner_name: string;
  owner_team_name: string;
  owner_fund: number;
  owner_image_url: string;
};

export default function OwnersPage() {
  const [owners, setOwners] = useState<Owner[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchOwners = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("owners")
        .select("*");

      if (error) {
        console.error("Error fetching owners:", error);
      } else {
        setOwners(data || []);
      }
      setLoading(false);
    };

    fetchOwners();
  }, []);

  if (loading) return <div>Loading owners...</div>;

  return (
    <div className="p-2 flex flex-col justify-start">
        <nav className="flex justify-between items-center  m-2 p-2 border-b border-white border-dashed border-neutral ">
             <div className="flex flex-row justify-start items-center mr-1 z-10"> <Image src={"/acl.png"} width={50} height={10} alt="logo" />
                {/* <Link href="/"> <h1 className="text-xl font-bold mr-2 text-white">ACL2025</h1> </Link>  */}
                </div>
                 <p className="text-sm p-1 text-white z-10">Made with ♥ by <Link className="text-blue-400 z-10" href="https://x.com/0xPranavx">2Players</Link> 
             . </p>
            </nav> 
      <OwnerTable owners={owners} />
    </div>
  );
}
