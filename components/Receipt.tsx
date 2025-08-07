import React, { forwardRef } from 'react';
import type { ReceiptData } from '../types';

interface ReceiptProps {
  receipt: ReceiptData;
  signatureUrl: string | null;
  logoUrl: string | null;
}

const Receipt = forwardRef<HTMLDivElement, ReceiptProps>(({ receipt, signatureUrl, logoUrl }, ref) => {
  if (!receipt) {
    return <div ref={ref}>No receipt data</div>;
  }
  
  return (
    <div ref={ref} className="bg-white p-8 font-sans text-black relative aspect-[1/1.414] w-full max-w-[800px] mx-auto border-2 border-black">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-[13rem] font-black text-red-500 opacity-15 transform -rotate-15 select-none">
          PAID
        </div>
      </div>
      
      <div className="relative z-10">
        <header className="mb-6 border-b-2 border-black pb-4 text-center">
          {logoUrl && (
              <div className="flex justify-center mb-4">
                  <img src={logoUrl} alt="School Logo" className="max-h-24 w-auto object-contain" />
              </div>
          )}
          <div className="text-center text-sm text-black mb-4">
              <p>{receipt.schoolAddress}</p>
              <p><strong className="font-bold">Phone:</strong> {receipt.schoolPhone}</p>
          </div>
          <div className="inline-block bg-black text-white px-6 py-1 text-2xl font-semibold mt-2">TUITION FEE RECEIPT</div>
        </header>

        <div className="flex justify-between mb-4 text-md">
          <p className="text-black"><strong className="font-bold">Receipt No:</strong> {receipt.receiptNo}</p>
          <p className="text-black"><strong className="font-bold">Date:</strong> {new Date(receipt.issueDate).toLocaleDateString('en-IN')}</p>
        </div>
        <div className="mb-4 text-md">
           <p className="text-black"><strong className="font-bold">Academic Year:</strong> {receipt.academicYear}</p>
        </div>

        <div className="mb-4 text-md">
          <p className="text-black">
            <strong className="font-bold">Received with thanks from:</strong> {receipt.receivedFrom}
          </p>
        </div>

        <table className="w-full border-collapse border border-black mb-4 text-md">
          <tbody>
            <tr className="border border-black">
              <td className="p-2 font-bold w-1/3 text-black">Student Name</td>
              <td className="p-2 font-normal text-black">{receipt.studentName}</td>
            </tr>
            <tr className="border border-black">
              <td className="p-2 font-bold text-black">Class & Section</td>
              <td className="p-2 font-normal text-black">{receipt.classLevel} - {receipt.section}</td>
            </tr>
            <tr className="border border-black">
              <td className="p-2 font-bold text-black">Roll No.</td>
              <td className="p-2 font-normal text-black">{receipt.rollNo}</td>
            </tr>
            <tr className="border border-black">
              <td className="p-2 font-bold text-black">Major Subject/Skill</td>
              <td className="p-2 font-normal text-black">{receipt.majorSubject}</td>
            </tr>
          </tbody>
        </table>

        <div className="mb-4 text-md">
          <p className="text-black">
            <strong className="font-bold">Payment for:</strong> {receipt.paymentFor}
          </p>
        </div>

        <div className="flex justify-end items-center mb-4 border-t-2 border-b-2 border-black py-3">
            <span className="text-xl font-bold mr-6 text-black">TOTAL</span>
            <span className="text-2xl font-bold text-black">₹{receipt.amount.toLocaleString('en-IN')}</span>
        </div>
        
        <div className="mb-6 text-md">
          <p className="text-black">
            <strong className="font-bold">Amount in Words:</strong> {receipt.amountInWords}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-16 text-md">
            <div className="text-black">
                <strong className="font-bold">Payment Mode:</strong> {receipt.paymentMode}
            </div>
             <div className="text-black">
                <strong className="font-bold">Payment Details:</strong> {receipt.paymentDetails}
            </div>
        </div>

        <div className="flex justify-end items-center mt-12">
          <div className="w-1/3 text-center">
            {signatureUrl ? (
              <img src={signatureUrl} alt="Signature" className="h-16 mx-auto -mb-4 -mt-4"/>
            ) : <div className="h-16 w-full flex items-center justify-center text-gray-400">Processing the Signature...</div>}
            <p className="border-t-2 border-black pt-2 font-bold text-black">Principla / Accountant</p>
          </div>
        </div>
      </div>
    </div>
  );
});

Receipt.displayName = 'Receipt';
export default Receipt;