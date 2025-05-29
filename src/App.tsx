import { useState } from "react";
import { DataSchemaVisualization } from "./components/DataSchemaVisualization";
import { ExcelDataLoader } from "./components/ExcelDataLoader";
import type { ProjectData } from "./types/dataTypes";

function App() {
  const [data, setData] = useState<ProjectData | null>(null);
  const [_, setNameOfWork] = useState<string>("");
  const [secondNameOfWork, setSecondNameOfWork] = useState<string>("");

  return (
    <div className="App w-full h-full">
      <ExcelDataLoader
        onDataLoaded={setData}
        onNameOfWorkChange={setNameOfWork}
        onSecondNameOfWorkChange={setSecondNameOfWork}
      />
      {data && <DataSchemaVisualization data={data} />}
      <div className="fixed top-4 left-4 bg-white p-4 rounded-lg shadow-lg">
        <p className="text-lg font-semibold">Кафедра 317 МАИ</p>
        <p className="text-xl">{secondNameOfWork}</p>
      </div>
    </div>
  );
}

export default App;
