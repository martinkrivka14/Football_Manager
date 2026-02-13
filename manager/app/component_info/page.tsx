'use client'

import { Suspense } from "react";
import Footer from "../components_home/footer";
import Nav from "../components_home/nav";
import LoadingTeams from "./loading";
import { Button } from "@/components/ui/button";

export default function Info() {


    const handleSubmit = async () => {
    await fetch('/api/fetch', {
    method: 'GET'
  });
};


    return(

        <div className="flex min-h-screen items-center justify-center  font-sans bg-black">
      
            <Nav/>

            {/*<Suspense fallback = {<LoadingTeams/>}>
            <GetTeams/>
            </Suspense>*/}
        <>
            <Button onClick={handleSubmit}>Akutalizovat databazi</Button>
            <Footer/>
        </>
        
            

        </div>
    );
}