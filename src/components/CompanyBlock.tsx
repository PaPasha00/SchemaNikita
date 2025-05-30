import React, { useEffect, useRef } from "react";
import type { Company } from "../types/dataTypes";

interface CompanyBlockProps {
  company: Company;
  countryIndex: number;
  typeIndex: number;
  companyIndex: number;
  registerPosition: (id: string, rect: DOMRect) => void;
  showTooltip: (company: Company, e: React.MouseEvent) => void;
  hideTooltip: () => void;
}

// Маппинг 10 цветов для разных стримов (по числовому значению)
const streamColors = [
  "#f87171", // красный
  "#fbbf24", // оранжевый
  "#34d399", // зеленый
  "#60a5fa", // синий
  "#a78bfa", // фиолетовый
  "#f472b6", // розовый
  "#38bdf8", // голубой
  "#facc15", // желтый
  "#4ade80", // лаймовый
  "#818cf8", // индиго
];

function getStreamColor(stream?: string) {
  if (!stream) return "#e5e7eb"; // серый если не указан
  const num = parseInt(stream, 10);
  if (isNaN(num)) return "#e5e7eb";
  return streamColors[num % streamColors.length];
}

export const CompanyBlock: React.FC<CompanyBlockProps> = ({
  company,
  countryIndex,
  typeIndex,
  companyIndex,
  registerPosition,
  showTooltip,
  hideTooltip,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      registerPosition(
        `country-${countryIndex}-type-${typeIndex}-company-${companyIndex}`,
        ref.current.getBoundingClientRect()
      );
    }
  }, [countryIndex, typeIndex, companyIndex, registerPosition]);

  const handleClick = () => {
    if (
      company.links &&
      Array.isArray(company.links) &&
      company.links.length > 0
    ) {
      // Создаем невидимый контейнер для ссылок
      const linkContainer = document.createElement("div");
      linkContainer.style.position = "absolute";
      linkContainer.style.width = "0";
      linkContainer.style.height = "0";
      linkContainer.style.overflow = "hidden";

      // Создаем и добавляем все ссылки
      company.links.forEach((link) => {
        if (link && link.trim()) {
          let url = link.trim();
          if (!url.startsWith("http://") && !url.startsWith("https://")) {
            url = "https://" + url;
          }

          const a = document.createElement("a");
          a.href = url;
          a.target = "_blank";
          a.rel = "noopener noreferrer";
          a.textContent = url;

          // Добавляем обработчик для программного клика
          a.addEventListener("click", (e) => {
            e.preventDefault();
            window.open(url, "_blank");
          });

          linkContainer.appendChild(a);
        }
      });

      // Добавляем контейнер в body
      document.body.appendChild(linkContainer);

      // Кликаем по всем ссылкам с небольшой задержкой
      const links = linkContainer.getElementsByTagName("a");
      Array.from(links).forEach((link, index) => {
        setTimeout(() => {
          link.click();
        }, index * 100);
      });

      // Удаляем контейнер после небольшой задержки
      setTimeout(() => {
        document.body.removeChild(linkContainer);
      }, links.length * 100 + 100);
    }
  };

  const hasLinks =
    company.links && Array.isArray(company.links) && company.links.length > 0;

  return (
    <div
      ref={ref}
      className={`w-[350px] border-2 rounded-xl px-6 py-3 shadow-lg transition-colors
        ${hasLinks ? "hover:border-sky-300 cursor-pointer" : ""}`}
      style={{
        borderColor: getStreamColor(company.stream),
      }}
      onMouseEnter={(e) => showTooltip(company, e)}
      onMouseLeave={hideTooltip}
      onClick={hasLinks ? handleClick : undefined}
      title={company.stream ? `Stream: ${company.stream}` : "Stream: не указан"}
    >
      <span className="font-medium text-sky-800 text-sm whitespace-normal break-words block">
        {company.company}
      </span>
    </div>
  );
};
