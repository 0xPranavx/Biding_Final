import React from 'react'
import PlayerRender from '@/components/PlayerRender'
import Image from 'next/image'

export default function Page() {
  return (
        <div className="fixed inset-0 w-screen h-screen overflow-hidden  ">
            {/* Background image (lowest layer) */}
            {/* <img
                src="/background.png"
                alt="Background"
                className="absolute inset-0 w-full h-full object-cover -z-50"
            /> */}

        <Image src="/background.png" alt="Background" fill className="object-cover -z-50" priority/>

            {/* Pattern overlay (above background) */}
         <Image
  src="/pattern.png"
  alt="Pattern Overlay"
  fill
  className="object-cover -z-30"
  priority
/>

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
