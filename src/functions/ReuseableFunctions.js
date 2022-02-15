import { useState, useEffect } from "react";
import { db, storage, firebase } from "../core/firebase/firebase";
import { useMediaQuery } from "react-responsive";
import { motion, useMotionValue } from "framer-motion";
import { useInView } from "react-intersection-observer";
import CountUp from "react-countup";
import VisibilitySensor from "react-visibility-sensor";
import { ToastContainer, toast } from "react-toastify";
import validator from "validator";
import axios from "axios";


export function axios_call(method,url, data) {
    return new Promise(function (resolve, reject) {
    var access_token = JSON.parse((window.localStorage.getItem("access_token")));
    var refresh_token = JSON.parse((window.localStorage.getItem("refresh_token")));
    axios({
        method: method,
        url: 'https://larasoftbackend.pythonanywhere.com/'+ url,
        data:data,
        headers: {"Authorization" : `Bearer ${access_token}`}
        }).then((response) => {
            resolve(response.data)
        }).catch((response)=>{
            axios({
                method: 'POST',
                url: "https://larasoftbackend.pythonanywhere.com/api/token/refresh/",
                data:{refresh:refresh_token},
                }).then((response) => {
               window.localStorage.setItem("access_token", JSON.stringify(response.data.access));
               axios({
                method: method,
                url: 'https://larasoftbackend.pythonanywhere.com/'+ url,
                data:data,
                headers: {"Authorization" : `Bearer ${response.data.access}`}
                }).then((response) => {
                    resolve(response.data)
                });
                }).catch((response)=>{
                    logout() 
                })
 }) 
    })
}

    


export function axios_call_auto(method,url, data) {
    return new Promise(function (resolve, reject) {
    var access_token = JSON.parse((window.localStorage.getItem("access_token")));
    var refresh_token = JSON.parse((window.localStorage.getItem("refresh_token")));
    axios({
        method: method,
        url:  url,
        data:data,
        headers: {"Authorization" : `Bearer ${access_token}`}
        }).then((response) => {
            resolve(response.data)
        }).catch((response)=>{
            axios({
                method: 'POST',
                url: "https://larasoftbackend.pythonanywhere.com/api/token/refresh/",
                data:{refresh:refresh_token},
                }).then((response) => {
               window.localStorage.setItem("access_token", JSON.stringify(response.data.access));
               axios({
                method: method,
                url: url,
                data:data,
                headers: {"Authorization" : `Bearer ${response.data.access}`}
                }).then((response) => {
                    resolve(response.data)
                });
                }).catch((response)=>{
                    logout() 
                })
 }) 
    })
}

    
    



export function isAuthenticated() {
	return new Promise(function (resolve, reject) {
		
		var user = firebase.auth().currentUser;
        resolve(user);
	
	});
}




export function isAdmin() {
	return new Promise(function (resolve, reject) {
		var user = firebase.auth().currentUser;
		db.collection("Admin")
			.doc("4ESMOgHfdctZaKaenYqC")
			.get()
			.then((response) => {
				var admins = { ...response.data() };
				admins = admins.admins;
				var n = admins.includes(user.uid);
				console.log("hi");
				console.log(n);
				if (n) {
					resolve(user);
				}
				resolve(false);
			})
			.catch((error) => {
				console.log(error);
			});
	});
}

export function login() {
	return new Promise(function (resolve, reject) {
		const provider = new firebase.auth.GoogleAuthProvider();
		firebase
			.auth()
			.signInWithPopup(provider)
			.then((data) => {
					console.log(data);
					resolve(data);
                    if(data.additionalUserInfo.isNewUser){
                        axios({
                            method: "POST",
                            url: "https://larasoftbackend.pythonanywhere.com/register/",
                            data: {
                                username:data.user.email,
                                password:data.user.uid
                            },
                        }).then((response) => {
                            axios({
                                method: "POST",
                                url: "https://larasoftbackend.pythonanywhere.com/api/jwt_token/",
                                data: {
                                    username:data.user.email,
                                    password:data.user.uid
                                },
                            }).then((response) => {
                                console.log(response.data);
                                window.localStorage.setItem("refresh_token", JSON.stringify(response.data.refresh));
                                window.localStorage.setItem("access_token", JSON.stringify(response.data.access));
                                })
                        })
                    }
                    else{
                        axios({
                            method: "POST",
                            url: "https://larasoftbackend.pythonanywhere.com/api/jwt_token/",
                            data: {
                                username:data.user.email,
                                password:data.user.uid
                            },
                        }).then((response) => {
                            console.log(response.data);
                            window.localStorage.setItem("refresh_token", JSON.stringify(response.data.refresh));
                            window.localStorage.setItem("access_token", JSON.stringify(response.data.access));
                        })
                    }
				
			});
	});
}



export function logout() {
	const toastifylogout = () => {
		toast.error("logout Sucessfull!", {
			position: "bottom-right",
			autoClose: 2000,
			hideProgressBar: true,
			closeOnClick: true,
			pauseOnHover: true,
			draggable: false,
			className: "submit-feedback danger",
			toastId: "notifyToast",
		});
	};
	return new Promise(function (resolve, reject) {
		const data = firebase.auth().signOut();
		window.localStorage.removeItem("emailForSignIn");
		resolve(true);
		setTimeout(() => {
            window.localStorage.removeItem("access_token");
            window.localStorage.removeItem("refresh_token");
		}, 2000);
	});
}

export function emaillogin(email) {
	return new Promise(function (resolve, reject) {
		console.log(email);
		var actionCodeSettings = {
			url: "http://localhost:3000",
			// This must be true.
			handleCodeInApp: true,
		};

		console.log(actionCodeSettings);

		firebase
			.auth()
			.sendSignInLinkToEmail(email, actionCodeSettings)
			.then(() => {
				console.log("emaillogin sent");
				window.localStorage.setItem("emailForSignIn", email);
				resolve(true);
			})
			.catch((error) => {
				var errorCode = error.code;
				var errorMessage = error.message;
				resolve(false);
			});
	});
}

//validation_function
//validation for first name lastname
export function validation_name(value) {
	var format = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?0-9]+/;
	if (value == "" || value != "not_selected") {
		console.log(value);
		if (value) {
			if (!value.startsWith(" ")) {
				if (value.length >= 1) {
					if (!format.test(value)) {
						if (value.length <= 50) {
							if (!value.endsWith(" ")) {
								return {
									class: "pass",
								};
							} else
								return {
									class: "warn",
									msg: (
										<>
											<small class="text-danger">
												Cannot end with a white space
											</small>
										</>
									),
								};
						} else
							return {
								class: "warn",
								msg: (
									<>
										<small class="text-danger">Max letter 50</small>
									</>
								),
							};
					} else
						return {
							class: "warn",
							msg: (
								<>
									<small class="text-danger">
										Cannot contain symbol or number.
									</small>
								</>
							),
						};
				} else
					return {
						class: "warn",
						msg: (
							<>
								<small class="text-danger">Min 1 tetter.</small>
							</>
						),
					};
			} else
				return {
					class: "warn",
					msg: (
						<>
							<small class="text-danger">Cannot start with empty space</small>
						</>
					),
				};
		} else
			return {
				class: "warn",
				msg: (
					<>
						<small class="text-danger">This field is a required.</small>
					</>
				),
			};
	}
	if (value == "not_selected") return "";
}
//contact form title
export function validation_title(value) {
	if (value == "" || value != "not_selected") {
		console.log(value);
		if (value) {
			if (!value.startsWith(" ")) {
				if (value.length >= 1) {
					if (value.length <= 150) {
						if (!value.endsWith(" ")) {
							return {
								class: "pass",
							};
						} else
							return {
								class: "warn",
								msg: (
									<>
										<small class="text-danger">
											Cannot end with white space
										</small>
									</>
								),
							};
					} else
						return {
							class: "warn",
							msg: (
								<>
									<small class="text-danger">Max length is 150</small>
								</>
							),
						};
				} else
					return {
						class: "warn",
						msg: (
							<>
								<small class="text-danger">Min length is 1</small>
							</>
						),
					};
			} else
				return {
					class: "warn",
					msg: (
						<>
							<small class="text-danger">Cannot start with white space</small>
						</>
					),
				};
		} else return "";
	}
	if (value == "not_selected") return "";
}

export function validation_mobile_number(value) {
	if (value == "" || value != "not_selected") {
		console.log(value);
		var phoneno = /^\d{10}$/;
		if (value) {
			if (phoneno.test(value)) {
				return {
					class: "pass",
				};
			} else {
				return {
					class: "warn",
					msg: (
						<>
							<small class="text-danger">
								Please Enter A Valid Phone Number
							</small>
						</>
					),
				};
			}
		} else
			return {
				class: "warn",
				msg: (
					<>
						<small class="text-danger">This field is a required.</small>
					</>
				),
			};
	}
	if (value == "not_selected") return "";
}
//company validation
export function validation_company(value) {
	if (value == "" || value != "not_selected") {
		console.log(value);
		if (value) {
			if (!value.startsWith(" ")) {
				if (value.length >= 1) {
					if (value.length <= 50) {
						if (!value.endsWith(" ")) {
							return {
								class: "pass",
							};
						} else
							return {
								class: "warn",
								msg: (
									<>
										<small class="text-danger">
											Cannot end with white space
										</small>
									</>
								),
							};
					} else
						return {
							class: "warn",
							msg: (
								<>
									<small class="text-danger">Max length is 150</small>
								</>
							),
						};
				} else
					return {
						class: "warn",
						msg: (
							<>
								<small class="text-danger">Min length is 1</small>
							</>
						),
					};
			} else
				return {
					class: "warn",
					msg: (
						<>
							<small class="text-danger">Cannot start with white space</small>
						</>
					),
				};
		} else
			return {
				class: "warn",
				msg: (
					<>
						<small class="text-danger">This field is a required.</small>
					</>
				),
			};
	}
	if (value == "not_selected") return "";
}
// email validation
export function validation_email(value) {
	if (value == "" || value != "not_selected") {
		console.log(value);
		var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{3,4})+$/; //{3,4}is used to change the count of word after .com or net
		if (value) {
			if (regex.test(value)) {
				return {
					class: "pass",
				};
			} else {
				return {
					class: "warn",
					msg: (
						<>
							<small class="text-danger">Please enter a valid E-mail</small>
						</>
					),
				};
			}
		} else {
			return {
				class: "warn",
				msg: (
					<>
						<small class="text-danger">This field is a required.</small>
					</>
				),
			};
		}
	}
	if (value == "not_selected") return "";
}
//country validation

export function validation_country(value) {
	var format = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?0-9]+/;
	if (value == "" || value != "not_selected") {
		console.log(value);
		if (value) {
			if (!value.startsWith(" ")) {
				if (value.length >= 1) {
					if (value.length <= 56) {
						if (!value.endsWith(" ")) {
							if (!format.test(value)) {
								return {
									class: "pass",
								};
							} else
								return {
									class: "warn",
									msg: (
										<>
											<small class="text-danger">invalid name</small>
										</>
									),
								};
						} else
							return {
								class: "warn",
								msg: (
									<>
										<small class="text-danger">
											Cannot end with white space
										</small>
									</>
								),
							};
					} else
						return {
							class: "warn",
							msg: (
								<>
									<small class="text-danger">Max length is 56</small>
								</>
							),
						};
				} else
					return {
						class: "warn",
						msg: (
							<>
								<small class="text-danger">Min length is 1</small>
							</>
						),
					};
			} else
				return {
					class: "warn",
					msg: (
						<>
							<small class="text-danger">Cannot start with white space</small>
						</>
					),
				};
		} else return "warn";
	}
	if (value == "not_selected") return "warn";
}

// validation for inquiry
export function validation_inquiry(value) {
	if (value == "" || value != "not_selected") {
		console.log(value);
		if (value) {
			if (!value.startsWith(" ")) {
				if (value.length >= 1) {
					if (value.length <= 50) {
						if (!value.endsWith(" ")) {
							return {
								class: "pass",
							};
						} else
							return {
								class: "warn",
								msg: (
									<>
										<small class="text-danger">
											Cannot end with white space
										</small>
									</>
								),
							};
					} else
						return {
							class: "warn",
							msg: (
								<>
									<small class="text-danger">Max length is 150</small>
								</>
							),
						};
				} else
					return {
						class: "warn",
						msg: (
							<>
								<small class="text-danger">Min length is 1</small>
							</>
						),
					};
			} else
				return {
					class: "warn",
					msg: (
						<>
							<small class="text-danger">Cannot start with white space</small>
						</>
					),
				};
		} else return "";
	}
	if (value == "not_selected") return "";
}

//comment validation
export function validation_comment(value) {
	if (value == "" || value != "not_selected") {
		console.log(value);
		if (value) {
			if (!value.startsWith(" ")) {
				if (value.length >= 1) {
					if (value.length <= 250) {
						if (!value.endsWith(" ")) {
							return {
								class: "pass_text_area",
							};
						} else
							return {
								class: "warn_text_area",
								msg: (
									<>
										<small class="text-danger">
											Cannot end with white space
										</small>
									</>
								),
							};
					} else
						return {
							class: "warn_text_area",
							msg: (
								<>
									<small class="text-danger">Max length is 250</small>
								</>
							),
						};
				} else
					return {
						class: "warn_text_area",
						msg: (
							<>
								<small class="text-danger">Min length is 1</small>
							</>
						),
					};
			} else
				return {
					class: "warn_text_area",
					msg: (
						<>
							<small class="text-danger">Cannot start with white space</small>
						</>
					),
				};
		} else
			return {
				class: "warn_text_area",
				msg: (
					<>
						<small class="text-danger">This field is a required.</small>
					</>
				),
			};
	}
	if (value == "not_selected") return "";
}
export function debounce(func, wait, immediate) {
	var timeout;
	return function () {
		var context = this,
			args = arguments;
		var later = function () {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
}