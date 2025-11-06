"use client";
import React, { useEffect , useState} from 'react'
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
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient';

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
type Owner = {
  owner_id: number;
  created_at: string;
  owner_name: string;
  owner_team_name: string;
  owner_fund: number;
  owner_image_url: string;
};


export default function OwnerDetails() {
    const [users, setUsers] = useState<User[]>([]);
    const [owners , setOwners] = useState<Owner>();
    const [team , setTeam] = useState<string>('');
    const [ownerName , setOwnerName] = useState <string>('');
    const [fund , setFund] = useState<string>('');
    const[logoUrl , setLogoUrl] = useState <string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const params = useParams();
    const ownerId = params.id ;

    useEffect(() =>{

     const fetchOwners = async () => {
      setLoading(true);
      const {data , error} = await supabase.from('owners').select('*').eq("owner_id", ownerId).single();
      if (error) {
        console.log("Error fetching users:", error)
      } else {
        setOwners(data || [])
        setTeam(data.owner_team_name);
        setFund(data.owner_fund);
        setOwnerName(data.owner_name);
      }
     setLoading(false);
    }
    const fetchPlayers = async () =>{
      setLoading(true);
      const {data , error } = await supabase.from('users').select('*').eq("user_owner_id",ownerId);
      if(error){
        console.log("error while fetching users:", error)
      } else{
        console.log(data);
        setUsers(data || [])
      }
      setLoading(false);
    }
      fetchOwners();
      fetchPlayers(); 

    } ,[]);


  return (
   <div className="p-2 flex flex-col h-screen justify-start">
        <nav className="flex justify-between items-center  m-2 p-2 border-b border-white border-dashed border-neutral ">
             <div className="flex flex-row justify-start items-center mr-1 z-10"> <Image src={"/acl.png"} width={50} height={10} alt="logo" />
                {/* <Link href="/"> <h1 className="text-xl font-bold mr-2 text-white">ACL2025</h1> </Link>  */}
                </div>
                 <p className="text-sm p-1 text-white z-10">Made with ♥ by <Link className="text-blue-400 z-10" href="https://x.com/0xPranavx">2Players</Link> 
             . </p>
            </nav> 
     <Card className="shadow-md w-full  bg-[#0E0915] text-white border-0 z-20">
       <Image src={"/fade_gradient.svg"} alt = 'broo' fill className=" transform rotate-180 absolute inset-0 w-screen h-screen object-cover opacity-25" />  
      <CardHeader className="text-2xl">
         <div className='flex flex-row justify-start items-center'>
              <Avatar className=" md:h-30 md:w-30 h-20 w-20 z-10">
       
                    <AvatarImage
                      src={`/${ownerId}.jpeg  `}
                      alt="broo"
                      className='bg-white'
                    />
                    <AvatarFallback>
                      {"T"}
                    </AvatarFallback>
                  </Avatar>
                 <div className='flex flex-col justify-start items-start gap-0 md:p-6 p-4'>
                  <p className='md:text-4xl text-2xl font-semibold  z-10'>{team}</p>
                  <p className='md:text-2xl text-base'>{`Owner : ${ownerName}`}</p>
                  <p className='md:text-2xl text-base'>{`Fund : ${fund}`}</p>
                 </div>
         </div>
     
                  </CardHeader>
      {/* <CardDescription className='pl-6 text-blue-400'> List of Players arrange by Highest Bid Price.</CardDescription> */}
      
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
