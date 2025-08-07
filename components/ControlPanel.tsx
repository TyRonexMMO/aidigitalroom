import React from 'react';
import type { ReceiptData } from '../types';
import { DownloadIcon } from './icons/DownloadIcon';
import { BatchDownloadIcon } from './icons/BatchDownloadIcon';
import { GenerateIcon } from './icons/GenerateIcon';
import Spinner from './Spinner';


interface ControlPanelProps {
    selectedReceipt: ReceiptData;
    onUpdateSingleReceipt: (field: keyof ReceiptData, value: string | number) => void;
    onDownloadSingle: () => void;
    onGenerateSignature: () => void;
    isGeneratingSignature: boolean;
    studentListInput: string;
    setStudentListInput: (value: string) => void;
    onBatchGenerate: () => void;
    onBatchDownload: () => void;
    isBatchLoading: boolean;
    receiptCount: number;
    logoUrl: string | null;
    onLogoUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onRemoveLogo: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
    selectedReceipt,
    onUpdateSingleReceipt,
    onDownloadSingle,
    onGenerateSignature,
    isGeneratingSignature,
    studentListInput,
    setStudentListInput,
    onBatchGenerate,
    onBatchDownload,
    isBatchLoading,
    receiptCount,
    logoUrl,
    onLogoUpload,
    onRemoveLogo
}) => {
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const isNumber = e.target.getAttribute('type') === 'number';
        onUpdateSingleReceipt(name as keyof ReceiptData, isNumber ? parseFloat(value) : value);
    };

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg space-y-8">
             {/* School Details Section */}
             <div>
                <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white border-b pb-2">ព័ត៌មានលម្អិតអំពីសាលា</h3>
                <div className="space-y-4">
                   <InputField label="អាសយដ្ឋាន" name="schoolAddress" type="textarea" value={selectedReceipt.schoolAddress} onChange={handleInputChange} />
                   <InputField label="ទូរស័ព្ទ" name="schoolPhone" value={selectedReceipt.schoolPhone} onChange={handleInputChange} />
                
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">និមិត្តសញ្ញាសាលា</label>
                        {logoUrl && (
                            <div className="flex items-center gap-4 my-2">
                                <img src={logoUrl} alt="School Logo" className="h-16 w-16 object-contain border p-1 rounded-md bg-slate-50"/>
                            </div>
                        )}
                         <div className="flex gap-2">
                            <label htmlFor="logo-upload" className="cursor-pointer flex-grow text-center bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-semibold py-2 px-4 rounded-lg transition-colors">
                                {logoUrl ? 'ផ្លាស់ប្តូរនិមិត្តសញ្ញា' : 'ផ្ទុកឡើងនិមិត្តសញ្ញា'}
                            </label>
                            <input id="logo-upload" type="file" className="hidden" accept="image/*" onChange={onLogoUpload} />
                            {logoUrl && (
                                <button onClick={onRemoveLogo} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                                    ដកចេញ
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Single Receipt Section */}
            <div>
                <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white border-b pb-2">ប្ដូរវិក្កយបត្រទោលតាមបំណង</h3>
                {selectedReceipt ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField label="ឈ្មោះ​សិស្ស" name="studentName" value={selectedReceipt.studentName} onChange={handleInputChange} />
                        <InputField label="ថ្នាក់" name="classLevel" value={selectedReceipt.classLevel} onChange={handleInputChange} />
                        <InputField label="ចំនួនទឹកប្រាក់" name="amount" type="number" value={selectedReceipt.amount} onChange={handleInputChange} />
                        <InputField label="ចំនួនទឹកប្រាក់ជាអក្សរ" name="amountInWords" value={selectedReceipt.amountInWords} onChange={handleInputChange} />
                        <InputField label="វិក្កយបត្រលេខ" name="receiptNo" value={selectedReceipt.receiptNo} onChange={handleInputChange} />
                        <InputField label="កាលបរិច្ឆេទចេញ" name="issueDate" type="date" value={selectedReceipt.issueDate} onChange={handleInputChange} />
                        <div className="md:col-span-2">
                             <button onClick={onDownloadSingle} className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                                <DownloadIcon />
                                ទាញយកវិក្កយបត្របច្ចុប្បន្ន
                            </button>
                        </div>
                    </div>
                ) : <p className="text-slate-500">ជ្រើសរើសវិក្កយបត្រដើម្បីប្ដូរតាមបំណង។</p>}
            </div>

            {/* Batch Generate Section */}
            <div>
                <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white border-b pb-2">ការបង្កើតជាកញ្ចប់</h3>
                <div className="space-y-4">
                    <label htmlFor="studentList" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                        បញ្ចូលឈ្មោះសិស្ស (មួយឈ្មោះក្នុងមួយបន្ទាត់)
                    </label>
                    <textarea
                        id="studentList"
                        rows={4}
                        className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-indigo-500"
                        value={studentListInput}
                        onChange={(e) => setStudentListInput(e.target.value)}
                        placeholder="Priya Patel&#10;Arjun Singh&#10;Ananya Rao"
                    />
                    <button onClick={onBatchGenerate} disabled={isBatchLoading} className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:bg-teal-400">
                         {isBatchLoading ? <Spinner /> : <GenerateIcon />}
                        {isBatchLoading ? 'កំពុងបង្កើត...' : `បង្កើត ${studentListInput.split('\n').filter(n=>n).length} វិក្កយបត្រ`}
                    </button>
                    <button onClick={onBatchDownload} disabled={isBatchLoading || receiptCount === 0} className="w-full flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:bg-sky-400">
                        {isBatchLoading ? <Spinner /> : <BatchDownloadIcon />}
                        {isBatchLoading ? 'កំពុងបង្ហាប់...' : `ទាញយកជាកញ្ចប់ (${receiptCount})`}
                    </button>
                </div>
            </div>
             {/* Signature Section */}
             <div>
                <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white border-b pb-2">ហត្ថលេខា</h3>
                 <button onClick={onGenerateSignature} disabled={isGeneratingSignature} className="w-full flex items-center justify-center gap-2 bg-slate-600 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:bg-slate-400">
                    {isGeneratingSignature ? <Spinner /> : <GenerateIcon />}
                    បង្កើតហត្ថលេខាថ្មី
                </button>
            </div>
        </div>
    );
};

// Helper component for input fields
interface InputFieldProps {
    label: string;
    name: keyof ReceiptData;
    value: string | number;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    type?: string;
}
const InputField: React.FC<InputFieldProps> = ({ label, name, value, onChange, type = 'text' }) => (
    <div className={type === 'textarea' ? 'col-span-1 md:col-span-2' : ''}>
        <label htmlFor={name} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{label}</label>
        {type === 'textarea' ? (
            <textarea
                id={name}
                name={name}
                value={value as string}
                onChange={onChange}
                rows={3}
                className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-indigo-500"
            />
        ) : (
            <input
                id={name}
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-indigo-500"
            />
        )}
    </div>
);


export default ControlPanel;