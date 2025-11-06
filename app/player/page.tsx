"use client";
import React from 'react'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Loader } from 'lucide-react'
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
import Image from 'next/image';
import Link from 'next/link';
type User = {
  id: number
  created_at: string
  user_name: string
  user_type: string
  user_bid_price: number
  user_start_price: number
  user_sold_flg: string
  user_owner_id: number | null
  user_profile_url: string
}

interface UserTableProps {
  users: User[]
}

export default function PlayerInfo() {
    const [users, setUsers] = useState<User[]>([])
      const [loading, setLoading] = useState<boolean>(true)

    useEffect(() => {
        const fetchUsers = async () => {
          setLoading(true)
          const { data, error } = await supabase.from("users").select("*").order("user_bid_price", { ascending: false })
    
          if (error) {
            console.error("Error fetching users:", error)
          } else {
            setUsers(data || [])
          }
          setLoading(false)
        }
    
        fetchUsers()
      }, [])

      
  if (loading) return <div>Loading players...</div>;
  return (
     <div className="p-2 flex flex-col h-screen justify-between z-10">
        <nav className="flex justify-between items-center  m-2 p-2 border-b border-white border-dashed border-neutral ">
             <div className="flex flex-row justify-start items-center mr-1 z-10"> <Image src={"/acl.png"} width={50} height={10} alt="logo" />
                {/* <Link href="/"> <h1 className="text-xl font-bold mr-2 text-white">ACL2025</h1> </Link>  */}
                </div>
                 <p className="text-sm p-1  text-white z-10">Made with ♥ by <Link className="text-blue-400 z-10" href="https://x.com/0xPranavx">2Players</Link> 
             . </p>
            </nav> 
     <Card className="shadow-md w-full  bg-[#0E0915] text-white border-0 z-20">
      <CardHeader className="text-2xl">APL Players</CardHeader>
      <CardDescription className='pl-6 text-blue-400'> List of Players arrange by Highest Bid Price.</CardDescription>
       <Image src={"/fade_gradient.svg"} alt = 'broo' fill className=" transform rotate-180 absolute inset-0 w-screen h-screen object-cover opacity-25" />
      <CardContent className="text-md text-white">
        <Table>
          <TableHeader className="text-white">
            <TableRow className="text-white">
              <TableHead className="text-white">Profile</TableHead>
              <TableHead className="text-white">Player Name</TableHead>
              <TableHead className="text-white">Bid Price</TableHead>
              <TableHead className="text-white"> Player Type</TableHead>
              <TableHead className="text-white">Sold/Unsold</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {users.map((user) => (
              
              <TableRow key={user.id} className="z-10" >
                
                <TableCell>
                 
                  <Avatar className="h-12 w-12 z-10">
                    <AvatarImage
                      src={`https://qfgknkzzqdavctepawkf.supabase.co/storage/v1/object/public/users/${user.id}.png`}
                      alt={user.user_name}
                    />
                    <AvatarFallback>
                      {user.user_name[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                
                </TableCell>

                <TableCell className="font-medium text-md z-10">
                   
                  {user.user_name}
                 
                </TableCell>
                <TableCell>{user.user_bid_price}</TableCell>
                <TableCell>{user.user_type}</TableCell>
                <TableCell>{`${ user.user_sold_flg === "Y"
                                              ? "Sold"
                                              : "Not Sold"
                                          }`}</TableCell>
                {/* <TableCell>{user.user_sold_flg}</TableCell> */}
                
              </TableRow>
              
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
    </div>
  )
}
