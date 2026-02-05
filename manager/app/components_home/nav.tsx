import Link from "next/link";
import Image from "next/image";

export default function Nav() {
    return(

      

  
        <nav className="fixed top-4 left-1/2 -translate-x-1/2 flex justify-around items-center border-b-2 border-white w-[95vw] max-w-4xl h-16 px-8 rounded-lg bg-black/50 backdrop-blur-xl text-white">
          

          <Link href="/">
          <h3 className="text-xl text-white font-bold cursor-pointer transition-transform hover:">
            Home
          </h3>
          </Link>

          <Link href="/component_play">
          <h3 className="text-xl text-white font-bold cursor-pointer transition-transform hover:scale-110">
            Play
          </h3>
          </Link>

          <Link href="/component_info">
          <h3 className="text-xl text-white font-bold cursor-pointer transition-transform hover:scale-110">
            Info
          </h3>
          </Link>

          <Link href="/component_reg_log">
          <h3 className="text-xl text-white font-bold cursor-pointer transition-transform hover:scale-110">
            Register/Login
          </h3></Link>

        </nav>
    );
}