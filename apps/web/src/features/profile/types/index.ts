

export interface ProfilePayload {
    name: string;
}

export interface updatePasswordPayload {
    currentPassword: string; 
    newPassword: string; 
    confirmPassword: string;
}