import { exec } from 'node:child_process'
import type { ExtensionContext } from 'vscode'
import { StatusBarAlignment, window, workspace } from 'vscode'

function getUseVersion(): string {
  return workspace.getConfiguration('what-is-node-version').get('useVersion') as string
}

function getNodeVersion(): Promise<string> {
  return new Promise((resolve) => {
    exec('node -v', (error, stdout) => {
      if (error) {
        console.error(`exec error: ${error}`)
        return
      }

      resolve(`\$(tools) ${stdout}`)
    })
  })
}

export function activate(context: ExtensionContext) {
  let statusBarName = ''
  let statusBarColor: string | undefined

  const useVersion = getUseVersion()

  const statusBarItem = window.createStatusBarItem(StatusBarAlignment.Left, 100000)

  async function updateStatusBarItem() {
    statusBarName = await getNodeVersion()
    statusBarColor = '#297583'
    statusBarItem.text = statusBarName
    statusBarItem.color = statusBarColor
    statusBarItem.command = 'workbench.action.quickSwitchWindow'
    statusBarItem.tooltip = 'Node Version'
    statusBarItem.show()
  }

  async function isRightVersion() {
    const nowVersion = (await getNodeVersion()).split('v')[1]

    if (nowVersion) {
      return nowVersion === useVersion
    }
    else {
      // if can't get the version, don't show the message
      return true
    }
  }

  context.subscriptions.push(statusBarItem)

  updateStatusBarItem()

  let message: Thenable<string | undefined> | undefined

  setInterval(() => {
    updateStatusBarItem()
  }, 5000)

  window.onDidOpenTerminal(async () => {
    const res = await isRightVersion()
    if (!res && !message) {
      message = window.showErrorMessage('Node version is wrong, please change to use the right version')
      message.then(() => {
        message = undefined
      })
    }
  })
}

export function deactivate() {

}
