/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useState } from "react";

type Props = {
  size?: number;
  src?: string; // default: "/images/drdee-logo.jpg" in public/
  alt?: string;
};

export default function ClinicLogo({
  size = 56,
  src = "/images/drdee-logo.jpg",
  alt = "Clinic Logo",
}: Props) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        aria-label="Clinic Logo Placeholder"
        style={{
          width: size,
          height: size,
          borderRadius: 8,
          background: "#1abc9c",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 700,
          fontFamily: "Times New Roman, serif",
          fontSize: Math.max(10, Math.round(size / 3)),
        }}
      >
        DR DEE
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      height={size}
      style={{ display: "block", height: size, width: "auto" }}
      onError={() => setFailed(true)}
    />
  );
}
