// src/utils/initializeFiles.ts
import fs from 'fs';
import path from 'path';
import { CONFIG } from '../config/config';

export const initializeCSVFiles = () => {
  // Dataディレクトリが存在しない場合は作成
  const dataDir = 'Data';
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
  }

  // 各CSVファイルの存在確認と作成
  Object.values(CONFIG.CSV_FILES).forEach(filePath => {
    if (!fs.existsSync(filePath)) {
      // ヘッダー行を追加してファイルを作成
      fs.writeFileSync(filePath, '', 'utf-8');
      console.log(`Created file: ${filePath}`);
    }
  });
};