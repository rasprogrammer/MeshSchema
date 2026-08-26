import { Button } from "@/shared/ui/button";
import { Share2 } from "lucide-react";
import { useState } from "react";
import { generateRoomSlug } from "@/lib/utils";

// Share button 
export const Share = () => {

    const [openShareBody, setOpenShareBody] = useState(false);

    return (
        <>
            <Button variant="secondary" size="sm"  onClick={() => setOpenShareBody(true)}>
                <Share2 className="h-4 w-4" /> Share
            </Button>
            {openShareBody && <ShareBody setOpenShareBody={setOpenShareBody} />}
        </>
    );
};


// this component will be like dialog box with close (cross) button, it will be opened when user click on share button
// cover full screen with black opacity background, and in the center will be a white box with text "Share this project" and a button "Copy Link" and a button "Close" 
export const ShareBody = ({ setOpenShareBody }: { setOpenShareBody: (open: boolean) => void }) => {

    

    const startSession = () => {
        

        const roomSlug = generateRoomSlug();
        console.log(`Room slug: ${roomSlug}`);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="flex flex-col items-center justify-center gap-4 rounded bg-white text-black p-8">
                <h5 className="text-lg font-medium">Live collaboration</h5>
                <p>Invite people to collaborate on your drawing.</p>
                {/* start session button  */}
                <Button variant="secondary" size="sm" onClick={startSession}>Start Session</Button>
                <Button variant="ghost" size="sm" onClick={() => setOpenShareBody(false)}>Close</Button>
            </div>
        </div>
    );
};

