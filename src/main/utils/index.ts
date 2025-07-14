import { execa } from 'execa'

export const setExecutablePermission = async (filePath: string): Promise<void> => {
  await execa('chmod', ['+x', filePath])
}
