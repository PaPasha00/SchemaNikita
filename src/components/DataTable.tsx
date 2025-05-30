import { useState } from "react";
import type { ProjectData } from "../types/dataTypes";
import * as XLSX from "xlsx";

interface DataTableProps {
  data: ProjectData | null;
  onDataChange?: () => void;
}

export const DataTable: React.FC<DataTableProps> = ({ data, onDataChange }) => {
  const [flagErrors, setFlagErrors] = useState<{ [key: string]: boolean }>({});
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

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
        id: company.id,
        country: country.country,
        countryCode: getCountryCode(country.country),
        type: type.type,
        company: company.company,
        year: company.year,
        description: company.description,
        links: company.links?.join(", ") || "",
        nameOfWork: data.name,
      }))
    )
  );

  const handleFlagError = (countryCode: string) => {
    setFlagErrors((prev) => ({ ...prev, [countryCode]: true }));
  };

  const handleDelete = async (rowData: any) => {
    if (!window.confirm("Вы уверены, что хотите удалить эту запись?")) {
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);

    try {
      // Загружаем текущий файл
      const response = await fetch("/newData.xlsx");
      if (!response.ok) {
        throw new Error("Ошибка загрузки файла");
      }

      const arrayBuffer = await response.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];

      // Конвертируем в JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as Array<any>;

      console.log("Данные для удаления:", {
        искомые_данные: {
          Country: rowData.country,
          Type: rowData.type,
          Company: rowData.company,
          Year: rowData.year,
          Description: rowData.description,
        },
      });

      console.log("Все записи в файле:", jsonData);

      // Находим запись для удаления, сравнивая все поля
      const index = jsonData.findIndex((row) => {
        const match =
          row.Country?.toLowerCase() === rowData.country.toLowerCase() &&
          row.Type?.toLowerCase() === rowData.type.toLowerCase() &&
          row.Company?.toLowerCase() === rowData.company.toLowerCase() &&
          row.Year?.toString() === rowData.year.toString() &&
          row.Description?.toLowerCase() === rowData.description.toLowerCase();

        console.log("Сравнение записи:", {
          существующая: {
            Country: row.Country,
            Type: row.Type,
            Company: row.Company,
            Year: row.Year,
            Description: row.Description,
          },
          совпадение: match,
        });

        return match;
      });

      if (index === -1) {
        throw new Error("Запись не найдена");
      }

      console.log("Найдена запись для удаления с индексом:", index);

      // Удаляем запись
      jsonData.splice(index, 1);

      // Создаем новый worksheet
      const newWorksheet = XLSX.utils.json_to_sheet(jsonData);
      const newWorkbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, "Sheet1");

      // Генерируем файл
      const newExcelBuffer = XLSX.write(newWorkbook, {
        bookType: "xlsx",
        type: "array",
      });
      const blob = new Blob([newExcelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      // Отправляем файл на сервер
      const formData = new FormData();
      formData.append("file", blob, "newData.xlsx");

      const saveResponse = await fetch("/api/saveExcel", {
        method: "POST",
        body: formData,
      });

      if (!saveResponse.ok) {
        throw new Error("Ошибка при сохранении файла");
      }

      // Обновляем данные в интерфейсе
      if (onDataChange) {
        onDataChange();
      } else {
        window.location.reload();
      }
    } catch (error) {
      console.error("Ошибка при удалении записи:", error);
      setDeleteError(
        error instanceof Error ? error.message : "Неизвестная ошибка"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-h-screen">
      <h2 className="text-2xl font-bold p-4 text-center">{data.name}</h2>
      {deleteError && (
        <div className="mx-6 mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{deleteError}</p>
        </div>
      )}
      <div className="flex-1 p-6 overflow-hidden">
        <div className="h-full overflow-auto rounded-lg shadow-lg border border-gray-200">
          <table className="w-full table-fixed bg-white">
            <colgroup>
              <col className="w-[15%]" />
              <col className="w-[15%]" />
              <col className="w-[15%]" />
              <col className="w-[10%]" />
              <col className="w-[25%]" />
              <col className="w-[15%]" />
              <col className="w-[5%]" /> {/* Для кнопки удаления */}
            </colgroup>
            <thead>
              <tr className="bg-indigo-500 text-white sticky top-0 z-10">
                <th className="p-4 text-left font-semibold">Страна</th>
                <th className="p-4 text-left font-semibold">Тип</th>
                <th className="p-4 text-left font-semibold">Компания</th>
                <th className="p-4 text-left font-semibold">Год</th>
                <th className="p-4 text-left font-semibold">Описание</th>
                <th className="p-4 text-left font-semibold">Ссылки</th>
                <th className="p-4 text-center font-semibold">Действия</th>
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
                  <td className="p-4 text-center">
                    <button
                      onClick={() => handleDelete(row)}
                      disabled={isDeleting}
                      className={`p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-colors ${
                        isDeleting ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                      title="Удалить запись"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
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
