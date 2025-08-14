import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FileText, Video, Music, File, Download, Clock, Eye, CreditCard, Calendar, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FileDetailsModalProps {
  file: any;
  isOpen: boolean;
  onClose: () => void;
  userCredits: number;
  onCreditUpdate: (newCredits: number) => void;
  onDownload: (file: any) => void;
}

// Mock related files
const mockRelatedFiles = [
  {
    id: 101,
    title: "Mathematics Past Paper 2022",
    type: "PDF",
    credits: 3,
    downloads: 189
  },
  {
    id: 102,
    title: "Advanced Calculus Guide",
    type: "Document",
    credits: 4,
    downloads: 156
  },
  {
    id: 103,
    title: "Math Video Solutions",
    type: "Video",
    credits: 5,
    downloads: 234
  }
];

export const FileDetailsModal = ({ 
  file, 
  isOpen, 
  onClose, 
  userCredits, 
  onCreditUpdate, 
  onDownload 
}: FileDetailsModalProps) => {
  const { toast } = useToast();

  const getFileIcon = (type: string) => {
    switch (type) {
      case "PDF":
      case "Document":
        return <FileText className="w-12 h-12 text-red-500" />;
      case "Video":
        return <Video className="w-12 h-12 text-blue-500" />;
      case "Audio":
        return <Music className="w-12 h-12 text-green-500" />;
      default:
        return <File className="w-12 h-12 text-gray-500" />;
    }
  };

  const renderFilePreview = () => {
    switch (file.type) {
      case "PDF":
        return (
          <div className="bg-muted/50 rounded-lg p-8 text-center min-h-[300px] flex flex-col items-center justify-center">
            <FileText className="w-16 h-16 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">PDF Preview</h3>
            <p className="text-muted-foreground">
              PDF viewer would be embedded here showing the first few pages
            </p>
            <div className="mt-4 p-4 bg-background/50 rounded border-2 border-dashed border-muted">
              <p className="text-sm">Sample PDF content preview...</p>
            </div>
          </div>
        );
      case "Video":
        return (
          <div className="bg-muted/50 rounded-lg p-8 text-center min-h-[300px] flex flex-col items-center justify-center">
            <Video className="w-16 h-16 text-blue-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Video Preview</h3>
            <div className="w-full max-w-md aspect-video bg-background/50 rounded border-2 border-dashed border-muted flex items-center justify-center">
              <p className="text-sm text-muted-foreground">Video player would be here</p>
            </div>
          </div>
        );
      case "Audio":
        return (
          <div className="bg-muted/50 rounded-lg p-8 text-center min-h-[300px] flex flex-col items-center justify-center">
            <Music className="w-16 h-16 text-green-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Audio Preview</h3>
            <div className="w-full max-w-md bg-background/50 rounded-lg border-2 border-dashed border-muted p-4">
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
                <div className="flex-1 h-2 bg-muted rounded-full">
                  <div className="w-1/3 h-full bg-primary rounded-full"></div>
                </div>
                <span className="text-xs text-muted-foreground">1:23 / 4:56</span>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="bg-muted/50 rounded-lg p-8 text-center min-h-[300px] flex flex-col items-center justify-center">
            <File className="w-16 h-16 text-gray-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Document Preview</h3>
            <p className="text-muted-foreground">Document preview would be shown here</p>
          </div>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {getFileIcon(file.type)}
              <div>
                <DialogTitle className="text-xl">{file.title}</DialogTitle>
                <DialogDescription className="mt-1">{file.description}</DialogDescription>
              </div>
            </div>
            <div className="flex items-center gap-2 text-yellow-500">
              <CreditCard className="w-5 h-5" />
              <span className="font-semibold text-lg">{file.credits} Credits</span>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* File Metadata */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="glass">
              <CardContent className="p-4 text-center">
                <Calendar className="w-5 h-5 mx-auto mb-2 text-blue-500" />
                <p className="text-sm text-muted-foreground">Upload Date</p>
                <p className="font-semibold">{file.uploadDate}</p>
              </CardContent>
            </Card>
            <Card className="glass">
              <CardContent className="p-4 text-center">
                <Users className="w-5 h-5 mx-auto mb-2 text-green-500" />
                <p className="text-sm text-muted-foreground">Downloads</p>
                <p className="font-semibold">{file.downloads}</p>
              </CardContent>
            </Card>
            <Card className="glass">
              <CardContent className="p-4 text-center">
                <File className="w-5 h-5 mx-auto mb-2 text-purple-500" />
                <p className="text-sm text-muted-foreground">File Size</p>
                <p className="font-semibold">{file.size}</p>
              </CardContent>
            </Card>
            <Card className="glass">
              <CardContent className="p-4 text-center">
                <Badge variant="outline" className="w-full justify-center">
                  {file.type}
                </Badge>
              </CardContent>
            </Card>
          </div>

          {/* Tags */}
          <div>
            <h3 className="font-semibold mb-3">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {file.tags.map((tag: string) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* File Preview */}
          <div>
            <h3 className="font-semibold mb-3">Preview</h3>
            {renderFilePreview()}
          </div>

          {/* Download Section */}
          <Card className="glass">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">Download this file</h3>
                  <p className="text-muted-foreground">
                    Download requires {file.credits} credits. You have {userCredits} credits.
                  </p>
                </div>
                <Button 
                  onClick={() => onDownload(file)}
                  disabled={userCredits < file.credits}
                  className="gradient-primary glow"
                  size="lg"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Download ({file.credits} credits)
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Related Files */}
          <div>
            <h3 className="font-semibold mb-4">Related Files</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {mockRelatedFiles.map((relatedFile) => (
                <Card key={relatedFile.id} className="glass hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      {getFileIcon(relatedFile.type)}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{relatedFile.title}</h4>
                        <p className="text-sm text-muted-foreground">{relatedFile.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-yellow-500">
                        <CreditCard className="w-4 h-4" />
                        <span className="text-sm font-semibold">{relatedFile.credits}</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Users className="w-4 h-4" />
                        <span className="text-sm">{relatedFile.downloads}</span>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full mt-3 glass" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};