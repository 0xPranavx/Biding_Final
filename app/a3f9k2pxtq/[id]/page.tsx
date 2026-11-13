import React from 'react'
import PlayerRender from '@/components/PlayerRender'
import Image from 'next/image'

export default function Page() {
  return (
        <div className="fixed inset-0 w-screen h-screen overflow-hidden  ">
            {/* Background image (lowest layer) */}
            <img
                src="/BG.jpeg"
                alt="Background"
                className="absolute inset-0 w-full h-full object-cover -z-50"
            />

        {/* <Image src="/Bg.jpeg" alt="Background" fill className="object-cover -z-50" priority/> */}
        {/* <Image src={"/fade_gradient.svg"} alt = 'broo' fill className="absolute inset-0 w-screen h-screen object-cover" />
                <Image src={"/fade_gradient.svg"} alt = 'broo' fill className=" transform rotate-180 absolute inset-0 w-screen h-screen object-cover opacity-25" /> */}

            {/* Pattern overlay (above background) */}
         {/* <Image
  src="/pattern.png"
  alt="Pattern Overlay"
  fill
  className="object-cover -z-30"
  priority
/> */}

            {/* Header logos */}
            <div className="absolute top-2 left-0 gap-4 w-full h-fit flex justify-center items-center">
                <img
                    src="/bcca.png"
                    alt="BCCA Logo"
                    className="h-30 w-auto object-cover z-20"
                />
                <img
                    src="/font-2.png"
                    alt="Font Logo"
                    className="w-auto mt-4 h-30 object-cover z-20"
                />
                {/* <h1 className='text-6xl font-sans font-semibold'>ASHIRWAD PREMIER LEAGUE 2026</h1> */}
                <img
                    src="/acl.png"
                    alt="ACL Logo"
                    className="w-auto h-30 object-cover z-20"
                />
            </div>

           
             <PlayerRender/>
         
           
                {/* Player Image */}
            
                
                {/* Flash Effect */}
              
                
                {/* Bid Box */}
              
                
                {/* Player Name */}
             
                
                {/* Start Price */}
           
                
                {/* Current Bid with Increment/Decrement */}
           
           

                {/* Status Badge */}
            

            {/* Bidding Buttons */}
           
        </div>
  )
}
