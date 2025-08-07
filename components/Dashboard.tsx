import React, { useState, useEffect, useCallback, useRef } from 'react';
import * as htmlToImage from 'html-to-image';
import JSZip from 'jszip';
import type { ReceiptData } from '../types';
import { generateStudentDetails, generateSignature } from '../services/geminiService';
import ControlPanel from './ControlPanel';
import Receipt from './Receipt';
import StudentList from './StudentList';
import Spinner from './Spinner';

const Dashboard: React.FC = () => {
    const defaultDate = new Date().toISOString().split('T')[0];
    const initialReceipt: ReceiptData = {
        id: `receipt-${Date.now()}`,
        receiptNo: `R${Math.floor(1000 + Math.random() * 9000)}`,
        issueDate: defaultDate,
        academicYear: `${new Date().getFullYear()}-${(new Date().getFullYear() + 1).toString().slice(-2)}`,
        schoolAddress: '123 Education Lane, Knowledge City, New Delhi, 110001, India',
        schoolPhone: '+91 98765 43210',
        receivedFrom: 'Priya Sharma',
        studentName: 'Aarav Sharma',
        classLevel: 'Class X',
        section: 'A',
        rollNo: 'S1024',
        majorSubject: 'Science',
        paymentFor: 'Annual Tuition Fees',
        amount: 50000,
        amountInWords: 'Fifty Thousand Rupees Only',
        paymentMode: 'UPI',
        paymentDetails: 'Transaction ID: UPI123456789'
    };
    
    const [receipts, setReceipts] = useState<ReceiptData[]>([initialReceipt]);
    const [selectedReceiptId, setSelectedReceiptId] = useState<string>(initialReceipt.id);
    const [studentListInput, setStudentListInput] = useState<string>('សុខា នី\nបូរ៉ា ចាន់\nធីតា ស៊ុន');
    const [signatureUrl, setSignatureUrl] = useState<string | null>(null);
    const [logoUrl, setLogoUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isBatchLoading, setIsBatchLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const receiptRef = useRef<HTMLDivElement>(null);
    const hiddenReceiptsRef = useRef<HTMLDivElement>(null);
    
    const selectedReceipt = receipts.find(r => r.id === selectedReceiptId) || receipts[0];

    const generateNewSignature = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const url = await generateSignature();
            setSignatureUrl(url);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        generateNewSignature();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    
    const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setLogoUrl(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleRemoveLogo = () => {
        setLogoUrl(null);
    };

    const handleUpdateSingleReceipt = (field: keyof ReceiptData, value: string | number) => {
        setReceipts(prevReceipts => prevReceipts.map(r => 
            r.id === selectedReceiptId ? { ...r, [field]: value } : r
        ));
    };

    const handleBatchGenerate = async () => {
        const names = studentListInput.split('\n').map(name => name.trim()).filter(name => name.length > 0);
        if (names.length === 0) {
            setError("សូមបញ្ចូលឈ្មោះសិស្សយ៉ាងហោចណាស់ម្នាក់សម្រាប់ការបង្កើតជាកញ្ចប់។");
            return;
        }

        setIsBatchLoading(true);
        setError(null);
        try {
            const details = await generateStudentDetails(names);
            const currentYear = new Date().getFullYear();
            const newReceipts = details.map((detail, index) => ({
                ...detail,
                id: `receipt-batch-${Date.now()}-${index}`,
                receiptNo: `R${Math.floor(10000 + Math.random() * 90000) + index}`,
                issueDate: new Date().toISOString().split('T')[0],
                academicYear: `${currentYear}-${(currentYear + 1).toString().slice(-2)}`,
                receivedFrom: detail.studentName.split(' ').pop() || detail.studentName,
                paymentFor: 'Annual Tuition Fees',
                studentName: detail.studentName,
                rollNo: detail.rollNo.toString(),
                schoolAddress: selectedReceipt?.schoolAddress || initialReceipt.schoolAddress,
                schoolPhone: selectedReceipt?.schoolPhone || initialReceipt.schoolPhone,
            }));
            setReceipts(newReceipts);
            setSelectedReceiptId(newReceipts[0]?.id || '');
        } catch (err) {
            setError(err instanceof Error ? `មានបញ្ហាពេលបង្កើតជាកញ្ចប់៖ ${err.message}` : 'មានបញ្ហាដែលមិនស្គាល់អត្តសញ្ញាណបានកើតឡើងក្នុងអំឡុងពេលបង្កើតជាកញ្ចប់។');
        } finally {
            setIsBatchLoading(false);
        }
    };

    const handleDownloadSingle = useCallback(() => {
        if (!receiptRef.current) return;
        
        const fileName = `Tuition_Receipt-${selectedReceipt?.studentName.replace(/\s/g, '_') || 'receipt'}.png`;

        htmlToImage.toPng(receiptRef.current, { quality: 1.0, pixelRatio: 3 })
            .then((dataUrl: string) => {
                const link = document.createElement('a');
                link.download = fileName;
                link.href = dataUrl;
                link.click();
            })
            .catch((err: Error) => {
                setError(`បរាជ័យក្នុងការបង្កើតរូបភាព៖ ${err.message}`);
            });
    }, [receiptRef, selectedReceipt]);

    const handleBatchDownload = useCallback(async () => {
        if (!hiddenReceiptsRef.current || receipts.length === 0) return;
        
        setIsBatchLoading(true);
        setError(null);
        try {
            const zip = new JSZip();
            const receiptNodes = hiddenReceiptsRef.current.children;

            for (let i = 0; i < receiptNodes.length; i++) {
                const node = receiptNodes[i] as HTMLElement;
                const receipt = receipts[i];
                const fileName = `Tuition_Receipt_${receipt.studentName.replace(/\s/g, '_')}_${receipt.receiptNo}.png`;
                
                const dataUrl = await htmlToImage.toPng(node, { quality: 1.0, pixelRatio: 2 });
                const blob = await (await fetch(dataUrl)).blob();
                zip.file(fileName, blob);
            }

            const content = await zip.generateAsync({ type: 'blob' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(content);
            link.download = `Tuition_Receipts_Batch_${new Date().toISOString().split('T')[0]}.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

        } catch (err) {
            setError(`បរាជ័យក្នុងការបង្កើតឯកសារ zip៖ ${err instanceof Error ? err.message : 'Unknown error'}`);
        } finally {
            setIsBatchLoading(false);
        }
    }, [receipts, signatureUrl, logoUrl]);

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <header className="mb-8 text-center">
                <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">កម្មវិធីបង្កើតវិក្កយបត្រសិក្សាដោយ AI</h1>
                <p className="mt-2 text-md text-slate-600 dark:text-slate-400">បង្កើត ប្ដូរតាមបំណង និងទាញយកវិក្កយបត្រសិក្សាផ្លូវការដោយងាយស្រួល។</p>
            </header>

            {error && (
                <div className="my-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md" role="alert">
                    <strong className="font-bold">មានបញ្ហា៖ </strong>
                    <span className="block sm:inline">{error}</span>
                </div>
            )}
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center h-[700px]">
                                <Spinner />
                                <p className="mt-4 text-slate-500">កំពុងបង្កើតហត្ថលេខា AI...</p>
                            </div>
                        ) : selectedReceipt ? (
                           <Receipt ref={receiptRef} receipt={selectedReceipt} signatureUrl={signatureUrl} logoUrl={logoUrl} />
                        ) : (
                            <div className="flex items-center justify-center h-[700px] text-slate-500">បង្កើតវិក្កយបត្រដើម្បីមើលជាមុន។</div>
                        )}
                    </div>
                </div>

                <div className="space-y-8">
                    <ControlPanel
                        onUpdateSingleReceipt={handleUpdateSingleReceipt}
                        selectedReceipt={selectedReceipt}
                        onDownloadSingle={handleDownloadSingle}
                        onGenerateSignature={generateNewSignature}
                        isGeneratingSignature={isLoading}
                        studentListInput={studentListInput}
                        setStudentListInput={setStudentListInput}
                        onBatchGenerate={handleBatchGenerate}
                        onBatchDownload={handleBatchDownload}
                        isBatchLoading={isBatchLoading}
                        receiptCount={receipts.length}
                        logoUrl={logoUrl}
                        onLogoUpload={handleLogoUpload}
                        onRemoveLogo={handleRemoveLogo}
                    />
                    <StudentList
                        receipts={receipts}
                        selectedReceiptId={selectedReceiptId}
                        onSelectReceipt={setSelectedReceiptId}
                    />
                </div>
            </div>

            {/* Hidden container for batch downloads */}
            <div ref={hiddenReceiptsRef} className="absolute -left-[9999px] top-0 opacity-0">
                {receipts.map(r => (
                    <div key={`hidden-${r.id}`} style={{ width: '800px' }}>
                         <Receipt receipt={r} signatureUrl={signatureUrl} logoUrl={logoUrl} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Dashboard;