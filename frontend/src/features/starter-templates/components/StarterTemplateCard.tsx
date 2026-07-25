"use client"; 

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Skeleton } from "@/shared/ui/skeleton";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import TemplateImage from "./TemplateImage";
import { StarterTemplate } from "../types";

interface StarterTemplateCardProps {
  template: StarterTemplate;
  onClick: () => void;
}

export default function StarterTemplateCard({
  template,
  onClick
}: StarterTemplateCardProps) {



  return (
    <Card onClick={onClick} className="group flex flex-col transition-colors hover:border-primary/50">
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="pr-6">{template.name}</CardTitle>

          <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
        </div>
      </CardHeader>

      <CardContent>
        <TemplateImage template={template} />
      </CardContent>
    </Card>
  );
}