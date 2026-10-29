// chatUtils.js — 放在 src/ 資料夾內
// 用途：找到或建立兩個用戶之間的對話，供「聯絡賣家」按鈕呼叫

import {
  doc, setDoc, serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';

/**
 * 找到或建立兩位用戶之間的對話（冪等操作）
 *
 * @param {string} myUid       - 當前用戶的 uid
 * @param {string} myName      - 當前用戶的顯示名稱
 * @param {string} otherUid    - 對方的 uid
 * @param {string} otherName   - 對方的顯示名稱
 * @returns {string} convId    - 對話 document ID
 */
export async function findOrCreateConversation(myUid, myName, otherUid, otherName) {
  // 使用排序後的 uid 拼接，確保雙方看到同一份對話
  const convId = [myUid, otherUid].sort().join('_');

  const convRef = doc(db, 'conversations', convId);

  // setDoc + merge:true：若已存在則只補齊缺少的欄位，不覆蓋現有資料
  await setDoc(convRef, {
    participants: [myUid, otherUid],
    participantNames: {
      [myUid]: myName,
      [otherUid]: otherName,
    },
    // 以下欄位只在首次建立時設定，merge 模式下若已存在不會覆蓋
    lastMessage: '',
    lastMessageAt: serverTimestamp(),
    unreadCounts: {
      [myUid]: 0,
      [otherUid]: 0,
    },
  }, { merge: true });

  return convId;
}
