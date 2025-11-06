import { Fullscreen } from "lucide-react";
import Image from "next/image";
import Link from 'next/link'
import { Card , CardContent , CardDescription , CardHeader , CardFooter  ,CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="bg-[#0E0915]  flex h-screen flex-col justify-between">
       <Image src={"/fade_gradient.svg"} alt = 'broo' fill className="absolute inset-0 w-screen h-screen object-cover" />
        <Image src={"/fade_gradient.svg"} alt = 'broo' fill className=" transform rotate-180 absolute inset-0 w-screen h-screen object-cover opacity-25" />
       
        <nav className="flex justify-between items-center  m-2 p-2 border-b border-white border-dashed border-neutral ">
       <div className="flex flex-row justify-start items-center mr-1 z-10"> <Image src={"/acl.png"} width={50} height={10} alt="logo" />
          {/* <Link href="/"> <h1 className="text-xl font-bold mr-2 text-white">ACL2025</h1> </Link>  */}
          </div>
           <p className="text-sm p-1 text-white z-10">Made with ♥ by <Link className="text-blue-400 z-10" href="https://x.com/0xPranavx">2Players</Link> 
       . </p>
      </nav> 
      
   <div className="flex justify-center items-center  h-full bg-[#0E0915]">
    
  
     <Card className=" w-full md:w-6/12 bg-[#0E0915] text-white border-0">
      <CardHeader>
        
      
          {/* <Image src={"/acl.png"} width={100} alt="broo" height={50}/> */}
          
     
        <CardTitle className="md:text-6xl text-6xl">Ashirwad Champions League</CardTitle>
        <CardDescription className="md:text-lg ">Special Partner <span className="text-blue-400 text-semibold">AZMM</span></CardDescription>
      </CardHeader>
      <CardContent className=" ">
      Welcome to one of the most premium cricket auctions, Ashirwad Champions League 2025.
Discover top players, passionate owners, and the thrill of every bid by clicking on the links below.
      </CardContent>
      <CardFooter className="flex justify-start ">
        <Button size='lg' className="text-lg border-dashed border-white bg-[#0E0915] text-white z-10 mr-1" variant="outline"><Link href="/player">Players</Link></Button>
        <Button size='lg' className="text-lg border-dashed border-white bg-[#0E0915] text-white  z-10" variant="outline"><Link href="/owners">Owners</Link></Button>
      </CardFooter>
    </Card>
    
   </div>
    {/* <footer className="flex justify-start items-center z-10 w-full">
      
       <p className="text-md p-1 text-white">Made with ♥ by <Link className="text-blue-400" href="https://x.com/0xPranavx">2Players</Link> 
       . <Link className="text-blue-400" href="https://buymeacoffee.com/praanav9994" >buy me a coffee</Link> to support me.</p>
      </footer> */}
   </div>
  );
}
