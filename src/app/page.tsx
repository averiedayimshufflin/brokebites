"use client" 

import DemoFilterTags from "@/components/DemoFilterTags"
import SignUpComponent from "@/components/SignUpComponent";
import SpinningCard from "@/components/SpinningCard";
export default function Home() {

   return(
    <>
    <main className="min-h-screen flex items-center justify-center flex-col gap-10 p-6">
    <DemoFilterTags/>
    <SpinningCard/>
    <SignUpComponent/>
     </main>
    </>
   );
}
