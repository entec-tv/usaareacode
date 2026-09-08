import { useState } from "react";
import { AlertTriangle, CheckCircle2, Loader2, ShieldAlert, X } from "lucide-react";
import { submitScamReport } from "@/lib/collections";
import { trackAnalyticsEvent } from "@/lib/firebase";
import { useI18n } from "@/lib/i18n";
import { getClientGeoInfo } from "@/lib/geo";

interface ScamReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultAreaCode?: string;
}

export function ScamReportModal({
  isOpen,
  onClose,
  defaultAreaCode = "",
}: ScamReportModalProps) {
  const { lang } = useI18n();
  const isAr = lang === "ar";

  const [phoneNumber, setPhoneNumber] = useState("");
  const [areaCode, setAreaCode] = useState(defaultAreaCode);
  const [callerType, setCallerType] = useState("Robocall");
  const [riskLevel, setRiskLevel] = useState<"high" | "medium" | "low">("high");
  const [description, setDescription] = useState("");
  const [reportedName, setReportedName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const geo = await getClientGeoInfo();
      const trimmedName = reportedName.trim();
      const targetAreaCode = (areaCode || phoneNumber.slice(0, 3)).trim();
      await submitScamReport({
        phoneNumber: phoneNumber.trim(),
        areaCode: targetAreaCode,
        callerType,
        description: description.trim(),
        riskLevel,
        ...(trimmedName ? { reportedName: trimmedName } : {}),
        country: geo.country,
        city: geo.city,
      });

      trackAnalyticsEvent("scam_report_submitted", {
        area_code: targetAreaCode,
        caller_type: callerType,
        risk_level: riskLevel,
        country: geo.country,
      });

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);
    } catch (err) {
      setError((err as Error).message || "Failed to submit report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-red-500/30 p-6 sm:p-8 shadow-2xl text-foreground">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          title="Close"
        >
          <X className="size-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="size-11 rounded-2xl bg-red-500/15 border border-red-500/30 grid place-items-center text-red-400 shrink-0">
            <ShieldAlert className="size-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white font-display">
              {isAr ? "الإبلاغ عن رقم احتيالي" : "Report Phone Scam & Robocall"}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {isAr
                ? "ساعد في حماية المشتركين من المكالمات المزعجة وعمليات الاحتيال"
                : "Help protect the NANP registry from predatory fraud and spoofed numbers"}
            </p>
          </div>
        </div>

        {success ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="size-12 text-emerald-400 mx-auto animate-bounce" />
            <h4 className="text-lg font-bold text-white">
              {isAr ? "تم إرسال البلاغ بنجاح" : "Report Submitted Successfully"}
            </h4>
            <p className="text-xs text-slate-300 max-w-xs mx-auto">
              {isAr
                ? "شكراً لمساهمتك. سيقوم فريق التدقيق والامتثال بمراجعة هذا الرقم."
                : "Thank you. Our compliance team will review and verify the reported number."}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  {isAr ? "رقم الهاتف المشبوه *" : "Suspected Phone Number *"}
                </label>
                <input
                  required
                  type="text"
                  placeholder="+1 (876) 555-0199"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder:text-slate-500 text-xs focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  {isAr ? "رمز المنطقة (Area Code)" : "Area Code (NPA)"}
                </label>
                <input
                  type="text"
                  maxLength={3}
                  placeholder="876"
                  value={areaCode}
                  onChange={(e) => setAreaCode(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder:text-slate-500 text-xs focus:outline-none focus:border-red-500 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  {isAr ? "نوع الاحتيال" : "Scam / Caller Type"}
                </label>
                <select
                  value={callerType}
                  onChange={(e) => setCallerType(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-white text-xs focus:outline-none focus:border-red-500"
                >
                  <option value="Robocall">Robocall / Automated Message</option>
                  <option value="Wangiri (One-Ring)">Wangiri (One-Ring Toll Trap)</option>
                  <option value="Impersonation (IRS/Bank)">Impersonation (IRS / Bank / Tech)</option>
                  <option value="Phishing SMS / Smishing">Phishing SMS / Smishing</option>
                  <option value="Telemarketing / Curfew Violation">TCPA Curfew / Harassment</option>
                  <option value="Other">Other Suspicious Activity</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  {isAr ? "مستوى الخطورة المقدر" : "Estimated Risk Level"}
                </label>
                <select
                  value={riskLevel}
                  onChange={(e) => setRiskLevel(e.target.value as any)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-white text-xs focus:outline-none focus:border-red-500"
                >
                  <option value="high">High (Known Financial Threat)</option>
                  <option value="medium">Medium (Unsolicited Pitch)</option>
                  <option value="low">Low (Nuisance Call)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                {isAr ? "اسم المتصل المعروض (Caller ID - اختياري)" : "Caller ID Name / Display (Optional)"}
              </label>
              <input
                type="text"
                placeholder="e.g. Card Services, Border Patrol, etc."
                value={reportedName}
                onChange={(e) => setReportedName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder:text-slate-500 text-xs focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                {isAr ? "تفاصيل ما حدث *" : "Description of Incident *"}
              </label>
              <textarea
                required
                rows={3}
                placeholder={
                  isAr
                    ? "صف محتوى المكالمة أو الرسالة والمطالب المالية..."
                    : "Describe what the caller said, any threats made, or callback requests..."
                }
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder:text-slate-500 text-xs focus:outline-none focus:border-red-500 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition-colors"
              >
                {isAr ? "إلغاء" : "Cancel"}
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs transition-all flex items-center gap-2 shadow-lg shadow-red-600/30 disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <AlertTriangle className="size-4" />
                )}
                <span>{isSubmitting ? "Submitting..." : isAr ? "إرسال البلاغ" : "Submit Report"}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
