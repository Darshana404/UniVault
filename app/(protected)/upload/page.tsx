import { UploadForm } from "@/components/documents/UploadForm";

export default function UploadPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Upload Document</h1>
        <p className="text-slate-400 text-sm mt-1">
          Share academic PDFs with your university peers. All uploads are
          automatically validated before becoming available.
        </p>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <UploadForm />
      </div>
    </div>
  );
}
