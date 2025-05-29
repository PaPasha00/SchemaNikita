import React, { useEffect, useRef } from "react";
import type { SourceType } from "../types/dataTypes";

interface TypeBlockProps {
  type: SourceType;
  countryIndex: number;
  typeIndex: number;
  registerPosition: (id: string, rect: DOMRect) => void;
}

export const TypeBlock: React.FC<TypeBlockProps> = ({
  type,
  countryIndex,
  typeIndex,
  registerPosition,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      registerPosition(
        `country-${countryIndex}-type-${typeIndex}`,
        ref.current.getBoundingClientRect()
      );
    }
  }, [countryIndex, typeIndex, registerPosition]);

  return (
    <div ref={ref} className="w-full">
      <div className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl px-6 py-3 shadow-lg">
        <span className="font-bold text-lg">{type.type}</span>
      </div>
    </div>
  );
};
