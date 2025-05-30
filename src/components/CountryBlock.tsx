import React, { useEffect, useRef, useState } from "react";
import type { CountryData } from "../types/dataTypes";

interface CountryBlockProps {
  country: CountryData;
  index: number;
  registerPosition: (id: string, rect: DOMRect) => void;
}

const countryToCode: { [key: string]: string } = {
  // Russian names (lowercase)
  сша: "us",
  россия: "ru",
  китай: "cn",
  великобритания: "gb",
  германия: "de",
  франция: "fr",
  япония: "jp",
  "южная корея": "kr",
  индия: "in",
  канада: "ca",
  израиль: "il",
  австралия: "au",
  // Russian names (original case)
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
  // English names
  usa: "us",
  russia: "ru",
  china: "cn",
  "united kingdom": "gb",
  uk: "gb",
  germany: "de",
  france: "fr",
  japan: "jp",
  "south korea": "kr",
  india: "in",
  canada: "ca",
  israel: "il",
  australia: "au",
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

  // Получаем код страны с учетом разных вариантов написания
  const countryCode =
    countryToCode[country.country] ||
    countryToCode[country.country.toLowerCase()] ||
    "un"; // Используем флаг ООН как запасной вариант

  return (
    <div ref={ref} className="flex flex-col items-center">
      <div className="flex items-center gap-3 bg-white border-2 border-indigo-100 rounded-xl px-12 py-6 shadow-lg">
        {!flagError && countryCode && (
          <img
            src={`https://flagcdn.com/${countryCode}.svg`}
            alt={`${country.country} flag`}
            className="w-8 h-auto shadow-sm rounded-sm"
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
