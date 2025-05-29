import type { ProjectData } from '../types/dataTypes';

export const sampleData: ProjectData = {
  name: "фыв",
  countries: [
    {
      country: "ru",
      types: [
        {
          type: "Компания",
          companies: [
            {company: "Сбер", year: "2023", description: "Крупнейший финансовый институт России"},
            {company: "Яндекс", year: "2022", description: "Ведущая технологическая компания"}
          ]
        },
        {
          type: "Стартап",
          companies: [
            {company: "Cognitive Pilot", year: "2021", description: "Разработчик систем ИИ для транспорта"}
          ]
        }
      ]
    },
    {
      country: "us",
      types: [
        {
          type: "Корпорация",
          companies: [
            {company: "Google", year: "2024", description: "Мировой лидер в поисковых технологиях"}
          ]
        },
        {
          type: "Стартап",
          companies: [
            {company: "OpenAI", year: "2023", description: "Исследовательская компания в области ИИ"}
          ]
        }
      ]
    },
    {
      country: "cn",
      types: [
        {
          type: "Государственный",
          companies: [
            {company: "Huawei", year: "2022", description: "Крупнейший поставщик инфраструктуры ИКТ"}
          ]
        }
      ]
    }
  ]
};