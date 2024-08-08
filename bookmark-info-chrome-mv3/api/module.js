export class ExtraMap extends Map {
  sum(key, addValue) {
    super.set(key, (super.get(key) || 0) + addValue)
  }
  update(key, updateObj) {
    super.set(key, {
      ...super.get(key),
      ...updateObj,
    })
  }
  concat(key, inItem) {
    const item = inItem === undefined ? [] : inItem
    // item -- single item or array
    const ar = super.get(key) || []
    super.set(key, ar.concat(item))
  }
}
