"use client";

import { useMemo } from "react";
import type { AnchorHTMLAttributes } from "react";

import {
  MessageResponse,
  type MessageResponseProps,
} from "@/components/ai-elements/message";
import { streamdownPlugins } from "@/core/streamdown";
import { cn } from "@/lib/utils";

import { CitationLink } from "../citations/citation-link";

function isExternalUrl(href: string | undefined): boolean {
  return !!href && /^https?:\/\//.test(href);
}

const SAFE_PROTOCOL_RE = /^(https?|ircs?|mailto|xmpp)$/i;

/**
 * Custom URL transform that allows data: URIs for images.
 * react-markdown v10's defaultUrlTransform blocks all protocols not in its
 * safelist, which includes `data:`. Generated images from models use
 * `data:image/jpeg;base64,...` URLs which would otherwise be cleared.
 */
function urlTransform(url: string, key: string): string {
  if (key === "src" && url.startsWith("data:image/")) {
    return url;
  }

  const colon = url.indexOf(":");
  const questionMark = url.indexOf("?");
  const numberSign = url.indexOf("#");
  const slash = url.indexOf("/");

  if (
    colon === -1 ||
    (slash !== -1 && colon > slash) ||
    (questionMark !== -1 && colon > questionMark) ||
    (numberSign !== -1 && colon > numberSign) ||
    SAFE_PROTOCOL_RE.test(url.slice(0, colon))
  ) {
    return url;
  }

  return "";
}

export type MarkdownContentProps = {
  content: string;
  isLoading: boolean;
  rehypePlugins: MessageResponseProps["rehypePlugins"];
  className?: string;
  remarkPlugins?: MessageResponseProps["remarkPlugins"];
  components?: MessageResponseProps["components"];
};

/** Renders markdown content. */
export function MarkdownContent({
  content,
  rehypePlugins,
  className,
  remarkPlugins = streamdownPlugins.remarkPlugins,
  components: componentsFromProps,
}: MarkdownContentProps) {
  const components = useMemo(() => {
    return {
      a: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => {
        if (typeof props.children === "string") {
          const match = /^citation:(.+)$/.exec(props.children);
          if (match) {
            const [, text] = match;
            return <CitationLink {...props}>{text}</CitationLink>;
          }
        }
        const { className, target, rel, ...rest } = props;
        const external = isExternalUrl(props.href);
        return (
          <a
            {...rest}
            className={cn(
              "text-primary decoration-primary/30 hover:decoration-primary/60 underline underline-offset-2 transition-colors",
              className,
            )}
            target={target ?? (external ? "_blank" : undefined)}
            rel={rel ?? (external ? "noopener noreferrer" : undefined)}
          />
        );
      },
      ...componentsFromProps,
    };
  }, [componentsFromProps]);

  if (!content) return null;

  return (
    <MessageResponse
      className={className}
      remarkPlugins={remarkPlugins}
      rehypePlugins={rehypePlugins}
      components={components}
      urlTransform={urlTransform}
    >
      {content}
    </MessageResponse>
  );
}
