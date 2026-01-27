import Image from "next/image";
import FormForPitch from "./form/FormForPitch";
import { PitchesInfo } from "./info/PitchesInfo";
import { AddingButton } from "./buttons/AddingButton";
import Nav from "./components_home/nav";
import Info from "./components_home/info";
import { Play } from "next/font/google";
import PlayButton from "./components_home/playButton";
import Footer from "./components_home/footer";
import Link from "next/link";

export default function Home() {



  return (
    <div className="flex min-h-screen items-center justify-center  font-sans dark:bg-black">

    

      <Nav/>
      <Info name={"Football Manager"} info={"Welcome to the Football Manager game!"}/>
      <div className="flex justify-center absolute mt-50">
        <Link href="/component_play"> <PlayButton/> </Link>
        
      </div>

      <Footer/>




    </div>
  );
}
