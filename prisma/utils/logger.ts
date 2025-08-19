export const log = {
  info: (msg: string) => console.log(msg),
  success: (msg: string) => console.log(`✅ ${msg}`),
  warn: (msg: string) => console.log(msg),
  error: (msg: string) => console.error(`❌ ${msg}`),
  progress: (current: number, total: number, item: string) =>
    console.log(`📊 Created ${current}/${total} ${item}`),
};
