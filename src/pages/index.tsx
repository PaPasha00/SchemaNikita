import { useState } from "react";
import { ExcelDataLoader } from "../components/ExcelDataLoader";
import { DataTable } from "../components/DataTable";
import { DataSchemaVisualization } from "../components/DataSchemaVisualization";
import type { ProjectData } from "../types/dataTypes";

export default function Home() {
  const [data, setData] = useState<ProjectData | null>(null);
  const [nameOfWork, setNameOfWork] = useState<string>("");

  const handleDataLoaded = (loadedData: ProjectData) => {
    setData(loadedData);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {nameOfWork || "Визуализация данных"}
          </h1>
        </div>

        <ExcelDataLoader
          onDataLoaded={handleDataLoaded}
          onNameOfWorkChange={setNameOfWork}
        />

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
