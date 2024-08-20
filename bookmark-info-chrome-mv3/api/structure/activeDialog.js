class ActiveDialog {
  data = {}
  activeDialogTabId
  
  onTabChanged(tabId) {
    if (tabId !== this.activeDialogTabId)  {
      this.activeDialogTabId = tabId
      this.data = {}
    }
  }
  createBkmStandard (bookmarkId, parentId) {
    const isFirst = Object.values(this.data).filter(({ bookmarkId }) => bookmarkId).length === 0;
    this.data[parentId] = {
      ...this.data[parentId],
      bookmarkId,
      isFirst,
    }

    return this.data[parentId]
  }
  createBkmFromTag (parentId) {
    this.data[parentId] = {
      fromTag: true
    }
  }
  isCreatedInActiveDialog(bookmarkId, parentId) {
    const result = this.data[parentId]?.bookmarkId === bookmarkId 
      && this.data[parentId]?.isFirst === true
      && this.data[parentId]?.fromTag !== true

    return result
  }
  removeBkm(parentId) {
    delete this.data[parentId]
  }
}

export const activeDialog = new ActiveDialog()