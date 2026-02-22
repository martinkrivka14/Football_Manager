import InfoGame from "./info/info";
import NavMenuGame from "./menu/navMenu";

export default function MainPageGame(){
    return(

        <div className="bg-black min-h-screen flex items-center justify-center font-sans">
            <>
        <InfoGame/>
        <NavMenuGame/>
            </>
        </div>


    );

}