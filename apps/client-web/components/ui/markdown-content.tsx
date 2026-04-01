import type * as React from "react";
import { memo } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

const components: Partial<Components> = {
	p: ({ children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
		<p className="leading-6 not-first:mt-4 break-words" {...props}>
			{children}
		</p>
	),
	strong: ({ children, ...props }: React.HTMLAttributes<HTMLElement>) => (
		<span className="font-semibold" {...props}>
			{children}
		</span>
	),
	a: ({
		children,
		...props
	}: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
		<a
			className="font-medium underline underline-offset-4 whitespace-pre-wrap break-words text-primary"
			target="_blank"
			rel="noreferrer"
			{...props}
		>
			{children}
		</a>
	),
	ol: ({ children, ...props }: React.HTMLAttributes<HTMLOListElement>) => (
		<ol className="my-4 ml-6 list-decimal" {...props}>
			{children}
		</ol>
	),
	ul: ({ children, ...props }: React.HTMLAttributes<HTMLUListElement>) => (
		<ul className="my-4 ml-6 list-disc" {...props}>
			{children}
		</ul>
	),
	li: ({ children, ...props }: React.LiHTMLAttributes<HTMLLIElement>) => (
		<li className="mt-2 break-words" {...props}>
			{children}
		</li>
	),
	code: ({ children, className, ...props }) => {
		return (
			<code
				className={cn(
					"rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm break-words",
					className,
				)}
				{...props}
			>
				{children}
			</code>
		);
	},
};

interface MarkdownContentProps {
	content: string;
	className?: string;
}

export const MarkdownContent = memo(({ content, className }: MarkdownContentProps) => {
	return (
		<div className={className}>
			<ReactMarkdown
				remarkPlugins={[remarkGfm]}
				rehypePlugins={[rehypeRaw]}
				components={components}
			>
				{content}
			</ReactMarkdown>
		</div>
	);
});

MarkdownContent.displayName = "MarkdownContent";
