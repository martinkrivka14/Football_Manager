import Footer from "../components_home/footer";
import Info from "../components_home/info";
import Nav from "../components_home/nav";
import AboutPlay from "./aboutPlay";

export default function Play() {
    return(

    <div className="flex  items-center justify-center font-sans dark:bg-black min-h-screen bg-black">


        <>
        <Nav/>
        <div className="grid grid-cols-1" >
            <AboutPlay/>
        </div>
        <Footer/>
        </>

    </div>


    );
}