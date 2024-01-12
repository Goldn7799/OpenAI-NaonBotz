const fs = require('fs')

const rootDir = process.cwd()

const saveMedia = async (isTemporary, type, id, data) => {
  return new Promise((resolve) => {
    if (type && id && data && (`${isTemporary}` === 'true' || `${isTemporary}` === 'false')) {
      const buffer = Buffer.from(data, 'base64')
      fs.writeFileSync(`${rootDir}/data-store/storage/${type}-${id}.png`, buffer)
      resolve(true)
    } else {
      resolve(false)
    }
  })
}

const delMedia = async (id, type) => {
  return new Promise((resolve) => {
    fs.rm(`${rootDir}/data-store/storage/${type}-${id}.png`, (err) => {
      if (err) {
        resolve(false)
      } else {
        resolve(true)
      }
    })
  })
}

module.exports = {
  saveMedia,
  delMedia
}
