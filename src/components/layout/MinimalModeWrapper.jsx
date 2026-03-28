import React from "react";

export default function MinimalModeWrapper({ enabled, children }) {
  if (!enabled) return children;

  return (
    <div
      className='min-h-screen'
      style={{
        background: "var(--bg-main)",
        color: "var(--text-primary)",
      }}
    >
      <div className='mx-auto max-w-8xl px-6 py-8'>{children}</div>
    </div>
  );
}
