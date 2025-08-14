import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Video, Music, File, Edit, Trash2, Search, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock data
const mockFiles = [
  {
    id: 1,
    title: "Mathematics Past Paper 2023",
    description: "Complete mathematics examination paper with solutions",
    type: "PDF",
    tags: ["mathematics", "2023", "exam"],
    uploadDate: "2024-01-15",
    downloads: 245,
    size: "2.5 MB"
  },
  {
    id: 2,
    title: "Physics Video Lecture",
    description: "Quantum mechanics introduction video",
    type: "Video",
    tags: ["physics", "quantum", "lecture"],
    uploadDate: "2024-01-10",
    downloads: 89,
    size: "156 MB"
  },
  {
    id: 3,
    title: "Chemistry Audio Notes",
    description: "Organic chemistry audio explanations",
    type: "Audio",
    tags: ["chemistry", "organic", "notes"],
    uploadDate: "2024-01-08",
    downloads: 67,
    size: "45 MB"
  },
  {
    id: 4,
    title: "Biology Study Guide",
    description: "Comprehensive biology study material",
    type: "Document",
    tags: ["biology", "study", "guide"],
    uploadDate: "2024-01-05",
    downloads: 134,
    size: "1.8 MB"
  }
];

export const FileManagement = () => {
  const [files, setFiles] = useState(mockFiles);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const { toast } = useToast();

  const getFileIcon = (type: string) => {
    switch (type) {
      case "PDF":
      case "Document":
        return <FileText className="w-5 h-5 text-red-500" />;
      case "Video":
        return <Video className="w-5 h-5 text-blue-500" />;
      case "Audio":
        return <Music className="w-5 h-5 text-green-500" />;
      default:
        return <File className="w-5 h-5 text-gray-500" />;
    }
  };

  const handleDelete = (id: number) => {
    setFiles(files.filter(file => file.id !== id));
    toast({
      title: "File Deleted",
      description: "The file has been removed from the platform.",
    });
  };

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === "all" || file.type.toLowerCase() === filterType.toLowerCase();
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
          Manage Files
        </h1>
        <p className="text-muted-foreground mt-2">
          View and manage all uploaded content
        </p>
      </div>

      {/* Search and Filter */}
      <Card className="glass">
        <CardContent className="pt-6">
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 glass"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[200px] glass">
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
          </div>
        </CardContent>
      </Card>

      {/* Files Table */}
      <Card className="glass">
        <CardHeader>
          <CardTitle>Files ({filteredFiles.length})</CardTitle>
          <CardDescription>
            Manage your uploaded content and view download statistics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>File</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Downloads</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Upload Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFiles.map((file) => (
                <TableRow key={file.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {getFileIcon(file.type)}
                      <div>
                        <div className="font-medium">{file.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {file.description.length > 50 
                            ? `${file.description.substring(0, 50)}...` 
                            : file.description}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{file.type}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {file.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {file.tags.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{file.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{file.downloads}</TableCell>
                  <TableCell>{file.size}</TableCell>
                  <TableCell>{file.uploadDate}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="glass">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="glass">
                          <DialogHeader>
                            <DialogTitle>Edit File</DialogTitle>
                            <DialogDescription>
                              Edit file details and metadata
                            </DialogDescription>
                          </DialogHeader>
                          <div className="text-center py-8">
                            <p className="text-muted-foreground">Edit form would go here</p>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="glass text-destructive hover:text-destructive"
                        onClick={() => handleDelete(file.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};