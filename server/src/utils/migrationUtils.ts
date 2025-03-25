/**
 * Utilities for migrating data from local JSON to Firestore
 */
"use client";

import { getUserBacklog, storeUserBacklog } from '../firebase/firestore';
import { getCurrentUser } from '../firebase/auth';

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

    // In browser environment, we can't use fs directly
    // This function should be called with file content instead of path
    const backlogData = typeof filePath === 'string' 
      ? JSON.parse(filePath) // If string is passed, assume it's JSON content
      : filePath; // If object is passed, use it directly

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
    
    // In browser environment, create a Blob and download it
    const jsonString = JSON.stringify(backlogData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Create a download link and trigger it
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
    
    return { 
      success: true, 
      message: `バックログデータを ${filename} としてダウンロードしました` 
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
