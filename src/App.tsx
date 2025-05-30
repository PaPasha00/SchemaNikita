import { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";
import { DataSchemaVisualization } from "./components/DataSchemaVisualization";
import { ExcelDataLoader } from "./components/ExcelDataLoader";
import { DataTable } from "./components/DataTable";
import { ExcelEditor } from "./components/ExcelEditor";
import { DownloadExcelButton } from "./components/DownloadExcelButton";
import type { ProjectData } from "./types/dataTypes";

function MainLayout() {
  const [data, setData] = useState<ProjectData | null>(null);
  const [_, setNameOfWork] = useState<string>("");
  const [secondNameOfWork, setSecondNameOfWork] = useState<string>("");
  const [isInfoVisible, setIsInfoVisible] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const location = useLocation();

  const isVisualizationRoute = location.pathname === "/";

  const handleEditorSave = () => {
    // Перезагружаем данные после сохранения
    window.location.reload();
  };

  const handleDataRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="App w-full h-full">
      <ExcelDataLoader
        onDataLoaded={setData}
        onNameOfWorkChange={setNameOfWork}
        onSecondNameOfWorkChange={setSecondNameOfWork}
      />

      {/* Навигационные кнопки */}
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        <DownloadExcelButton />
        <button
          onClick={() => setShowEditor(!showEditor)}
          className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-green-600 transition-colors"
        >
          {showEditor ? "Скрыть редактор" : "Добавить данные"}
        </button>
        <Link
          to={isVisualizationRoute ? "/table" : "/"}
          className="bg-indigo-500 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-indigo-600 transition-colors"
        >
          {isVisualizationRoute ? "Показать таблицу" : "Показать схему"}
        </Link>
      </div>

      {/* Кнопка переключения информации */}
      {isVisualizationRoute && (
        <button
          onClick={() => setIsInfoVisible(!isInfoVisible)}
          className="fixed top-4 left-4 z-50 bg-indigo-500 text-white p-2 rounded-full shadow-lg hover:bg-indigo-600 transition-colors"
        >
          {isInfoVisible ? "−" : "+"}
        </button>
      )}

      {/* Информационный блок */}
      {isVisualizationRoute && isInfoVisible && (
        <div className="fixed top-4 left-16 bg-white p-4 rounded-lg shadow-lg transition-all z-[9999]">
          <p className="text-lg font-semibold">Кафедра 317 МАИ</p>
          <p className="text-xl">{secondNameOfWork}</p>
        </div>
      )}

      {/* Редактор Excel */}
      {showEditor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Добавление новых данных</h2>
                <button
                  onClick={() => setShowEditor(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <ExcelEditor
                onSave={() => {
                  handleEditorSave();
                  setShowEditor(false);
                }}
              />
            </div>
          </div>
        </div>
      )}

      <Routes>
        <Route
          path="/"
          element={data && <DataSchemaVisualization data={data} />}
        />
        <Route
          path="/table"
          element={<DataTable data={data} onDataChange={handleDataRefresh} />}
        />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <MainLayout />
    </Router>
  );
}

export default App;
