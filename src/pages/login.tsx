import React, { useEffect } from "react";
import { useAuth } from "../components/layout/auth.service";
import { useRouter } from 'next/router';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function Login(): JSX.Element {
    const router = useRouter();
    const { user, signIn } = useAuth();

    useEffect(() => {
        console.log('User:', user);
        if (user && user.isNew) {
            router.push('/user/onboarding');
        } else if (user) {
            router.push('/user/dashboard');
        }
    }, [user, router]);

    const handleSignIn = async () => {
        try {
            await signIn();
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <Card className="w-[350px]">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl text-center">Login with your NetID</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                    <div className="relative w-24 h-24 mb-4">
                        <Image
                            src="/images/blockI.gif"
                            alt="BlockIGif"
                            layout="fill"
                            objectFit="contain"
                        />
                    </div>
                    <Button
                        onClick={handleSignIn}
                        className="w-full bg-uiucorange hover:bg-uiucorange/90"
                    >
                        Continue
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}