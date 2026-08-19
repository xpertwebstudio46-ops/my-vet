interface InvertedCornerProps {
  /** size in px, keep this small — 16 to 32 usually looks right */
  size?: number;
  corner: "tl" | "tr" | "bl" | "br";
  /** must match the background color behind it (page/section bg) */
  color?: string;
  className?: string;
}

export default function InvertedCorner({
  size = 24,
  corner,
  color = "#ffffff",
  className = "",
}: InvertedCornerProps) {
  return (
    <svg
      width={size}
      height={size}
      className={className}
      style={{ display: "block", overflow: "hidden" }}
      aria-hidden="true"
      data-corner={corner}
    >
      <rect width="100%" height="100%" fill={color} />
    </svg>
  );
}
