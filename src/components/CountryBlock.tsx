import React, { useEffect, useRef, useState } from "react";
import type { CountryData } from "../types/dataTypes";

interface CountryBlockProps {
  country: CountryData;
  index: number;
  registerPosition: (id: string, rect: DOMRect) => void;
}

const countryToCode: { [key: string]: string } = {
  США: "us",
  Россия: "ru",
  Китай: "cn",
  Великобритания: "gb",
  Германия: "de",
  Франция: "fr",
  Япония: "jp",
  "Южная Корея": "kr",
  Индия: "in",
  Канада: "ca",
  Израиль: "il",
  Австралия: "au",
  // Добавьте другие страны по мере необходимости
};

export const CountryBlock: React.FC<CountryBlockProps> = ({
  country,
  index,
  registerPosition,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [flagError, setFlagError] = useState(false);

  useEffect(() => {
    if (ref.current) {
      registerPosition(`country-${index}`, ref.current.getBoundingClientRect());
    }
  }, [index, registerPosition]);

  const countryCode = countryToCode[country.country]?.toLowerCase() || "";

  return (
    <div ref={ref} className="flex flex-col items-center">
      <div className="flex items-center gap-3 bg-white border-2 border-indigo-100 rounded-xl px-12 py-6 shadow-lg">
        {!flagError && countryCode && (
          <img
            src={`https://flagsapi.com/${countryCode.toUpperCase()}/flat/64.png`}
            alt={`${country.country} flag`}
            className="w-6 h-auto shadow-sm rounded-sm"
            onError={() => setFlagError(true)}
          />
        )}
        <span className="font-bold text-indigo-800 uppercase tracking-wide text-2xl">
          {country.country}
        </span>
      </div>
    </div>
  );
};
