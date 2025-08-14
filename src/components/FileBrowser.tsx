import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileDetailsModal } from "./FileDetailsModal";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FileText, Video, Music, File, Search, Filter, Download, Eye, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock data
const mockFiles = [
  {
    id: 1,
    title: "Mathematics Past Paper 2023",
    description: "Complete mathematics examination paper with solutions and detailed explanations",
    type: "PDF",
    tags: ["mathematics", "2023", "exam", "solutions"],
    uploadDate: "2024-01-15",
    downloads: 245,
    size: "2.5 MB",
    credits: 3,
    previewUrl: "/preview/math-2023.pdf"
  },
  {
    id: 2,
    title: "Physics Video Lecture - Quantum Mechanics",
    description: "Comprehensive introduction to quantum mechanics with practical examples",
    type: "Video",
    tags: ["physics", "quantum", "lecture", "mechanics"],
    uploadDate: "2024-01-10",
    downloads: 89,
    size: "156 MB",
    credits: 5,
    previewUrl: "/preview/physics-quantum.mp4"
  },
  {
    id: 3,
    title: "Chemistry Audio Notes",
    description: "Detailed audio explanations of organic chemistry concepts",
    type: "Audio",
    tags: ["chemistry", "organic", "notes", "audio"],
    uploadDate: "2024-01-08",
    downloads: 67,
    size: "45 MB",
    credits: 2,
    previewUrl: "/preview/chemistry-organic.mp3"
  },
  {
    id: 4,
    title: "Biology Study Guide 2024",
    description: "Comprehensive biology study material covering all major topics",
    type: "Document",
    tags: ["biology", "study", "guide", "2024"],
    uploadDate: "2024-01-05",
    downloads: 134,
    size: "1.8 MB",
    credits: 4,
    previewUrl: "/preview/biology-guide.doc"
  },
  {
    id: 5,
    title: "English Literature Analysis",
    description: "In-depth analysis of classic English literature works",
    type: "PDF",
    tags: ["english", "literature", "analysis", "classic"],
    uploadDate: "2024-01-12",
    downloads: 78,
    size: "3.2 MB",
    credits: 3,
    previewUrl: "/preview/english-lit.pdf"
  },
  {
    id: 6,
    title: "Programming Tutorial Series",
    description: "Complete video series covering modern programming concepts",
    type: "Video",
    tags: ["programming", "tutorial", "coding", "software"],
    uploadDate: "2024-01-18",
    downloads: 156,
    size: "234 MB",
    credits: 6,
    previewUrl: "/preview/programming-tutorial.mp4"
  }
];

interface FileBrowserProps {
  userCredits: number;
  onCreditUpdate: (newCredits: number) => void;
}

export const FileBrowser = ({ userCredits, onCreditUpdate }: FileBrowserProps) => {
  const [files] = useState(mockFiles);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [showFileDetails, setShowFileDetails] = useState(false);
  const { toast } = useToast();

  const getFileIcon = (type: string) => {
    switch (type) {
      case "PDF":
      case "Document":
        return <FileText className="w-8 h-8 text-red-500" />;
      case "Video":
        return <Video className="w-8 h-8 text-blue-500" />;
      case "Audio":
        return <Music className="w-8 h-8 text-green-500" />;
      default:
        return <File className="w-8 h-8 text-gray-500" />;
    }
  };

  const handleDownload = (file: any) => {
    if (userCredits < file.credits) {
      toast({
        title: "Insufficient Credits",
        description: `You need ${file.credits} credits to download this file. You have ${userCredits} credits.`,
        variant: "destructive",
      });
      return;
    }

    // Simulate download
    const newCredits = userCredits - file.credits;
    onCreditUpdate(newCredits);
    
    toast({
      title: "✅ Download Started!",
      description: `${file.title} is downloading. ${file.credits} credits deducted.`,
    });

    // Simulate file download
    const link = document.createElement('a');
    link.href = file.previewUrl;
    link.download = file.title;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredAndSortedFiles = files
    .filter(file => {
      const matchesSearch = file.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           file.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           file.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesType = filterType === "all" || file.type.toLowerCase() === filterType.toLowerCase();
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
        case "oldest":
          return new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime();
        case "popular":
          return b.downloads - a.downloads;
        case "credits":
          return a.credits - b.credits;
        default:
          return 0;
      }
    });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
            Browse Files
          </h1>
          <p className="text-muted-foreground mt-2">
            Discover and download past questions and study materials
          </p>
        </div>
        <Card className="glass p-4">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-yellow-500" />
            <span className="font-semibold">{userCredits} Credits</span>
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="glass">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search files, descriptions, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 glass"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="glass">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="document">Document</SelectItem>
                <SelectItem value="audio">Audio</SelectItem>
                <SelectItem value="video">Video</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="glass">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="credits">Credits (Low to High)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Files Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAndSortedFiles.map((file) => (
          <Card key={file.id} className="glass hover:shadow-lg transition-all duration-300 hover:scale-105">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {getFileIcon(file.type)}
                  <Badge variant="outline">{file.type}</Badge>
                </div>
                <div className="flex items-center gap-1 text-yellow-500">
                  <CreditCard className="w-4 h-4" />
                  <span className="font-semibold">{file.credits}</span>
                </div>
              </div>
              <CardTitle className="text-lg leading-tight">{file.title}</CardTitle>
              <CardDescription className="line-clamp-2">
                {file.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {file.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {file.tags.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{file.tags.length - 3}
                    </Badge>
                  )}
                </div>

                {/* Stats */}
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{file.downloads} downloads</span>
                  <span>{file.size}</span>
                  <span>{file.uploadDate}</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-1 glass"
                    onClick={() => {
                      setSelectedFile(file);
                      setShowFileDetails(true);
                    }}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                  <Button 
                    onClick={() => handleDownload(file)}
                    disabled={userCredits < file.credits}
                    className="flex-1 gradient-primary glow"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAndSortedFiles.length === 0 && (
        <Card className="glass">
          <CardContent className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No files found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search terms or filters
            </p>
          </CardContent>
        </Card>
      )}

      {/* File Details Modal */}
      {selectedFile && (
        <FileDetailsModal
          file={selectedFile}
          isOpen={showFileDetails}
          onClose={() => {
            setShowFileDetails(false);
            setSelectedFile(null);
          }}
          userCredits={userCredits}
          onCreditUpdate={onCreditUpdate}
          onDownload={handleDownload}
        />
      )}
    </div>
  );
};