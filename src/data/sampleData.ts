import type { ProjectData } from '../types/dataTypes';

export const sampleData: ProjectData = {
  name: "Анализ рынка ИИ",
  countries: [
    {
      country: "Россия",
      types: [
        {
          type: "Финансы и IT",
          companies: [
            {
              id: "1",
              company: "Сбер",
              year: "2023",
              description: "Крупнейший финансовый институт России"
            },
            {
              id: "2",
              company: "Яндекс",
              year: "2022",
              description: "Ведущая технологическая компания"
            }
          ]
        },
        {
          type: "Промышленность",
          companies: [
            {
              id: "3",
              company: "Cognitive Pilot",
              year: "2021",
              description: "Разработчик систем ИИ для транспорта"
            }
          ]
        }
      ]
    },
    {
      country: "США",
      types: [
        {
          type: "IT",
          companies: [
            {
              id: "4",
              company: "Google",
              year: "2024",
              description: "Мировой лидер в поисковых технологиях"
            }
          ]
        },
        {
          type: "ИИ",
          companies: [
            {
              id: "5",
              company: "OpenAI",
              year: "2023",
              description: "Исследовательская компания в области ИИ"
            }
          ]
        }
      ]
    },
    {
      country: "Китай",
      types: [
        {
          type: "Телекоммуникации",
          companies: [
            {
              id: "6",
              company: "Huawei",
              year: "2022",
              description: "Крупнейший поставщик инфраструктуры ИКТ"
            }
          ]
        }
      ]
    }
  ]
};