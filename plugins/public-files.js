import fs from 'fs'
import path from 'path'

export default function () {
  this.nuxt.hook('generate:done', async (generator) => {
    // 获取public目录下的所有JSON文件
    const publicDir = path.join(generator.options.srcDir, 'public')
    try {
      if (fs.existsSync(publicDir)) {
        const files = fs.readdirSync(publicDir)
          .filter(file => file.endsWith('.json') && /^\d{6}\.json$/.test(file))
        
        // 创建文件列表JSON
        const outputPath = path.join(generator.options.generate.dir, '_nuxt', 'public-files.json')
        fs.writeFileSync(outputPath, JSON.stringify(files))

        console.log('Public files list generated:', outputPath)
      }
    } catch (error) {
      console.error('Error generating public files list:', error)
    }
  })
} 