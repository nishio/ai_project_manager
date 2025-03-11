/**
 * Utilities for migrating data from local JSON to Firestore
 */
import { getUserBacklog, storeUserBacklog } from '../firebase/firestore';
import { getCurrentUser } from '../firebase/auth';
import { readFileSync } from 'fs';
import path from 'path';

/**
 * Import backlog data from a local JSON file to Firestore
 * @param filePath Path to the local backlog.json file
 * @returns Success status and message
 */
export async function importBacklogFromFile(filePath: string) {
  try {
    const user = getCurrentUser();
    if (!user) {
      return { success: false, message: 'ユーザーが認証されていません' };
    }

    // Read the local file
    const fileContent = readFileSync(filePath, 'utf-8');
    const backlogData = JSON.parse(fileContent);

    // Store in Firestore
    await storeUserBacklog(user.uid, backlogData);
    
    return { 
      success: true, 
      message: 'バックログデータを正常にインポートしました' 
    };
  } catch (error) {
    console.error('Error importing backlog:', error);
    return { 
      success: false, 
      message: `インポート中にエラーが発生しました: ${error instanceof Error ? error.message : String(error)}` 
    };
  }
}

/**
 * Export backlog data from Firestore to a local JSON file
 * @param outputPath Directory to save the exported file
 * @returns Success status and message
 */
export async function exportBacklogToFile(outputPath: string) {
  try {
    const user = getCurrentUser();
    if (!user) {
      return { success: false, message: 'ユーザーが認証されていません' };
    }

    // Get data from Firestore
    const backlogDoc = await getUserBacklog(user.uid);
    if (!backlogDoc.exists()) {
      return { success: false, message: 'バックログデータが見つかりません' };
    }

    const backlogData = backlogDoc.data()?.data;
    
    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const filename = `backlog_export_${timestamp}.json`;
    const fullPath = path.join(outputPath, filename);
    
    // Write to file (this will only work in Node.js environment, not in browser)
    // For browser, we would need to use a different approach like Blob and download
    const fs = require('fs');
    fs.writeFileSync(fullPath, JSON.stringify(backlogData, null, 2), 'utf-8');
    
    return { 
      success: true, 
      message: `バックログデータを ${fullPath} に正常にエクスポートしました` 
    };
  } catch (error) {
    console.error('Error exporting backlog:', error);
    return { 
      success: false, 
      message: `エクスポート中にエラーが発生しました: ${error instanceof Error ? error.message : String(error)}` 
    };
  }
}

/**
 * Check if a user has existing backlog data in Firestore
 * @returns Boolean indicating if user has data
 */
export async function hasFirestoreBacklog() {
  try {
    const user = getCurrentUser();
    if (!user) {
      return false;
    }

    const backlogDoc = await getUserBacklog(user.uid);
    return backlogDoc.exists();
  } catch (error) {
    console.error('Error checking backlog existence:', error);
    return false;
  }
}
