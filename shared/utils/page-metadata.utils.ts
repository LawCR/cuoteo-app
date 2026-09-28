import type { Metadata } from "next";
import { env } from "@/core/env";

export const APP_NAME = "Cuoteo";
export const APP_DEFAULT_DESCRIPTION =
  "Divide gastos en grupo, cobra en soles y liquida con tus amigos en Perú.";

const APP_ORIGIN = env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");

interface IBuildPageMetadataInput {
  title: string;
  description: string;
  path: string;
  absoluteTitle?: boolean;
}

export function buildPageMetadata({
  title,
  description,
  path,
  absoluteTitle = false,
}: IBuildPageMetadataInput): Metadata {
  const url = `${APP_ORIGIN}${path}`;
  const brandedTitle = absoluteTitle ? title : `${title} | ${APP_NAME}`;

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: brandedTitle,
      description,
      url,
      siteName: APP_NAME,
      locale: "es_PE",
      type: "website",
    },
    twitter: {
      card: "summary",
      title: brandedTitle,
      description,
    },
  };
}
