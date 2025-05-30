import React, { useMemo, useState } from "react";
import type { ProjectData, Company } from "../types/dataTypes";

interface BoxplotPageProps {
  data: ProjectData;
}

interface StreamCompany {
  stream: string;
  companies: Company[];
}

type CompanyWithMeta = Company & { country: string; type: string };

export const BoxplotPage: React.FC<BoxplotPageProps> = ({ data }) => {
  // Собираем все компании по stream
  const streamMap = useMemo(() => {
    const map = new Map<string, CompanyWithMeta[]>();
    data.countries.forEach((country) => {
      country.types.forEach((type) => {
        type.companies.forEach((company) => {
          const stream = company.stream || "не указано";
          if (!map.has(stream)) map.set(stream, []);
          map
            .get(stream)!
            .push({ ...company, country: country.country, type: type.type });
        });
      });
    });
    // Сортируем по stream (числовые сначала, потом не указано)
    return Array.from(map.entries()).sort((a, b) => {
      if (a[0] === "не указано") return 1;
      if (b[0] === "не указано") return -1;
      return parseInt(a[0], 10) - parseInt(b[0], 10);
    });
  }, [data]);

  // Для тултипа
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    content: CompanyWithMeta | null;
    position: { x: number; y: number };
  }>({ visible: false, content: null, position: { x: 0, y: 0 } });

  // Цвета для stream
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
    "#9ca3af", // серый для не указано
  ];
  function getStreamColor(stream: string) {
    if (stream === "не указано") return streamColors[10];
    const num = parseInt(stream, 10);
    if (isNaN(num)) return streamColors[10];
    return streamColors[num % 10];
  }

  // Размеры
  const colWidth = 350;
  const brickHeight = 64;
  const brickGap = 4;
  const colGap = 32;
  const chartHeight =
    Math.max(...streamMap.map(([, arr]) => arr.length)) *
      (brickHeight + brickGap) +
    40;
  const chartWidth = streamMap.length * (colWidth + colGap);

  return (
    <div className="w-full h-screen min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8 overflow-auto">
      <h2 className="text-2xl font-bold mb-8">
        Boxplot по направлениям (Stream)
      </h2>
      <div
        className="w-full h-full flex justify-center"
        style={{ minWidth: "100vw", minHeight: "100vh", overflow: "auto" }}
      >
        <div
          className="bg-white rounded-xl shadow-lg border border-gray-200 p-8"
          style={{
            width: chartWidth,
            height: chartHeight,
            minWidth: chartWidth,
            minHeight: chartHeight,
          }}
        >
          <svg
            width={chartWidth}
            height={chartHeight}
            style={{ minWidth: chartWidth, minHeight: chartHeight }}
          >
            {/* Оси и подписи */}
            {streamMap.map(([stream], i) => (
              <g key={stream}>
                {/* Подпись stream */}
                <text
                  x={i * (colWidth + colGap) + colWidth / 2}
                  y={chartHeight - 8}
                  textAnchor="middle"
                  className="fill-slate-700 text-base"
                >
                  {stream}
                </text>
              </g>
            ))}
            {/* Кирпичики-компании */}
            {streamMap.map(([stream, companies], i) =>
              companies.map((company, j) => (
                <g key={company.id || company.company + j}>
                  {j === companies.length - 1 ? (
                    // Верхний кирпичик с закруглением только сверху
                    <path
                      d={`M${i * (colWidth + colGap) + 8 + 8},${
                        chartHeight - 40 - (j + 1) * (brickHeight + brickGap)
                      }
                          h${colWidth - 16 - 16}
                          a8,8 0 0 1 8,8
                          v${brickHeight - 8}
                          h-${colWidth - 16}
                          v-${brickHeight - 8}
                          a8,8 0 0 1 8,-8
                          z`}
                      fill={getStreamColor(stream)}
                      className="transition-all"
                    />
                  ) : (
                    <rect
                      x={i * (colWidth + colGap) + 8}
                      y={chartHeight - 40 - (j + 1) * (brickHeight + brickGap)}
                      width={colWidth - 16}
                      height={brickHeight}
                      fill={getStreamColor(stream)}
                      className="transition-all"
                    />
                  )}
                  <foreignObject
                    x={i * (colWidth + colGap) + 8}
                    y={chartHeight - 40 - (j + 1) * (brickHeight + brickGap)}
                    width={colWidth - 16}
                    height={brickHeight}
                    className="cursor-pointer hover:stroke-2 hover:stroke-indigo-700"
                    onMouseEnter={(e) =>
                      setTooltip({
                        visible: true,
                        content: company,
                        position: { x: e.clientX, y: e.clientY },
                      })
                    }
                    onMouseLeave={() =>
                      setTooltip({ ...tooltip, visible: false })
                    }
                    onClick={() => {
                      if (company.links && company.links.length > 0) {
                        company.links.forEach((link) => {
                          let url = link.trim();
                          if (
                            !url.startsWith("http://") &&
                            !url.startsWith("https://")
                          ) {
                            url = "https://" + url;
                          }
                          window.open(url, "_blank");
                        });
                      }
                    }}
                  >
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        color: "white",
                        fontWeight: 600,
                        fontSize: "14px",
                        textAlign: "start",
                        wordBreak: "break-word",
                        whiteSpace: "pre-line",
                        display: "flex",
                        alignItems: "center",
                        padding: "12px 16px",
                      }}
                      className="select-none"
                    >
                      {company.company}
                    </div>
                  </foreignObject>
                </g>
              ))
            )}
          </svg>
        </div>
      </div>
      {/* Тултип */}
      {tooltip.visible && tooltip.content && (
        <div
          className="fixed bg-slate-900 text-white p-4 rounded-lg shadow-xl text-sm max-w-xs z-50 border-l-4 border-indigo-500"
          style={{
            left: tooltip.position.x + 15,
            top: tooltip.position.y + 15,
          }}
        >
          <p className="mb-2 font-bold">{tooltip.content.company}</p>
          <p className="mb-1">Описание: {tooltip.content.description}</p>
          <p className="mb-1">Год: {tooltip.content.year}</p>
          <p className="mb-1">
            Stream: {tooltip.content.stream || "не указано"}
          </p>
          {tooltip.content.country && (
            <p className="mb-1">Страна: {tooltip.content.country}</p>
          )}
          {tooltip.content.type && (
            <p className="mb-1">Тип: {tooltip.content.type}</p>
          )}
          {tooltip.content.links && tooltip.content.links.length > 0 && (
            <div className="mt-2">
              <span className="font-semibold">Ссылки:</span>
              <ul className="list-disc list-inside">
                {tooltip.content.links.map((link, i) => (
                  <li key={i}>
                    <a
                      href={link.startsWith("http") ? link : `https://${link}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline text-blue-300 hover:text-blue-400"
                      style={{
                        wordBreak: "break-all",
                        overflowWrap: "anywhere",
                      }}
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
