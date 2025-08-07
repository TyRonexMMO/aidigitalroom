import React from 'react';
import type { ReceiptData } from '../types';

interface StudentListProps {
  receipts: ReceiptData[];
  selectedReceiptId: string;
  onSelectReceipt: (id: string) => void;
}

const StudentList: React.FC<StudentListProps> = ({ receipts, selectedReceiptId, onSelectReceipt }) => {
  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg">
      <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white border-b pb-2">វិក្កយបត្រដែលបានបង្កើត</h3>
      <div className="bg-yellow-100 dark:bg-yellow-900/20 p-4 rounded-lg h-64 overflow-y-auto border-l-4 border-red-400">
        {receipts.length > 0 ? (
          <ul className="space-y-2">
            {receipts.map((receipt) => (
              <li key={receipt.id}>
                <button
                  onClick={() => onSelectReceipt(receipt.id)}
                  className={`w-full text-left p-2 rounded-md transition-colors ${
                    selectedReceiptId === receipt.id
                      ? 'bg-blue-200 dark:bg-blue-900/50 font-bold'
                      : 'hover:bg-yellow-200 dark:hover:bg-yellow-800/30'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-slate-800 dark:text-slate-200">{receipt.studentName}</span>
                    <span className="text-sm text-slate-500 dark:text-slate-400">#{receipt.receiptNo}</span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-slate-500 dark:text-slate-400 text-center pt-8">មិនទាន់មានវិក្កយបត្រដែលបានបង្កើតទេ។ សូមប្រើកម្មវិធីបង្កើតជាកញ្ចប់ដើម្បីបង្កើតវិក្កយបត្រ។</p>
        )}
      </div>
    </div>
  );
};

export default StudentList;