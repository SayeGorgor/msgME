'use client';

import HeaderUnAuth from "@/components/header-unauth";
import LoginPopup from "@/components/login-popup";
import SignupPopup from "@/components/signup-popup";

export default function AuthLayout({ children }) {
    return (
        <>
            <LoginPopup />
            <SignupPopup />
            <HeaderUnAuth />
            {children}
        </>
    )
}