import Footer from "../components_home/footer";
import Nav from "../components_home/nav";
import GetTeams from "../fetch/getTeams";

export default function Info() {


    return(
        <>
        <Nav/>
         <GetTeams></GetTeams>
       
        <Footer/>
        </>


    );
}