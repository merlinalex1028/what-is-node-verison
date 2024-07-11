import { exec } from 'node:child_process'
import type { ExtensionContext } from 'vscode'
import { StatusBarAlignment, window } from 'vscode'

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

  context.subscriptions.push(statusBarItem)

  updateStatusBarItem()

  setInterval(() => {
    updateStatusBarItem()
  }, 5000)
}

export function deactivate() {

}
