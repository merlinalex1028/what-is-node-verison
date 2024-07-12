import { exec } from 'node:child_process'
import type { ExtensionContext } from 'vscode'
import { StatusBarAlignment, commands, window, workspace } from 'vscode'

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
  let useVersion: string | undefined

  useVersion = getUseVersion()

  const statusBarItem = window.createStatusBarItem(StatusBarAlignment.Left, 100000)

  // 注册命令
  const disposable = commands.registerCommand('extension.openTerminal', () => {
    // 创建一个新的终端
    const terminal = window.createTerminal(`Ext Terminal`)
    terminal.show(true) // true表示终端在获得焦点时会被带到前台
  })

  context.subscriptions.push(disposable)

  async function updateStatusBarItem() {
    statusBarName = await getNodeVersion()
    statusBarColor = '#297583'
    statusBarItem.text = statusBarName
    statusBarItem.color = statusBarColor
    statusBarItem.command = 'extension.openTerminal'
    statusBarItem.tooltip = 'Node Version'
    statusBarItem.show()
  }

  async function isRightVersion() {
    const nowVersion = (await getNodeVersion()).split('v')[1].split('\n')[0]

    if (useVersion) {
      return nowVersion === useVersion
    }
    else {
      // if can't get the version, don't show the message
      return true
    }
  }

  context.subscriptions.push(statusBarItem)

  updateStatusBarItem()

  setInterval(() => {
    updateStatusBarItem()
  }, 5000)

  window.onDidOpenTerminal(async () => {
    const res = await isRightVersion()
    if (!res) {
      window.showErrorMessage('Node version is wrong, please change to use the right version')
    }
  })

  workspace.onDidChangeConfiguration(() => {
    useVersion = getUseVersion()
  })
}

export function deactivate() {

}
