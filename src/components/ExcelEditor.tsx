import { useState, useEffect } from "react";
import * as XLSX from "xlsx";

interface ExcelEditorProps {
  onSave: () => void;
}

export const ExcelEditor: React.FC<ExcelEditorProps> = ({ onSave }) => {
  const [formData, setFormData] = useState({
    Country: "",
    Type: "",
    Company: "",
    Year: "",
    Description: "",
    links: "",
    Stream: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [availableTypes, setAvailableTypes] = useState<string[]>([]);
  const [availableCountries, setAvailableCountries] = useState<string[]>([]);
  const [availableStreams, setAvailableStreams] = useState<string[]>([]);

  useEffect(() => {
    // Загружаем доступные типы и страны при монтировании компонента
    const loadAvailableData = async () => {
      try {
        const response = await fetch("/newData.xlsx");
        if (!response.ok) {
          throw new Error("Ошибка загрузки файла");
        }

        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as Array<any>;

        // Получаем уникальные типы
        const types = new Set<string>();
        // Получаем уникальные страны
        const countries = new Set<string>();
        // Получаем уникальные Stream
        const streams = new Set<string>();

        jsonData.forEach((row) => {
          if (row.Type) {
            types.add(row.Type);
          }
          if (row.Country) {
            countries.add(row.Country);
          }
          if (row.Stream) {
            streams.add(row.Stream);
          }
        });

        setAvailableTypes(Array.from(types).sort());
        setAvailableCountries(Array.from(countries).sort());
        setAvailableStreams(Array.from(streams).sort());
      } catch (error) {
        setError(error instanceof Error ? error.message : "Неизвестная ошибка");
      }
    };

    loadAvailableData();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/newData.xlsx");
      if (!response.ok) {
        throw new Error(`Ошибка загрузки файла: ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];

      // Конвертируем существующие данные в JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as Array<any>;

      // Находим максимальный id
      const maxId = jsonData.reduce((max, row) => {
        const currentId = parseInt(row.id) || 0;
        return currentId > max ? currentId : max;
      }, 0);

      // Добавляем новую строку с id и сохраняем NameOfWork из первой строки
      const nameOfWork = jsonData.length > 0 ? jsonData[0].NameOfWork : "";
      const newRow = {
        id: (maxId + 1).toString(),
        NameOfWork: nameOfWork,
        ...formData,
      };
      jsonData.push(newRow);

      // Создаем новый worksheet с обновленными данными
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
      const formDataToSend = new FormData();
      formDataToSend.append("file", blob, "newData.xlsx");

      const saveResponse = await fetch("/api/saveExcel", {
        method: "POST",
        body: formDataToSend,
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

      // Очищаем форму и вызываем callback
      setFormData({
        Country: "",
        Type: "",
        Company: "",
        Year: "",
        Description: "",
        links: "",
        Stream: "",
      });

      onSave();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Неизвестная ошибка");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Добавить новую запись
      </h2>
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{error}</p>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Страна
            </label>
            <div className="relative">
              <input
                type="text"
                name="Country"
                value={formData.Country}
                onChange={handleInputChange}
                list="countries"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
                disabled={isLoading}
                placeholder="Введите или выберите страну"
              />
              <datalist id="countries">
                {availableCountries.map((country) => (
                  <option key={country} value={country} />
                ))}
              </datalist>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Тип
            </label>
            <div className="relative">
              <input
                type="text"
                name="Type"
                value={formData.Type}
                onChange={handleInputChange}
                list="types"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
                disabled={isLoading}
                placeholder="Введите или выберите тип"
              />
              <datalist id="types">
                {availableTypes.map((type) => (
                  <option key={type} value={type} />
                ))}
              </datalist>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Компания
            </label>
            <input
              type="text"
              name="Company"
              value={formData.Company}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Год
            </label>
            <input
              type="text"
              name="Year"
              value={formData.Year}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stream
            </label>
            <div className="relative">
              <input
                type="text"
                name="Stream"
                value={formData.Stream || ""}
                onChange={handleInputChange}
                list="streams"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={isLoading}
                placeholder="Введите или выберите Stream (необязательно)"
              />
              <datalist id="streams">
                {availableStreams.map((stream) => (
                  <option key={stream} value={stream} />
                ))}
              </datalist>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ссылки (через точку с запятой)
            </label>
            <input
              type="text"
              name="links"
              value={formData.links}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="ссылка1; ссылка2; ссылка3"
              disabled={isLoading}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Описание
          </label>
          <textarea
            name="Description"
            value={formData.Description}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            rows={4}
            required
            disabled={isLoading}
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className={`px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={isLoading}
          >
            {isLoading ? "Сохранение..." : "Добавить запись"}
          </button>
        </div>
      </form>
    </div>
  );
};
