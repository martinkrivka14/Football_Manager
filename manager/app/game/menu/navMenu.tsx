import Link from "next/link";

export default function NavMenuGame(){


    return(
<div className="
                fixed 
                left-6 
                top-45/100 
                -translate-y-1/2
                bg-[#0D1B2A]/95
                text-white
                rounded-2xl
                shadow-2xl
                p-6
                w-56">

    <h3 className="text-xl font-bold mb-4 tracking-wide text-[#00B8D9]">
        Menu
    </h3>

    <nav className="flex flex-col gap-2">
        {[
            "Home",
            "Team",
            "Training",
            "League",
            "Schedule",
            "Players",
            "Club",
            "Transfers",
            "Academy",
        ].map(item => (
            <Link
            
                href = {`game/page/${item.toLowerCase()}`}
                key={item}
                className="cursor-pointer 
                           px-3 py-2 
                           rounded-lg 
                           transition-all 
                           duration-200 
                           hover:bg-[#00B8D9] 
                           hover:text-[#0D1B2A]
                           hover:translate-x-1">
                {item}
            </Link>
        ))}
    </nav>
</div>

    );
}