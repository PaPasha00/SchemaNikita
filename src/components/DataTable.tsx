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
  const [editRow, setEditRow] = useState<any | null>(null);
  const [editForm, setEditForm] = useState<any | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  if (!data || !data.countries.length) {
    return <div className="p-4">Нет данных для отображения</div>;
  }

  // Функция для получения кода страны
  const getCountryCode = (countryName: string): string => {
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
      нидерланды: "nl",
      швеция: "se",
      оаэ: "ae",
      "объединённые арабские эмираты": "ae",

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
      Нидерланды: "nl",
      Швеция: "se",
      ОАЭ: "ae",
      "Объединённые Арабские Эмираты": "ae",

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
      netherlands: "nl",
      holland: "nl",
      sweden: "se",
      uae: "ae",
      "united arab emirates": "ae",
    };

    return countryToCode[countryName.toLowerCase()] || "un";
  };

  // Добавим маппинг цветов для Stream
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
    if (!stream) return "#e5e7eb";
    const num = parseInt(stream, 10);
    if (isNaN(num)) return "#e5e7eb";
    return streamColors[num % streamColors.length];
  }

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
        stream: company.stream,
        originalCountry: company.originalCountry,
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

      // Для группы Европа ищем по originalCountry
      const searchCountry =
        rowData.country === "Европа" && rowData.originalCountry
          ? rowData.originalCountry
          : rowData.country;

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
        return (
          (row.Country?.toString().trim().toLowerCase() || "") ===
            (searchCountry?.toString().trim().toLowerCase() || "") &&
          (row.Type?.toString().trim().toLowerCase() || "") ===
            (rowData.type?.toString().trim().toLowerCase() || "") &&
          (row.Company?.toString().trim().toLowerCase() || "") ===
            (rowData.company?.toString().trim().toLowerCase() || "") &&
          (row.Year?.toString().trim() || "") ===
            (rowData.year?.toString().trim() || "") &&
          (row.Description?.toString().trim().toLowerCase() || "") ===
            (rowData.description?.toString().trim().toLowerCase() || "")
        );
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

  const handleEdit = (rowData: any) => {
    setEditRow(rowData);
    setEditForm({
      ...rowData,
      country:
        rowData.country === "Европа" && rowData.originalCountry
          ? rowData.originalCountry
          : rowData.country,
    });
    setEditError(null);
  };

  const handleEditFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEditForm((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleEditSave = async () => {
    setIsSaving(true);
    setEditError(null);
    try {
      // Загружаем текущий файл
      const response = await fetch("/newData.xlsx");
      if (!response.ok) throw new Error("Ошибка загрузки файла");
      const arrayBuffer = await response.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as Array<any>;

      // Находим индекс редактируемой строки
      const index = jsonData.findIndex((row) => {
        // Для группы Европа ищем по originalCountry
        const searchCountry =
          editRow.country === "Европа" && editRow.originalCountry
            ? editRow.originalCountry
            : editRow.country;
        return (
          (row.Country?.toString().trim().toLowerCase() || "") ===
            (searchCountry?.toString().trim().toLowerCase() || "") &&
          (row.Type?.toString().trim().toLowerCase() || "") ===
            (editRow.type?.toString().trim().toLowerCase() || "") &&
          (row.Company?.toString().trim().toLowerCase() || "") ===
            (editRow.company?.toString().trim().toLowerCase() || "") &&
          (row.Year?.toString().trim() || "") ===
            (editRow.year?.toString().trim() || "") &&
          (row.Description?.toString().trim().toLowerCase() || "") ===
            (editRow.description?.toString().trim().toLowerCase() || "")
        );
      });
      if (index === -1) throw new Error("Редактируемая запись не найдена");

      // Обновляем данные
      jsonData[index] = {
        ...jsonData[index],
        Country: editForm.country,
        Type: editForm.type,
        Company: editForm.company,
        Year: editForm.year,
        Description: editForm.description,
        Stream: editForm.stream,
        links: editForm.links,
      };

      // Сохраняем обратно
      const newWorksheet = XLSX.utils.json_to_sheet(jsonData);
      const newWorkbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, "Sheet1");
      const newExcelBuffer = XLSX.write(newWorkbook, {
        bookType: "xlsx",
        type: "array",
      });
      const blob = new Blob([newExcelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const formData = new FormData();
      formData.append("file", blob, "newData.xlsx");
      const saveResponse = await fetch("/api/saveExcel", {
        method: "POST",
        body: formData,
      });
      let responseData;
      try {
        const responseText = await saveResponse.text();
        responseData = JSON.parse(responseText);
      } catch (e: unknown) {
        throw new Error(
          "Некорректный ответ от сервера: " +
            (e instanceof Error ? e.message : String(e))
        );
      }
      if (!saveResponse.ok || !responseData.success) {
        throw new Error(responseData.message || "Ошибка при сохранении файла");
      }
      setEditRow(null);
      setEditForm(null);
      if (onDataChange) onDataChange();
    } catch (error) {
      setEditError(
        error instanceof Error ? error.message : "Неизвестная ошибка"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditCancel = () => {
    setEditRow(null);
    setEditForm(null);
    setEditError(null);
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
              <col className="w-[10%]" />
              <col className="w-[10%]" />
              <col className="w-[5%]" />
            </colgroup>
            <thead>
              <tr className="bg-indigo-500 text-white sticky top-0 z-10">
                <th className="p-4 text-left font-semibold">Страна</th>
                <th className="p-4 text-left font-semibold">Тип</th>
                <th className="p-4 text-left font-semibold">Компания</th>
                <th className="p-4 text-left font-semibold">Год</th>
                <th className="p-4 text-left font-semibold">Описание</th>
                <th className="p-4 text-left font-semibold">Stream</th>
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
                      {/* Показываем флаг оригинальной страны, если страна Европа или Азия и есть originalCountry */}
                      {(row.country === "Европа" || row.country === "Азия") &&
                      row.originalCountry ? (
                        <>
                          {!flagErrors[
                            getCountryCode(row.originalCountry!)
                          ] && (
                            <img
                              src={`https://flagcdn.com/${getCountryCode(
                                row.originalCountry!
                              )}.svg`}
                              alt={`${row.originalCountry} flag`}
                              className="w-6 h-auto rounded-sm shadow-sm"
                              onError={() =>
                                handleFlagError(
                                  getCountryCode(row.originalCountry!)
                                )
                              }
                            />
                          )}
                          <span>
                            {row.country} (страна: {row.originalCountry})
                          </span>
                        </>
                      ) : (
                        <>
                          {!flagErrors[row.countryCode] && (
                            <img
                              src={`https://flagcdn.com/${row.countryCode}.svg`}
                              alt={`${row.country} flag`}
                              className="w-6 h-auto rounded-sm shadow-sm"
                              onError={() => handleFlagError(row.countryCode)}
                            />
                          )}
                          <span>{row.country}</span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="p-4">{row.type}</td>
                  <td
                    className="p-4"
                    style={{
                      border: `2px solid ${getStreamColor(row.stream)}`,
                      borderWidth: 2,
                      borderRadius: "6px",
                      cursor: "pointer",
                    }}
                    title={
                      row.stream ? `Stream: ${row.stream}` : "Stream: не указан"
                    }
                  >
                    {row.company}
                  </td>
                  <td className="p-4">{row.year}</td>
                  <td className="p-4">{row.description}</td>
                  <td className="p-4 text-center">{row.stream || "-"}</td>
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
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => handleEdit(row)}
                        className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full transition-colors"
                        title="Редактировать запись"
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
                            d="M15.232 5.232l3.536 3.536M9 13h3l8-8a2.828 2.828 0 00-4-4l-8 8v3zm0 0v3h3"
                          />
                        </svg>
                      </button>
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
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Модальное окно редактирования */}
      {editRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-lg relative">
            <h3 className="text-xl font-bold mb-4">Редактировать запись</h3>
            {editError && <div className="mb-2 text-red-600">{editError}</div>}
            <div className="space-y-3">
              <label className="block">
                <span className="text-gray-700">Страна</span>
                <input
                  name="country"
                  value={editForm.country}
                  onChange={handleEditFormChange}
                  className="mt-1 block w-full border border-gray-300 rounded px-3 py-2"
                  disabled={isSaving}
                />
              </label>
              <label className="block">
                <span className="text-gray-700">Тип</span>
                <input
                  name="type"
                  value={editForm.type}
                  onChange={handleEditFormChange}
                  className="mt-1 block w-full border border-gray-300 rounded px-3 py-2"
                  disabled={isSaving}
                />
              </label>
              <label className="block">
                <span className="text-gray-700">Компания</span>
                <input
                  name="company"
                  value={editForm.company}
                  onChange={handleEditFormChange}
                  className="mt-1 block w-full border border-gray-300 rounded px-3 py-2"
                  disabled={isSaving}
                />
              </label>
              <label className="block">
                <span className="text-gray-700">Год</span>
                <input
                  name="year"
                  value={editForm.year}
                  onChange={handleEditFormChange}
                  className="mt-1 block w-full border border-gray-300 rounded px-3 py-2"
                  disabled={isSaving}
                />
              </label>
              <label className="block">
                <span className="text-gray-700">Описание</span>
                <textarea
                  name="description"
                  value={editForm.description}
                  onChange={handleEditFormChange}
                  className="mt-1 block w-full border border-gray-300 rounded px-3 py-2"
                  disabled={isSaving}
                  rows={2}
                />
              </label>
              <label className="block">
                <span className="text-gray-700">Stream</span>
                <input
                  name="stream"
                  value={editForm.stream || ""}
                  onChange={handleEditFormChange}
                  className="mt-1 block w-full border border-gray-300 rounded px-3 py-2"
                  disabled={isSaving}
                />
              </label>
              <label className="block">
                <span className="text-gray-700">Ссылки (через ;)</span>
                <input
                  name="links"
                  value={editForm.links}
                  onChange={handleEditFormChange}
                  className="mt-1 block w-full border border-gray-300 rounded px-3 py-2"
                  disabled={isSaving}
                />
              </label>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={handleEditCancel}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                disabled={isSaving}
              >
                Отмена
              </button>
              <button
                onClick={handleEditSave}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                disabled={isSaving}
              >
                {isSaving ? "Сохранение..." : "Сохранить"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
