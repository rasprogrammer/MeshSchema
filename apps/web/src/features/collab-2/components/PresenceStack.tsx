"use client";

interface Peer {
  id: string;
  name?: string;
  email: string;
  color: string;
}

interface Props {
  peers: Peer[];
}

/** Small stack of avatar initials showing who else has this project open. */
export function PresenceStack({ peers }: Props) {
  if (peers.length === 0) return null;

  return (
    <div className="flex items-center -space-x-2">
      {peers.slice(0, 5).map((peer) => (
        <div
          key={peer.id}
          title={peer.name || peer.email}
          className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-card text-[11px] font-semibold text-white shadow-sm"
          style={{ backgroundColor: peer.color }}
        >
          {(peer.name || peer.email).slice(0, 1).toUpperCase()}
        </div>
      ))}
      {peers.length > 5 && (
        <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-card bg-muted text-[10px] font-medium text-muted-foreground">
          +{peers.length - 5}
        </div>
      )}
    </div>
  );
}
