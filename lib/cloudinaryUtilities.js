class CloudinaryUtilities {
  constructor (instance) {
    this.CloudinaryInstance = instance

    return this
  }

  update (publicId, payload) {
    return new Promise((resolve, reject) => {
      this.CloudinaryInstance.v2.api.update(publicId, payload, (err, result) => {
        if (err) {
          reject(err)
        }

        resolve(result)
      })
    })
  }

  delete (publicIds) {
    if (!Array.isArray(publicIds)) {
      publicIds = [publicIds]
    }

    return new Promise((resolve, reject) => {
      this.CloudinaryInstance.v2.api.delete_resources(publicIds, (err, result) => {
        if (err) {
          reject(err)
        }

        resolve(result)
      })
    })
  }
}

module.exports = CloudinaryUtilities
