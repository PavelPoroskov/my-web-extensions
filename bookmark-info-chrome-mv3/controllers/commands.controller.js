import {
  startAddBookmarkFromSelection,
} from '../api/command/index.js'
import {
  makeLogFunction,
} from '../api/log.api.js'

const logCC = makeLogFunction({ module: 'commands.controller' })

export const commandsController = {
  async onCommand (command) {
    logCC('commandsController.onCommand', command);

    switch (command) {
      case 'add-bkm-from-selection': {
        startAddBookmarkFromSelection()
        break;
      }
    }
  }
}