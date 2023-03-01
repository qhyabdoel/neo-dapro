function cleanPayload<T>(object: T): T {
  return Object.entries(object).reduce(
    (acc, [key, value]) =>
      (typeof value !== 'undefined' &&
        value !== '' &&
        value !== null && { ...acc, [key]: value }) ||
      acc,
    {} as T
  )
}

export default cleanPayload
