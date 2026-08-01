import React, { useState } from 'react';
import { X, Server, ExternalLink, Copy, Check, Terminal, Globe, Cloud, Code, ShieldCheck, Download } from 'lucide-react';

interface DeploymentGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeploymentGuideModal: React.FC<DeploymentGuideModalProps> = ({
  isOpen,
  onClose
}) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-950 rounded-lg border border-indigo-800 text-indigo-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">دليل استضافة ونشر المنصة مجاناً (Free Hosting & Deployment Guide)</h2>
              <p className="text-xs text-slate-400">خطوات خطوة بخطوة لرفع الموقع على منصات استضافة مجانية 100%</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-200 text-xs custom-scrollbar">
          {/* Step 0: Export from AI Studio */}
          <div className="p-4 bg-gradient-to-r from-blue-950/60 to-slate-900 border border-blue-800/80 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-blue-300 font-bold text-sm">
              <Download className="w-4 h-4 text-blue-400" />
              <span>الخطوة 1: استخراج الأكواد من AI Studio إلى حسابك في GitHub</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              من القائمة العلويّة في AI Studio (زر الإعدادات ⚙️ أو التصدير Export):
            </p>
            <ol className="list-decimal list-inside space-y-1 text-slate-300 font-medium pr-2">
              <li>اختر <strong>Export to GitHub</strong> لتصدير المشروع مباشرة إلى المستودع الخاص بك على GitHub.</li>
              <li>أو اضغط <strong>Download ZIP</strong> لتحميل الأكواد بالكامل إلى جهازك الكومبيوتر.</li>
            </ol>
          </div>

          {/* Platform Option 1: Vercel */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-900 pb-2">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-sm">الخيار الأول (الموصى به): منصة Vercel (مجانية 100%)</h3>
              </div>
              <a
                href="https://vercel.com"
                target="_blank"
                rel="noreferrer"
                className="text-blue-400 hover:underline text-[11px] flex items-center gap-1 font-semibold"
              >
                <span>Vercel.com</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="space-y-2 text-slate-300">
              <p><strong>لماذا Vercel؟</strong> تقدم استضافة مجانية غير محدودة بسرعة فائقة ودعم لـ React + Vite + Node.js API Routes.</p>
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-1 font-mono text-[11px]">
                <div className="text-emerald-400 font-bold">خطوات النشر على Vercel:</div>
                <p>1. سجل دخولك مجاناً في موقع <strong>Vercel.com</strong> بواسطة حساب GitHub.</p>
                <p>2. اضغط على <strong>"Add New Project"</strong> واختر مستودع هذا المشروع من GitHub.</p>
                <p>3. في إعدادات البيئة (Environment Variables)، أضف المتغير التالي:</p>
                <div className="bg-slate-950 p-2 rounded border border-slate-800 flex items-center justify-between text-yellow-300 font-bold">
                  <span>GEMINI_API_KEY = مفتاح_الذكاء_الاصطناعي_الخاص_بك</span>
                  <button
                    onClick={() => handleCopy('GEMINI_API_KEY', 'vercel-env')}
                    className="text-slate-400 hover:text-white text-[10px] flex items-center gap-1 cursor-pointer"
                  >
                    {copiedSection === 'vercel-env' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>نسخ</span>
                  </button>
                </div>
                <p>4. اضغط <strong>Deploy</strong>، وسيكون موقع التداول الخاص بك جاهزاً ويعمل خلال أقل من دقيقة!</p>
              </div>
            </div>
          </div>

          {/* Platform Option 2: Render.com */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-900 pb-2">
              <div className="flex items-center gap-2">
                <Cloud className="w-5 h-5 text-purple-400" />
                <h3 className="font-bold text-white text-sm">الخيار الثاني: منصة Render.com (خادم Node.js مجاني)</h3>
              </div>
              <a
                href="https://render.com"
                target="_blank"
                rel="noreferrer"
                className="text-purple-400 hover:underline text-[11px] flex items-center gap-1 font-semibold"
              >
                <span>Render.com</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="space-y-2 text-slate-300">
              <p><strong>ممتازة للنشر الكامل للسيرفر مع Express:</strong></p>
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-1.5 font-mono text-[11px]">
                <p>1. أنشئ حساباً مجانياً على Render.com ثم اضغط <strong>New + Web Service</strong>.</p>
                <p>2. اربط حساب GitHub واختر هذا المشروع.</p>
                <p>3. اضبط الأوامر التالية بالضبط:</p>
                <div className="space-y-1 bg-slate-950 p-2 rounded border border-slate-800">
                  <div>Build Command: <strong className="text-emerald-400">npm run build</strong></div>
                  <div>Start Command: <strong className="text-emerald-400">npm start</strong></div>
                </div>
                <p>4. أضف متغير البيئة <code className="text-yellow-300 font-bold">GEMINI_API_KEY</code> ثم اضغط Deploy.</p>
              </div>
            </div>
          </div>

          {/* Platform Option 3: Netlify / Railway */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Code className="w-4 h-4 text-blue-400" />
              خيارات مجانية إضافية الممتازة:
            </h3>
            <ul className="list-disc list-inside space-y-1 text-slate-300">
              <li><strong>Netlify.com:</strong> استضافة مجانية سريعة تدعم تطبيقات React المتقدمة مع الربط التلقائي بـ GitHub.</li>
              <li><strong>Railway.app:</strong> تمنحك $5 رصيد مجاني شهرية لنشر تطبيقات Node.js وExpress بضغطة زر.</li>
            </ul>
          </div>

          {/* Security & API Key Notice */}
          <div className="p-3 bg-amber-950/40 border border-amber-800/80 rounded-xl flex items-start gap-2.5 text-amber-200">
            <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-amber-300">ملاحظة أمان هامة جدًا بالنسبة لـ GEMINI_API_KEY:</span>
              <p className="text-[11px] leading-relaxed">
                مفتاح الذكاء الاصطناعي (API Key) محمياً بالكامل ومخفي على السيرفر في هذا المشروع. عند الاستضافة على أي منصة (Vercel أو Render)، لا تضع المفتاح داخل الكود مباشرة بل أضفه في قسم <strong>Environment Variables</strong> لتبقى أكوادك آمنة 100%.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">تم التجهيز بواسطة منصة الذكاء الاصطناعي لتداول الأسواق</span>
          <button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-lg text-xs cursor-pointer transition-colors"
          >
            فهمت، إغلاق الشاشة
          </button>
        </div>
      </div>
    </div>
  );
};
