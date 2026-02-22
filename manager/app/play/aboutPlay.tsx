import Link from "next/link";

export default function AboutPlay(){

    return(

<div className="relative w-full mt-16 flex justify-center mt-20">
  

  <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-gray-800 rounded-3xl"></div>

  <div className="relative z-10 w-full max-w-5xl backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl px-12 py-14 shadow-2xl text-center">
    
    <h1 className="text-4xl md:text-5xl font-extrabold text-white">
      Let’s Play
      <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
        FM on Web
      </span>
    </h1>

    <p className="mt-6 text-gray-300 text-lg">
      Football Manager experience for the web users.
    </p>

    <div className="mt-10 flex justify-center gap-4">
    <Link href={"../game"}>
      <button className="px-7 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 transition font-semibold text-white">
        Start Game
      </button>
    </Link>
    </div>

  </div>
</div>);
}