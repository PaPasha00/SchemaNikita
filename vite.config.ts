import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs/promises'
import formidable from 'formidable'
import type { Connect } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'configure-server',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (req.url === '/api/saveExcel' && req.method === 'POST') {
            try {
              const form = formidable()
              const [_, files] = await form.parse(req)

              if (!files.file || !Array.isArray(files.file) || !files.file[0]) {
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({
                  success: false,
                  message: 'No file uploaded'
                }))
                return
              }

              const file = files.file[0]
              const publicDir = path.join(process.cwd(), 'public')
              const newPath = path.join(publicDir, 'newData.xlsx')

              // Убедимся, что директория существует
              await fs.mkdir(publicDir, { recursive: true })

              // Копируем временный файл в публичную директорию
              await fs.copyFile(file.filepath, newPath)

              // Удаляем временный файл
              await fs.unlink(file.filepath)

              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({
                success: true,
                message: 'File saved successfully'
              }))
            } catch (error) {
              console.error('Error saving file:', error)
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({
                success: false,
                message: 'Error saving file',
                error: error instanceof Error ? error.message : String(error)
              }))
            }
          } else {
            next()
          }
        })
      }
    }
  ]
})
