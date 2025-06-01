import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import type { ProjectData } from "../types/dataTypes";

interface ExcelDataLoaderProps {
  onDataLoaded: (data: ProjectData) => void;
  onNameOfWorkChange?: (name: string) => void;
  onSecondNameOfWorkChange?: (name: string) => void;
}

export const ExcelDataLoader: React.FC<ExcelDataLoaderProps> = ({
  onDataLoaded,
  onNameOfWorkChange,
  onSecondNameOfWorkChange,
}) => {
  const [error, setError] = useState<string | null>(null);
  const [_, setNameOfWork] = useState<string>("");
  const [__, setSecondNameOfWork] = useState<string>("");

  useEffect(() => {
    const loadExcelData = async () => {
      try {
        const response = await fetch("/newData.xlsx");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        if (!Array.isArray(jsonData) || jsonData.length === 0) {
          throw new Error("Excel файл пуст или имеет неверный формат");
        }

        const firstRow = jsonData[0] as Record<string, unknown>;
        const secondRow = jsonData[1] as Record<string, unknown>;

        // Получаем название проекта из NameOfWork с учетом возможных вариантов написания
        const projectName =
          (firstRow.NameOfWork as string) ||
          (firstRow.nameOfWork as string) ||
          (firstRow["Name of Work"] as string) ||
          (firstRow["name of work"] as string) ||
          "Данные из Excel";

        // Получаем второе название из NameOfWork
        const secondProjectName = secondRow
          ? (secondRow.NameOfWork as string) ||
            (secondRow.nameOfWork as string) ||
            (secondRow["Name of Work"] as string) ||
            (secondRow["name of work"] as string) ||
            ""
          : "";

        // Сохраняем значения NameOfWork в состояние и передаем родителю
        setNameOfWork(projectName);
        setSecondNameOfWork(secondProjectName);
        if (onNameOfWorkChange) {
          onNameOfWorkChange(projectName);
        }
        if (onSecondNameOfWorkChange) {
          onSecondNameOfWorkChange(secondProjectName);
        }

        // Преобразуем данные в нужный формат
        const transformedData: ProjectData = {
          name: projectName,
          countries: [],
        };

        // Группируем данные по странам и типам
        const groupedByCountry = new Map<string, Map<string, any[]>>();

        jsonData.forEach((row: any) => {
          if (!row.Country || !row.Type || !row.Company) {
            return;
          }

          const country = row.Country?.toLowerCase() || "";
          const type = row.Type || "";

          const company = {
            company: row.Company || "",
            year: row.Year?.toString() || "",
            description: row.Description || "",
            stream: row.Stream?.toString() || undefined,
            links: row.links
              ? row.links.split(/;\s*/).map((link: string) => link.trim())
              : undefined,
          };

          if (!groupedByCountry.has(country)) {
            groupedByCountry.set(country, new Map());
          }

          const countryData = groupedByCountry.get(country)!;
          if (!countryData.has(type)) {
            countryData.set(type, []);
          }

          countryData.get(type)!.push(company);
        });

        // --- Группировка европейских и азиатских стран в отдельные группы ---
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
        const asianCountries = [
          "китай",
          "япония",
          "южная корея",
          "индия",
          "израиль",
          "турция",
          "таиланд",
          "вьетнам",
          "сингапур",
          "малайзия",
          "индонезия",
          "казахстан",
          "узбекистан",
          "пакистан",
          "бангладеш",
          "филиппины",
          "тайвань",
          "грузия",
          "армения",
          "азербайджан",
          "кыргызстан",
          "монголия",
          "шри-ланка",
          "камбоджа",
          "лаос",
          "непал",
          "бруней",
          "восточный тимор",
          "малдивы",
          "иордания",
          "саудовская аравия",
          "оаэ",
          "объединённые арабские эмираты",
          "катар",
          "кувейт",
          "бахрейн",
          "омaн",
          "йемен",
          "афганистан",
          "сирия",
          "ирак",
          "иран",
          "ливан",
          "палестина",
          "азия",
        ];

        // Преобразуем сгруппированные данные в финальный формат
        const europeTypeMap = new Map<string, any[]>();
        const asiaTypeMap = new Map<string, any[]>();
        groupedByCountry.forEach((typeMap, country) => {
          if (europeanCountries.includes(country)) {
            typeMap.forEach((companies, type) => {
              if (!europeTypeMap.has(type)) europeTypeMap.set(type, []);
              const companiesWithCountry = companies.map((c) => ({
                ...c,
                originalCountry: country,
              }));
              europeTypeMap.get(type)!.push(...companiesWithCountry);
            });
          } else if (asianCountries.includes(country)) {
            typeMap.forEach((companies, type) => {
              if (!asiaTypeMap.has(type)) asiaTypeMap.set(type, []);
              const companiesWithCountry = companies.map((c) => ({
                ...c,
                originalCountry: country,
              }));
              asiaTypeMap.get(type)!.push(...companiesWithCountry);
            });
          }
        });
        // 1. Добавляем остальные страны
        groupedByCountry.forEach((typeMap, country) => {
          if (
            !europeanCountries.includes(country) &&
            !asianCountries.includes(country)
          ) {
            const countryData = {
              country,
              types: Array.from(typeMap.entries()).map(([type, companies]) => ({
                type,
                companies,
              })),
            };
            transformedData.countries.push(countryData);
          }
        });
        // 2. Добавляем Европу, если есть
        if (europeTypeMap.size > 0) {
          transformedData.countries.push({
            country: "Европа",
            types: Array.from(europeTypeMap.entries()).map(
              ([type, companies]) => ({
                type,
                companies,
              })
            ),
          });
        }
        // 3. Добавляем Азию, если есть
        if (asiaTypeMap.size > 0) {
          transformedData.countries.push({
            country: "Азия",
            types: Array.from(asiaTypeMap.entries()).map(
              ([type, companies]) => ({
                type,
                companies,
              })
            ),
          });
        }

        if (transformedData.countries.length === 0) {
          throw new Error("Не удалось извлечь данные из Excel файла");
        }

        onDataLoaded(transformedData);
        setError(null);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Неизвестная ошибка";
        console.error("Ошибка при загрузке Excel файла:", errorMessage);
        setError(errorMessage);
      }
    };

    loadExcelData();
  }, [onDataLoaded, onNameOfWorkChange, onSecondNameOfWorkChange]);

  if (error) {
    return (
      <div className="p-4 text-red-600 bg-red-100 rounded-lg">
        <p>Ошибка загрузки данных: {error}</p>
        <p className="text-sm mt-2">
          Убедитесь, что Excel файл содержит колонки: NameOfWork, Country, Type,
          Company, Year, Description, links
        </p>
      </div>
    );
  }

  return null;
};
