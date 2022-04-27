import * as fs from 'fs/promises';

export function findDayOfWeek(d: string, days: number) {
  const date = new Date(d);
  const diff =
    date.getDate() - date.getUTCDay() + (date.getUTCDay() === 0 ? 0 : days);
  date.setDate(diff);
  date.setUTCHours(0, 0, 0, 0);
  return date;
}
export async function writeToJSON(newDB: any, path: string) {
  const updatedDB = JSON.stringify(newDB, null, 2);
  try {
    await fs.writeFile(path, updatedDB);
  } catch (err) {
    console.log(err);
  }
}

export async function getJSON(path: string) {
  let userDB;
  try {
    userDB = await fs.readFile(path);
    return JSON.parse(userDB);
  } catch (err) {
    console.log(err);
  }
}
