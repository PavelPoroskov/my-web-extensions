import {
  startAddBookmarkFromSelection,
} from '../api/command/index.js'
import {
  makeLogFunction,
} from '../api/log.api.js'
import {
  KEYBOARD_CMD_ID,
} from '../constant/index.js';

const logCC = makeLogFunction({ module: 'commands.controller' })

export const commandsController = {
  async onCommand (command) {
    logCC('commandsController.onCommand', command);

    switch (command) {
      case KEYBOARD_CMD_ID.ADD_BOOKMARK_FROM_SELECTION_KBD: {
        startAddBookmarkFromSelection()
        break;
      }
    }
  }
}