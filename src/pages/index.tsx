import { useState } from "react";
import { ExcelDataLoader } from "../components/ExcelDataLoader";
import { DataTable } from "../components/DataTable";
import { DataSchemaVisualization } from "../components/DataSchemaVisualization";
import { ExcelEditor } from "../components/ExcelEditor";
import type { ProjectData } from "../types/dataTypes";

export default function Home() {
  const [data, setData] = useState<ProjectData | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [nameOfWork, setNameOfWork] = useState<string>("");
  const [secondNameOfWork, setSecondNameOfWork] = useState<string>("");

  const handleDataLoaded = (loadedData: ProjectData) => {
    setData(loadedData);
  };

  const handleEditorSave = () => {
    // Перезагружаем данные после сохранения
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {nameOfWork || "Визуализация данных"}
          </h1>
          <button
            onClick={() => setShowEditor(!showEditor)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            {showEditor ? "Скрыть редактор" : "Добавить данные"}
          </button>
        </div>

        <ExcelDataLoader
          onDataLoaded={handleDataLoaded}
          onNameOfWorkChange={setNameOfWork}
          onSecondNameOfWorkChange={setSecondNameOfWork}
        />

        {showEditor && (
          <div className="mb-8">
            <ExcelEditor onSave={handleEditorSave} />
          </div>
        )}

        {data && (
          <>
            <div className="mb-8">
              <DataTable data={data} />
            </div>
            <div>
              <DataSchemaVisualization data={data} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
