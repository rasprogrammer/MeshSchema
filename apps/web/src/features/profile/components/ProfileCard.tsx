import { Camera } from "lucide-react";
import React, { useRef, useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { useProfile, useAvatarUpdate } from "../hooks/useProfile";
import { useAuthStore } from "@/store/auth.store";

interface Props {
    onUpdatePassword: () => void;
}

export function ProfileCard({ onUpdatePassword }: Props) {
    // Mock user data initial state
    const storeUser = useAuthStore((s) => s.user);
    const profile = useProfile();
    const avatarUpdate = useAvatarUpdate();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [name, setName] = useState(storeUser?.name || "");

    // Fixed TypeScript type and syntax error
    const handleProfileUpdate = (e: React.FormEvent<HTMLFormElement | HTMLButtonElement>) => {
        e.preventDefault();
        // Fixed syntax error and object property shorthand
        profile.mutate({ name });
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            avatarUpdate.mutate(file);
        }
        e.target.value = "";
    };

    return (
        <div className="space-y-6">
        {/* Avatar */}
        <Card>
            <CardContent className="flex flex-col items-center gap-5 py-8 md:flex-row">
            <Avatar className="h-28 w-28">
                <AvatarImage src={storeUser?.avatarUrl} />
                <AvatarFallback className="text-3xl">
                {storeUser?.name ? storeUser.name[0] : "?"}
                </AvatarFallback>
            </Avatar>

            <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-semibold">{storeUser?.name}</h2>

                <p className="text-muted-foreground">
                {storeUser?.email}
                </p>
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="hidden"
                onChange={handleAvatarChange}
            />

            <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={avatarUpdate.isPending}
            >
                <Camera className="mr-2 h-4 w-4" />
                {avatarUpdate.isPending ? "Uploading…" : "Change Photo"}
            </Button>
            </CardContent>
        </Card>

        {/* Personal Information */}
        <Card>
            <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            </CardHeader>

            <CardContent className="space-y-5">
            <div className="space-y-2">
                <Label htmlFor="name-input">Name</Label>

                <Input
                id="name-input"
                value={name} // Controlled component
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="email-input">Email</Label>

                <Input
                id="email-input"
                defaultValue={storeUser?.email}
                disabled
                />
            </div>

            <div className="flex justify-end">
                {/* Changed to type="button" since it's not in a <form> */}
                <Button type="button" onClick={handleProfileUpdate}>
                Save Changes
                </Button>
            </div>
            </CardContent>
        </Card>

        {/* Security */}
        <Card>
            <CardHeader>
            <CardTitle>Security</CardTitle>
            </CardHeader>

            <CardContent className="flex items-center justify-between">
            <div>
                <h4 className="font-medium">
                Password
                </h4>

                <p className="text-sm text-muted-foreground">
                Change your account password
                </p>
            </div>

            <Button onClick={onUpdatePassword}>
                Update Password
            </Button>
            </CardContent>
        </Card>
        </div>
    );
}
