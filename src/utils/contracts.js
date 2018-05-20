export function promisify (contractCall, param) {
  return new Promise((resolve, reject) => {
    if (param !== undefined) {
      contractCall(param, (error, result) => {
        if (result){
          resolve(result)
        } else {
          reject()
        }
      })
    } else {
      contractCall((error, result) => {
        if (result){
          resolve(result)
        } else {
          reject()
        }
      })
    }
  })
}
