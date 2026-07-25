import { Skeleton } from "@/shared/ui/skeleton";
import Image from "next/image";
import { StarterTemplate } from "../types";


export default function TemplateImage({template}: {template: StarterTemplate}) {

    if (!template.image) {
        return <Skeleton className="h-[100%] m-2" />;
    }

    return <>
          <Image
            src={template.image}
            alt={template.name}
            width={400}
            height={240}
            className="w-full rounded-md object-cover"
          />
    </>
}