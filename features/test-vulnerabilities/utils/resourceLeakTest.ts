/**
 * TEST FILE: Resource Leak Issues
 * This file contains intentional vulnerabilities for testing CodeQL
 * DO NOT USE IN PRODUCTION
 */

import * as fs from 'fs';
import * as path from 'path';

// Issue 1: File handle not closed
export function readFileWithoutClosing(filename: string) {
  // ❌ VULNERABILITY: File handle never closed
  const fileHandle = fs.openSync(filename, 'r');
  const content = fs.readFileSync(filename, 'utf8');
  // Missing: fs.closeSync(fileHandle)
  return content;
}

// Issue 2: Stream not closed
export function writeToFile(filename: string, data: string) {
  // ❌ VULNERABILITY: Write stream never closed
  const writeStream = fs.createWriteStream(filename);
  writeStream.write(data);
  // Missing: writeStream.end() or writeStream.close()
  return true;
}

// Issue 3: Multiple file handles opened, none closed
export function processMultipleFiles(filenames: string[]) {
  // ❌ VULNERABILITY: Multiple file handles opened, none closed
  const handles: number[] = [];
  
  for (const filename of filenames) {
    const handle = fs.openSync(filename, 'r');
    handles.push(handle);
    // Process file but never close
  }
  
  return handles.length;
}

// Issue 4: Error path doesn't close resource
export function readFileWithError(filename: string) {
  // ❌ VULNERABILITY: If error occurs, file handle leaks
  const fileHandle = fs.openSync(filename, 'r');
  
  try {
    const content = fs.readFileSync(filename, 'utf8');
    if (content.length === 0) {
      throw new Error('Empty file');
      // File handle never closed if error thrown
    }
    return content;
  } catch (error) {
    // Missing: fs.closeSync(fileHandle) in finally block
    throw error;
  }
}

// Issue 5: Async file operation without cleanup
export async function asyncFileOperation(filename: string) {
  // ❌ VULNERABILITY: Async operation, resource may not be cleaned up
  const fileHandle = await fs.promises.open(filename, 'r');
  const content = await fileHandle.readFile({ encoding: 'utf8' });
  // Missing: await fileHandle.close()
  return content;
}

// Issue 6: Database-like connection pattern (simulated)
export class DatabaseConnection {
  private connected = false;
  
  connect() {
    this.connected = true;
    // Simulated connection
  }
  
  query(sql: string) {
    if (!this.connected) {
      throw new Error('Not connected');
    }
    return { rows: [] };
  }
  
  // ❌ VULNERABILITY: No disconnect/close method
  // Missing: disconnect() or close() method
}

export function useDatabase() {
  // ❌ VULNERABILITY: Connection never closed
  const db = new DatabaseConnection();
  db.connect();
  const result = db.query('SELECT * FROM users');
  // Missing: db.disconnect()
  return result;
}

