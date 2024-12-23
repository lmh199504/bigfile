export const guid = (): string => {
  function S4() {
      return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  }
  return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
}


export function formatFileSize(size: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']
  const threshold = 1024

  if (size === 0) {
    return '0 B'
  }

  const i = Math.floor(Math.log(size) / Math.log(threshold))

  return Number((size / Math.pow(threshold, i)).toFixed(2)) * 1 + ' ' + units[i]
}


export const formatSpeed = (speed: number): string => {
  const units = ['B/s', 'KB/s', 'MB/s', 'GB/s', 'TB/s', 'PB/s']
  const threshold = 1024

  if (speed === 0) {
    return '0 B/s'
  }

  const i = Math.floor(Math.log(speed) / Math.log(threshold))

  return Number((speed / Math.pow(threshold, i)).toFixed(2)) * 1 + ' ' + units[i]
} 