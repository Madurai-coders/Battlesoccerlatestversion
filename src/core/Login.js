import React from "react";
import logo from "../assets/images/Bslogo.png";
import facebook from "../assets/images/facebook.png"
import "../assets/css/Login/login.css"
import { FcGoogle } from "react-icons/fc";
import { useMediaQuery } from "react-responsive";

export default function Home() {
    const isMobile = useMediaQuery({ query: "(max-width: 385px)" });

    return(
      <>
      {isMobile && (
      <div className="bslogin_cover d-flex justify-content-center align-items-center"> 
          <div className="bslogin_itemcontainer text-center">
              <img classname="bslogin_logo" alt="Battlesoccer logo" src={logo}/>
              <div className="bslogin_mobnumtext"> Add your mobile phone number to get started</div>
              <div><input type="tel" className="bslogin_phonenumber" id="phone" name="phone" placeholder="Phone Number" pattern="[0-9]{10}" required /> </div>
              <div className="bslogin_ortext">OR</div> 
              <div className="bslogin_googlebutton"><FcGoogle size={25} />{"  "}<span>Login with Google</span></div>
              <div className="bslogin_fbbutton"> <img src={facebook} width="25px" height="25px" alt="Facebook login"/> {"  "} <span>Login with Facebook</span></div>      
          </div>
      </div>
      )}
      </>
    );
}