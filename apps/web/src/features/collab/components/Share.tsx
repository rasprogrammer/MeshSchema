import { Button } from "@/shared/ui/button";
import { Share2, StopCircle } from "lucide-react";
import { useState } from "react";
import { generateRoomSlug } from "@/lib/utils";

interface ShareProps {
  projectId: string;
  collabEnabled: boolean;
  sessionId: string | null;
  onStartSession: () => void;
  onStopSession: () => void;
}

// Share button 
export const Share = ({ projectId, collabEnabled, sessionId, onStartSession, onStopSession }: ShareProps) => {

    const [openShareBody, setOpenShareBody] = useState(false);

    return (
        <>
            <Button variant={collabEnabled ? "default" : "secondary"} size="sm" onClick={() => setOpenShareBody(true)}>
                <Share2 className="h-4 w-4" /> Share
            </Button>
            {openShareBody && (
                <ShareBody 
                    setOpenShareBody={setOpenShareBody}
                    projectId={projectId}
                    collabEnabled={collabEnabled}
                    sessionId={sessionId}
                    onStartSession={onStartSession}
                    onStopSession={onStopSession}
                />
            )}
        </>
    );
};


// this component will be like dialog box with close (cross) button, it will be opened when user click on share button
// cover full screen with black opacity background, and in the center will be a white box with text "Share this project" and a button "Copy Link" and a button "Close" 
export const ShareBody = ({ 
    setOpenShareBody,
    projectId,
    collabEnabled,
    sessionId,
    onStartSession,
    onStopSession 
}: { 
    setOpenShareBody: (open: boolean) => void;
    projectId: string;
    collabEnabled: boolean;
    sessionId: string | null;
    onStartSession: () => void;
    onStopSession: () => void;
}) => {

    const handleStartSession = () => {
        onStartSession();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="flex flex-col items-center justify-center gap-4 rounded bg-white text-black p-8 max-w-sm w-full">
                <h5 className="text-lg font-medium">Live collaboration</h5>
                <p className="text-center text-sm text-gray-600">
                    {collabEnabled 
                        ? "Session is active! People with the link can join your drawing." 
                        : "Start a session to invite people to collaborate on your drawing."}
                </p>
                
                {collabEnabled && sessionId ? (
                    <div className="flex flex-col gap-2 w-full">
                        <Button variant="default" size="sm" onClick={() => {
                            const link = `${window.location.origin}/collab/${sessionId}`;
                            navigator.clipboard.writeText(link);
                            alert("Link copied to clipboard: " + link);
                        }}>
                            <Share2 className="mr-2 h-4 w-4" />
                            Copy Collab Link
                        </Button>
                        <Button variant="destructive" size="sm" onClick={onStopSession}>
                            <StopCircle className="mr-2 h-4 w-4" />
                            Stop Session
                        </Button>
                    </div>
                ) : (
                    <Button variant="default" size="sm" onClick={handleStartSession} className="w-full">
                        Start Session
                    </Button>
                )}
                
                <Button variant="ghost" size="sm" onClick={() => setOpenShareBody(false)} className="w-full">
                    Close
                </Button>
            </div>
        </div>
    );
};
