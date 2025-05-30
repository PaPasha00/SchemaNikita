import { useState } from "react";
import type { ProjectData } from "../types/dataTypes";

interface DataTableProps {
  data: ProjectData | null;
}

export const DataTable: React.FC<DataTableProps> = ({ data }) => {
  const [flagErrors, setFlagErrors] = useState<{ [key: string]: boolean }>({});

  if (!data || !data.countries.length) {
    return <div className="p-4">Нет данных для отображения</div>;
  }

  // Функция для получения кода страны
  const getCountryCode = (countryName: string): string => {
    const countryToCode: { [key: string]: string } = {
      россия: "ru",
      russia: "ru",
      китай: "cn",
      china: "cn",
      сша: "us",
      usa: "us",
      "united states": "us",
      индия: "in",
      india: "in",
      япония: "jp",
      japan: "jp",
      германия: "de",
      germany: "de",
      великобритания: "gb",
      uk: "gb",
      "united kingdom": "gb",
      франция: "fr",
      france: "fr",
      италия: "it",
      italy: "it",
      канада: "ca",
      canada: "ca",
      австралия: "au",
      australia: "au",
      // Добавьте другие страны по необходимости
    };

    return countryToCode[countryName.toLowerCase()] || "un";
  };

  // Собираем все данные в плоский массив для таблицы
  const tableData = data.countries.flatMap((country) =>
    country.types.flatMap((type) =>
      type.companies.map((company) => ({
        country: country.country,
        countryCode: getCountryCode(country.country),
        type: type.type,
        company: company.company,
        year: company.year,
        description: company.description,
        links: company.links?.join(", ") || "",
      }))
    )
  );

  const handleFlagError = (countryCode: string) => {
    setFlagErrors((prev) => ({ ...prev, [countryCode]: true }));
  };

  return (
    <div className="flex flex-col h-full max-h-screen">
      <h2 className="text-2xl font-bold p-4 text-center">{data.name}</h2>
      <div className="flex-1 p-6 overflow-hidden">
        <div className="h-full overflow-auto rounded-lg shadow-lg border border-gray-200">
          <table className="w-full table-fixed bg-white">
            <colgroup>
              <col className="w-[15%]" />
              <col className="w-[15%]" />
              <col className="w-[20%]" />
              <col className="w-[10%]" />
              <col className="w-[25%]" />
              <col className="w-[15%]" />
            </colgroup>
            <thead>
              <tr className="bg-indigo-500 text-white sticky top-0 z-10">
                <th className="p-4 text-left font-semibold">Страна</th>
                <th className="p-4 text-left font-semibold">Тип</th>
                <th className="p-4 text-left font-semibold">Компания</th>
                <th className="p-4 text-left font-semibold">Год</th>
                <th className="p-4 text-left font-semibold">Описание</th>
                <th className="p-4 text-left font-semibold">Ссылки</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, index) => (
                <tr
                  key={index}
                  className="border-t border-gray-200 hover:bg-gray-50"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {!flagErrors[row.countryCode] && (
                        <img
                          src={`https://flagcdn.com/${row.countryCode}.svg`}
                          alt={`${row.country} flag`}
                          className="w-6 h-auto rounded-sm shadow-sm"
                          onError={() => handleFlagError(row.countryCode)}
                        />
                      )}
                      <span>{row.country}</span>
                    </div>
                  </td>
                  <td className="p-4">{row.type}</td>
                  <td className="p-4">{row.company}</td>
                  <td className="p-4">{row.year}</td>
                  <td className="p-4">{row.description}</td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-2">
                      {row.links.split(", ").map((link, i) =>
                        link ? (
                          <a
                            key={i}
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-3 py-1.5 bg-blue-500 text-white text-sm font-medium rounded-md hover:bg-blue-600 transition-colors"
                          >
                            Ссылка {i + 1}
                          </a>
                        ) : null
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
