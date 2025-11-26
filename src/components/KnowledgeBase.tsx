import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Badge } from "./ui/badge";
import {
  Upload,
  FileText,
  Trash2,
  Download,
  Eye,
  File,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

interface KnowledgeBaseProps {
  agentId?: string;
  agentName?: string;
}

export function KnowledgeBase({ agentId, agentName }: KnowledgeBaseProps) {
  const [files, setFiles] = useState([
    {
      id: 1,
      name: "Product_Catalog_2025.pdf",
      size: "2.4 MB",
      type: "application/pdf",
      uploadedAt: "2 days ago",
      status: "processed",
      chunks: 145,
    },
    {
      id: 2,
      name: "FAQ_Document.docx",
      size: "856 KB",
      type: "application/docx",
      uploadedAt: "1 week ago",
      status: "processed",
      chunks: 89,
    },
    {
      id: 3,
      name: "Company_Policies.txt",
      size: "124 KB",
      type: "text/plain",
      uploadedAt: "3 hours ago",
      status: "processing",
      chunks: 0,
    },
  ]);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = event.target.files;
    if (uploadedFiles && uploadedFiles.length > 0) {
      Array.from(uploadedFiles).forEach((file) => {
        const newFile = {
          id: files.length + 1,
          name: file.name,
          size: formatFileSize(file.size),
          type: file.type,
          uploadedAt: "Just now",
          status: "processing" as const,
          chunks: 0,
        };
        setFiles([...files, newFile]);
        toast.success(`Uploading ${file.name}...`);
        
        // Simulate processing
        setTimeout(() => {
          setFiles((prev) =>
            prev.map((f) =>
              f.id === newFile.id
                ? { ...f, status: "processed" as const, chunks: Math.floor(Math.random() * 200) + 50 }
                : f
            )
          );
          toast.success(`${file.name} processed successfully!`);
        }, 2000);
      });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      Array.from(droppedFiles).forEach((file) => {
        const newFile = {
          id: files.length + 1,
          name: file.name,
          size: formatFileSize(file.size),
          type: file.type,
          uploadedAt: "Just now",
          status: "processing" as const,
          chunks: 0,
        };
        setFiles([...files, newFile]);
        toast.success(`Uploading ${file.name}...`);
      });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDelete = (id: number) => {
    const file = files.find((f) => f.id === id);
    if (confirm(`Delete ${file?.name}?`)) {
      setFiles(files.filter((f) => f.id !== id));
      toast.success("File deleted");
    }
  };

  const handleDownload = (file: any) => {
    toast.success(`Downloading ${file.name}...`);
  };

  const handleView = (file: any) => {
    toast.success(`Opening ${file.name}...`);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const getFileIcon = (type: string) => {
    if (type.includes("pdf")) return "📄";
    if (type.includes("doc")) return "📝";
    if (type.includes("text")) return "📃";
    if (type.includes("image")) return "🖼️";
    return "📁";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-slate-900 mb-2">
          Knowledge Base {agentName && `- ${agentName}`}
        </h1>
        <p className="text-slate-600">
          Upload documents to train your agent with custom knowledge
        </p>
      </div>

      {/* Upload Area */}
      <Card
        className={`bg-white border-2 border-dashed transition-all ${
          isDragging
            ? "border-blue-500 bg-blue-50"
            : "border-slate-300 hover:border-blue-400"
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <CardContent className="p-12 text-center">
          <div className="size-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
            <Upload className="size-8 text-blue-600" />
          </div>
          <h3 className="text-slate-900 mb-2">
            {isDragging ? "Drop files here" : "Upload Knowledge Files"}
          </h3>
          <p className="text-slate-600 mb-6">
            Drag and drop files or click to browse
          </p>
          <input
            type="file"
            id="file-upload"
            className="hidden"
            onChange={handleFileUpload}
            multiple
            accept=".pdf,.doc,.docx,.txt,.csv,.json"
          />
          <label htmlFor="file-upload">
            <Button asChild className="bg-blue-600 hover:bg-blue-700">
              <span>
                <Upload className="size-4 mr-2" />
                Choose Files
              </span>
            </Button>
          </label>
          <p className="text-slate-500 text-sm mt-4">
            Supported: PDF, DOC, DOCX, TXT, CSV, JSON (Max 10MB per file)
          </p>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="bg-white border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <FileText className="size-6 text-blue-600" />
              </div>
              <div>
                <p className="text-slate-600 text-sm">Total Files</p>
                <p className="text-slate-900 text-2xl">{files.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="size-6 text-green-600" />
              </div>
              <div>
                <p className="text-slate-600 text-sm">Processed</p>
                <p className="text-slate-900 text-2xl">
                  {files.filter((f) => f.status === "processed").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-lg bg-purple-100 flex items-center justify-center">
                <Clock className="size-6 text-purple-600" />
              </div>
              <div>
                <p className="text-slate-600 text-sm">Processing</p>
                <p className="text-slate-900 text-2xl">
                  {files.filter((f) => f.status === "processing").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-lg bg-orange-100 flex items-center justify-center">
                <File className="size-6 text-orange-600" />
              </div>
              <div>
                <p className="text-slate-600 text-sm">Total Chunks</p>
                <p className="text-slate-900 text-2xl">
                  {files.reduce((sum, f) => sum + f.chunks, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Files List */}
      <Card className="bg-white border-slate-200">
        <CardHeader>
          <CardTitle>Uploaded Files</CardTitle>
          <CardDescription>
            Manage your knowledge base documents
          </CardDescription>
        </CardHeader>
        <CardContent>
          {files.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="size-16 mx-auto mb-4 text-slate-300" />
              <h3 className="text-slate-900 mb-2">No files uploaded</h3>
              <p className="text-slate-600">
                Upload documents to train your agent
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="text-4xl">{getFileIcon(file.type)}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-slate-900">{file.name}</p>
                        <Badge
                          variant={
                            file.status === "processed" ? "default" : "secondary"
                          }
                          className={
                            file.status === "processed"
                              ? "bg-green-500"
                              : "bg-yellow-500"
                          }
                        >
                          {file.status === "processed" ? (
                            <>
                              <CheckCircle2 className="size-3 mr-1" />
                              Processed
                            </>
                          ) : (
                            <>
                              <Clock className="size-3 mr-1" />
                              Processing...
                            </>
                          )}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-600">
                        <span>{file.size}</span>
                        <span>•</span>
                        <span>{file.uploadedAt}</span>
                        {file.chunks > 0 && (
                          <>
                            <span>•</span>
                            <span>{file.chunks} chunks</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleView(file)}
                    >
                      <Eye className="size-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(file)}
                    >
                      <Download className="size-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(file.id)}
                    >
                      <Trash2 className="size-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tips */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-6">
          <h4 className="text-blue-900 mb-3">💡 Knowledge Base Tips</h4>
          <ul className="space-y-2 text-blue-700 text-sm">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="size-4 mt-0.5 shrink-0" />
              <span>
                Upload product catalogs, FAQs, and company policies for accurate
                responses
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="size-4 mt-0.5 shrink-0" />
              <span>
                Documents are automatically chunked and vectorized for semantic
                search
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="size-4 mt-0.5 shrink-0" />
              <span>
                Update knowledge files regularly to keep your agent's information
                current
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="size-4 mt-0.5 shrink-0" />
              <span>
                Larger documents may take a few minutes to process and index
              </span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
