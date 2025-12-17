'use client';

import LoginPopup from "@/components/login-popup";
import SignupPopup from "@/components/signup-popup";

export default function AuthLayout({ children }) {
    return (
        <>
            <LoginPopup />
            <SignupPopup />
            {children}
        </>
    )
}