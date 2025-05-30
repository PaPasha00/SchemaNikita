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
import type { ProjectData } from "./types/dataTypes";

function MainLayout() {
  const [data, setData] = useState<ProjectData | null>(null);
  const [_, setNameOfWork] = useState<string>("");
  const [secondNameOfWork, setSecondNameOfWork] = useState<string>("");
  const [isInfoVisible, setIsInfoVisible] = useState(true);
  const location = useLocation();

  const isVisualizationRoute = location.pathname === "/";

  return (
    <div className="App w-full h-full">
      <ExcelDataLoader
        onDataLoaded={setData}
        onNameOfWorkChange={setNameOfWork}
        onSecondNameOfWorkChange={setSecondNameOfWork}
      />

      {/* Навигационная кнопка */}
      <Link
        to={isVisualizationRoute ? "/table" : "/"}
        className="fixed top-4 right-4 z-50 bg-indigo-500 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-indigo-600 transition-colors"
      >
        {isVisualizationRoute ? "Показать таблицу" : "Показать схему"}
      </Link>

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
        <div className="fixed top-4 left-16 bg-white p-4 rounded-lg shadow-lg transition-all">
          <p className="text-lg font-semibold">Кафедра 317 МАИ</p>
          <p className="text-xl">{secondNameOfWork}</p>
        </div>
      )}

      <Routes>
        <Route
          path="/"
          element={data && <DataSchemaVisualization data={data} />}
        />
        <Route path="/table" element={<DataTable data={data} />} />
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
