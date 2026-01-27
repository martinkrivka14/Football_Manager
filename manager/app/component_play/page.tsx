import Footer from "../components_home/footer";
import Info from "../components_home/info";
import Nav from "../components_home/nav";

export default function Play() {
    return(

    <div className="flex min-h-screen items-center justify-center  font-sans dark:bg-black">


        <>
        <Nav/>
        <Footer/>
        <Info name={"Play"} info={"Lets play our manager"}/>
        </>

    </div>


    );
}