export const setExecutablePermission = async (
  filePath: string
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const { exec } = require('child_process');
    exec(`chmod +x "${filePath}"`, (error: any) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
};
