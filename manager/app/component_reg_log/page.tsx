import { Suspense } from "react";
import Footer from "../components_home/footer";
import Nav from "../components_home/nav";
import FindUser from "./components/findUser";
import LoadingFindingUser from "./components/loadingFindingUser";
import FormRegLog from "./components/formRegLog";

export default function RegLog() {
    return(
        <>
{/*}
        <Suspense fallback = {<LoadingFindingUser></LoadingFindingUser>}>
            <FindUser></FindUser>

        </Suspense>


<FormRegLog></FormRegLog>
{*/}
        
        <Footer/>

        </>


    );
}