import { UploadForm } from "@/components/documents/UploadForm";

export default function UploadPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="page-title">Upload Document</h1>
        <p className="pdf-meta mt-1">
          Share academic PDFs with your university peers. All uploads are
          automatically validated before becoming available.
        </p>
      </div>

      <div className="card">
        <UploadForm />
      </div>
    </div>
  );
}
