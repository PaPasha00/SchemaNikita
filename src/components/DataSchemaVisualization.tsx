import React, { useState, useRef, useEffect } from "react";
import type { Company, ProjectData } from "../types/dataTypes";
import { ProjectBlock } from "./ProjectBlock";
import { CountryBlock } from "./CountryBlock";
import { TypeBlock } from "./TypeBlock";
import { CompanyBlock } from "./CompanyBlock";

interface DataSchemaVisualizationProps {
  data: ProjectData;
}

export const DataSchemaVisualization: React.FC<
  DataSchemaVisualizationProps
> = ({ data }) => {
  const [tooltip, setTooltip] = useState({
    visible: false,
    content: {
      description: "",
      year: "",
      stream: "",
      originalCountry: undefined as string | undefined,
    },
    position: { x: 0, y: 0 },
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const connectionsRef = useRef<{ [key: string]: DOMRect }>({});

  const registerPosition = (id: string, rect: DOMRect) => {
    connectionsRef.current[id] = rect;
  };

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const svg = svgRef.current;
    svg.innerHTML = "";

    const containerRect = containerRef.current.getBoundingClientRect();

    // Создаем определения маркеров для стрелок
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");

    // Маркер для стрелок проект -> страна
    const projectMarker = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "marker"
    );
    projectMarker.setAttribute("id", "project-arrow");
    projectMarker.setAttribute("viewBox", "0 0 10 10");
    projectMarker.setAttribute("refX", "5");
    projectMarker.setAttribute("refY", "5");
    projectMarker.setAttribute("markerWidth", "4");
    projectMarker.setAttribute("markerHeight", "4");
    projectMarker.setAttribute("orient", "auto-start-reverse");

    const projectPath = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path"
    );
    projectPath.setAttribute("d", "M 0 0 L 10 5 L 0 10 z");
    projectPath.setAttribute("fill", "#818cf8");
    projectMarker.appendChild(projectPath);
    defs.appendChild(projectMarker);

    // Маркер для стрелок страна -> тип
    const typeMarker = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "marker"
    );
    typeMarker.setAttribute("id", "type-arrow");
    typeMarker.setAttribute("viewBox", "0 0 10 10");
    typeMarker.setAttribute("refX", "5");
    typeMarker.setAttribute("refY", "5");
    typeMarker.setAttribute("markerWidth", "4");
    typeMarker.setAttribute("markerHeight", "4");
    typeMarker.setAttribute("orient", "auto-start-reverse");

    const typePath = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path"
    );
    typePath.setAttribute("d", "M 0 0 L 10 5 L 0 10 z");
    typePath.setAttribute("fill", "#60a5fa");
    typeMarker.appendChild(typePath);
    defs.appendChild(typeMarker);

    svg.appendChild(defs);

    // Соединения: Проект -> Страны
    const projectRect = connectionsRef.current["project"];
    if (projectRect) {
      // Находим самую левую и самую правую страну
      const countryRects = data.countries
        .map((_, index) => ({
          rect: connectionsRef.current[`country-${index}`],
          index,
        }))
        .filter((item) => item.rect);

      if (countryRects.length > 0) {
        const leftmostCountry = countryRects[0].rect;
        const rightmostCountry = countryRects[countryRects.length - 1].rect;

        // Вычисляем центральную точку для вертикальной линии
        const verticalLineX =
          projectRect.left + projectRect.width / 2 - containerRect.left;
        const verticalLineStartY = projectRect.bottom - containerRect.top;
        const verticalLineEndY = verticalLineStartY + 40; // Уменьшаем длину вертикальной линии с 60 до 40

        // Рисуем вертикальную линию от проекта вниз
        const verticalLine = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "line"
        );
        verticalLine.setAttribute("x1", `${verticalLineX}`);
        verticalLine.setAttribute("y1", `${verticalLineStartY}`);
        verticalLine.setAttribute("x2", `${verticalLineX}`);
        verticalLine.setAttribute("y2", `${verticalLineEndY}`);
        verticalLine.setAttribute("stroke", "#818cf8");
        verticalLine.setAttribute("stroke-width", "2");
        svg.appendChild(verticalLine);

        // Рисуем горизонтальную линию
        const horizontalLine = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "line"
        );
        horizontalLine.setAttribute(
          "x1",
          `${
            leftmostCountry.left +
            leftmostCountry.width / 2 -
            containerRect.left
          }`
        );
        horizontalLine.setAttribute("y1", `${verticalLineEndY}`);
        horizontalLine.setAttribute(
          "x2",
          `${
            rightmostCountry.left +
            rightmostCountry.width / 2 -
            containerRect.left
          }`
        );
        horizontalLine.setAttribute("y2", `${verticalLineEndY}`);
        horizontalLine.setAttribute("stroke", "#818cf8");
        horizontalLine.setAttribute("stroke-width", "2");
        svg.appendChild(horizontalLine);

        // Рисуем вертикальные линии к странам
        countryRects.forEach(({ rect }) => {
          const countryX = rect.left + rect.width / 2 - containerRect.left;
          const countryY = rect.top - containerRect.top;

          const countryLine = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "line"
          );
          countryLine.setAttribute("x1", `${countryX}`);
          countryLine.setAttribute("y1", `${verticalLineEndY}`);
          countryLine.setAttribute("x2", `${countryX}`);
          countryLine.setAttribute("y2", `${countryY}`);
          countryLine.setAttribute("stroke", "#818cf8");
          countryLine.setAttribute("stroke-width", "2");
          countryLine.setAttribute("marker-end", "url(#project-arrow)");
          svg.appendChild(countryLine);
        });
      }
    }

    // Соединения: Страны -> Типы
    data.countries.forEach((country, countryIndex) => {
      const countryRect = connectionsRef.current[`country-${countryIndex}`];

      if (countryRect) {
        // Собираем все типы для текущей страны
        const typeRects = country.types
          .map((_, typeIndex) => ({
            rect: connectionsRef.current[
              `country-${countryIndex}-type-${typeIndex}`
            ],
            index: typeIndex,
          }))
          .filter((item) => item.rect);

        if (typeRects.length > 0) {
          const leftmostType = typeRects[0].rect;
          const rightmostType = typeRects[typeRects.length - 1].rect;

          // Вычисляем центральную точку для вертикальной линии
          const verticalLineX =
            countryRect.left + countryRect.width / 2 - containerRect.left;
          const verticalLineStartY = countryRect.bottom - containerRect.top;
          const verticalLineEndY = verticalLineStartY + 100; // Длина вертикальной линии

          // Рисуем вертикальную линию от страны вниз
          const verticalLine = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "line"
          );
          verticalLine.setAttribute("x1", `${verticalLineX}`);
          verticalLine.setAttribute("y1", `${verticalLineStartY}`);
          verticalLine.setAttribute("x2", `${verticalLineX}`);
          verticalLine.setAttribute("y2", `${verticalLineEndY}`);
          verticalLine.setAttribute("stroke", "#60a5fa");
          verticalLine.setAttribute("stroke-width", "2");
          svg.appendChild(verticalLine);

          // Рисуем горизонтальную линию
          const horizontalLine = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "line"
          );
          horizontalLine.setAttribute(
            "x1",
            `${leftmostType.left + leftmostType.width / 2 - containerRect.left}`
          );
          horizontalLine.setAttribute("y1", `${verticalLineEndY}`);
          horizontalLine.setAttribute(
            "x2",
            `${
              rightmostType.left + rightmostType.width / 2 - containerRect.left
            }`
          );
          horizontalLine.setAttribute("y2", `${verticalLineEndY}`);
          horizontalLine.setAttribute("stroke", "#60a5fa");
          horizontalLine.setAttribute("stroke-width", "2");
          svg.appendChild(horizontalLine);

          // Рисуем вертикальные линии к типам
          typeRects.forEach(({ rect }) => {
            const typeX = rect.left + rect.width / 2 - containerRect.left;
            const typeY = rect.top - containerRect.top - 2;

            const typeLine = document.createElementNS(
              "http://www.w3.org/2000/svg",
              "line"
            );
            typeLine.setAttribute("x1", `${typeX}`);
            typeLine.setAttribute("y1", `${verticalLineEndY}`);
            typeLine.setAttribute("x2", `${typeX}`);
            typeLine.setAttribute("y2", `${typeY}`);
            typeLine.setAttribute("stroke", "#60a5fa");
            typeLine.setAttribute("stroke-width", "2");
            typeLine.setAttribute("marker-end", "url(#type-arrow)");
            svg.appendChild(typeLine);
          });
        }
      }
    });
  }, [data]);

  const showTooltip = (company: Company, e: React.MouseEvent) => {
    setTooltip({
      visible: true,
      content: {
        description: company.description,
        year: company.year,
        stream: company.stream || "",
        originalCountry: company.originalCountry,
      },
      position: { x: e.clientX, y: e.clientY },
    });
  };

  const hideTooltip = () => {
    setTooltip({ ...tooltip, visible: false });
  };

  // Список европейских стран (нижний регистр)
  const europeanCountries = [
    "австрия",
    "бельгия",
    "болгария",
    "венгрия",
    "германия",
    "греция",
    "дания",
    "ирландия",
    "испания",
    "италия",
    "кипр",
    "латвия",
    "литва",
    "люксембург",
    "мальта",
    "нидерланды",
    "польша",
    "португалия",
    "румыния",
    "словакия",
    "словения",
    "финляндия",
    "франция",
    "хорватия",
    "чехия",
    "швеция",
    "эстония",
    "великобритания",
    "швейцария",
    "норвегия",
    "исландия",
    "сербия",
    "босния и герцеговина",
    "северная македония",
    "черногория",
    "албания",
    "молдова",
    "беларусь",
    "украина",
    "европа",
  ];

  // Возвращает массив: неевропейские страны + Европа
  function getCountriesWithEurope(dataCountries: typeof data.countries) {
    // 1. Неевропейские страны
    const nonEurope = dataCountries.filter(
      (c) => !europeanCountries.includes(c.country.toLowerCase())
    );
    // 2. Собираем все типы и компании из европейских стран
    const europeTypeMap = new Map<string, Company[]>();
    dataCountries.forEach((c) => {
      if (europeanCountries.includes(c.country.toLowerCase())) {
        c.types.forEach((type) => {
          if (!europeTypeMap.has(type.type)) europeTypeMap.set(type.type, []);
          europeTypeMap.get(type.type)!.push(...type.companies);
        });
      }
    });
    // 3. Формируем объект Европа
    const europeTypes = Array.from(europeTypeMap.entries()).map(
      ([type, companies]) => ({ type, companies })
    );
    const result = [...nonEurope];
    if (europeTypes.length > 0) {
      result.push({ country: "Европа", types: europeTypes });
    }
    return result;
  }

  const countriesForSchema = getCountriesWithEurope(data.countries);

  return (
    <div className="w-full h-full p-6 bg-gradient-to-br from-slate-50 to-slate-100 overflow-x-auto overflow-y-auto">
      <div
        ref={containerRef}
        className="relative min-w-max mx-auto flex flex-col items-center"
        style={{ padding: "20px 100px" }}
      >
        {/* Уровень 1: Проект */}
        <div className="mb-40">
          <ProjectBlock name={data.name} registerPosition={registerPosition} />
        </div>

        {/* Уровень 2: Страны */}
        <div className="flex justify-start mb-40 min-w-max">
          {countriesForSchema.map((country, countryIndex) => (
            <div
              key={countryIndex}
              className="flex flex-col items-center"
              style={{
                width: country.types.length * 400 + "px",
                marginRight:
                  countryIndex < countriesForSchema.length - 1 ? "66px" : "0",
              }}
            >
              <CountryBlock
                country={country}
                index={countryIndex}
                registerPosition={registerPosition}
              />
            </div>
          ))}
        </div>

        {/* Уровень 3 и 4: Типы и их компании */}
        <div className="flex justify-start min-w-max">
          {countriesForSchema.map((country, countryIndex) => (
            <div
              key={countryIndex}
              style={{
                width: country.types.length * 400 + "px",
                marginRight:
                  countryIndex < countriesForSchema.length - 1 ? "66px" : "0",
              }}
            >
              <div className="flex flex-row items-start justify-center gap-8 min-w-max">
                {country.types.map((type, typeIndex) => (
                  <div
                    key={typeIndex}
                    className="flex flex-col items-center gap-2 min-w-[350px]"
                  >
                    <TypeBlock
                      type={type}
                      countryIndex={countryIndex}
                      typeIndex={typeIndex}
                      registerPosition={registerPosition}
                    />
                    <div className="flex flex-col items-start gap-2 w-full">
                      {type.companies
                        .slice()
                        .sort((a, b) => {
                          // Сортируем по stream (числовое значение), пустые в конец
                          const aNum = a.stream ? parseInt(a.stream, 10) : NaN;
                          const bNum = b.stream ? parseInt(b.stream, 10) : NaN;
                          if (isNaN(aNum) && isNaN(bNum)) return 0;
                          if (isNaN(aNum)) return 1;
                          if (isNaN(bNum)) return -1;
                          return aNum - bNum;
                        })
                        .map((company, companyIndex) => (
                          <CompanyBlock
                            key={companyIndex}
                            company={company}
                            countryIndex={countryIndex}
                            typeIndex={typeIndex}
                            companyIndex={companyIndex}
                            registerPosition={registerPosition}
                            showTooltip={showTooltip}
                            hideTooltip={hideTooltip}
                          />
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Дополнительное пространство внизу */}
        <div style={{ height: "800px", width: "100%" }}></div>

        {/* SVG для соединений */}
        <svg
          ref={svgRef}
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
          style={{ minWidth: "100%", minHeight: "100%" }}
        />

        {/* Тултип */}
        {tooltip.visible && (
          <div
            className="fixed bg-slate-900 text-white p-4 rounded-lg shadow-xl text-sm max-w-xs z-50 border-l-4 border-indigo-500"
            style={{
              left: tooltip.position.x + 15,
              top: tooltip.position.y + 15,
            }}
          >
            <p className="mb-2">{tooltip.content.description}</p>
            {/* Показываем оригинальную страну, если есть */}
            {tooltip.content.originalCountry && (
              <p className="text-slate-300 font-medium mb-1">
                Страна: {tooltip.content.originalCountry}
              </p>
            )}
            <p className="text-slate-300 font-medium">
              Год: {tooltip.content.year}
            </p>
            <p className="text-slate-300 font-medium">
              Направление:{" "}
              {tooltip.content.stream ? tooltip.content.stream : "не указано"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
