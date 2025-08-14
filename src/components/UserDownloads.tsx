import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Video, Music, File, Search, Download, Calendar, CreditCard } from "lucide-react";

// Mock data for user downloads
const mockDownloads = [
  {
    id: 1,
    title: "Mathematics Past Paper 2023",
    type: "PDF",
    downloadDate: "2024-01-20",
    credits: 3,
    size: "2.5 MB",
    status: "Completed"
  },
  {
    id: 2,
    title: "Physics Video Lecture",
    type: "Video", 
    downloadDate: "2024-01-18",
    credits: 5,
    size: "156 MB",
    status: "Completed"
  },
  {
    id: 3,
    title: "Chemistry Audio Notes",
    type: "Audio",
    downloadDate: "2024-01-15",
    credits: 2,
    size: "45 MB", 
    status: "Completed"
  },
  {
    id: 4,
    title: "Biology Study Guide",
    type: "Document",
    downloadDate: "2024-01-12",
    credits: 4,
    size: "1.8 MB",
    status: "Completed"
  },
  {
    id: 5,
    title: "English Literature Analysis",
    type: "PDF",
    downloadDate: "2024-01-10",
    credits: 3,
    size: "3.2 MB",
    status: "Completed"
  }
];

export const UserDownloads = () => {
  const [downloads] = useState(mockDownloads);
  const [searchTerm, setSearchTerm] = useState("");

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

  const filteredDownloads = downloads.filter(download =>
    download.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalCreditsSpent = downloads.reduce((sum, download) => sum + download.credits, 0);
  const totalFiles = downloads.length;
  const totalSize = downloads.reduce((sum, download) => {
    const size = parseFloat(download.size);
    return sum + size;
  }, 0);

  const handleRedownload = (download: any) => {
    // Simulate re-download
    const link = document.createElement('a');
    link.href = `/downloads/${download.title.replace(/\s+/g, '-').toLowerCase()}`;
    link.download = download.title;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
          My Downloads
        </h1>
        <p className="text-muted-foreground mt-2">
          View and re-download your purchased content
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Downloads</p>
                <p className="text-2xl font-bold">{totalFiles}</p>
              </div>
              <Download className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Credits Spent</p>
                <p className="text-2xl font-bold">{totalCreditsSpent}</p>
              </div>
              <CreditCard className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Size</p>
                <p className="text-2xl font-bold">{totalSize.toFixed(1)} MB</p>
              </div>
              <File className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="glass">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search your downloads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 glass"
            />
          </div>
        </CardContent>
      </Card>

      {/* Downloads Table */}
      <Card className="glass">
        <CardHeader>
          <CardTitle>Download History ({filteredDownloads.length})</CardTitle>
          <CardDescription>
            Your downloaded files are available for re-download at any time
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredDownloads.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Download Date</TableHead>
                  <TableHead>Credits Used</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDownloads.map((download) => (
                  <TableRow key={download.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {getFileIcon(download.type)}
                        <div>
                          <div className="font-medium">{download.title}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{download.type}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        {download.downloadDate}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <CreditCard className="w-4 h-4 text-yellow-500" />
                        {download.credits}
                      </div>
                    </TableCell>
                    <TableCell>{download.size}</TableCell>
                    <TableCell>
                      <Badge variant="default" className="bg-green-500">
                        {download.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="glass"
                        onClick={() => handleRedownload(download)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Re-download
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <Download className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No downloads found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? "No downloads match your search" : "You haven't downloaded any files yet"}
              </p>
              {!searchTerm && (
                <Button variant="outline" className="glass">
                  Browse Files
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};