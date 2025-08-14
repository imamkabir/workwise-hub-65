import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Upload, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const FileUpload = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [fileType, setFileType] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Auto-detect file type
      const extension = file.name.split('.').pop()?.toLowerCase();
      if (['pdf'].includes(extension || '')) setFileType('PDF');
      else if (['doc', 'docx'].includes(extension || '')) setFileType('Document');
      else if (['mp4', 'avi', 'mov'].includes(extension || '')) setFileType('Video');
      else if (['mp3', 'wav', 'aac'].includes(extension || '')) setFileType('Audio');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !description || !fileType || !selectedFile) {
      toast({
        title: "Missing Information",
        description: "Please fill all required fields and select a file.",
        variant: "destructive",
      });
      return;
    }

    // Simulate upload
    toast({
      title: "✅ File Uploaded Successfully!",
      description: `${title} has been uploaded and is now available.`,
    });

    // Reset form
    setTitle("");
    setDescription("");
    setFileType("");
    setTags([]);
    setSelectedFile(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
          Upload New File
        </h1>
        <p className="text-muted-foreground mt-2">
          Add content to your platform for users to download
        </p>
      </div>

      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            File Details
          </CardTitle>
          <CardDescription>
            Upload PDF, DOC, MP3, or MP4 files with descriptions and tags
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* File Upload */}
            <div className="space-y-2">
              <Label htmlFor="file">File *</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                <input
                  id="file"
                  type="file"
                  accept=".pdf,.doc,.docx,.mp3,.wav,.aac,.mp4,.avi,.mov"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label htmlFor="file" className="cursor-pointer">
                  <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {selectedFile ? selectedFile.name : "Click to upload or drag and drop"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PDF, DOC, MP3, MP4 (max 100MB)
                  </p>
                </label>
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter file title"
                className="glass"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the content of this file"
                className="glass min-h-[120px]"
              />
            </div>

            {/* File Type */}
            <div className="space-y-2">
              <Label>File Type *</Label>
              <Select value={fileType} onValueChange={setFileType}>
                <SelectTrigger className="glass">
                  <SelectValue placeholder="Select file type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PDF">PDF</SelectItem>
                  <SelectItem value="Document">Document</SelectItem>
                  <SelectItem value="Audio">Audio</SelectItem>
                  <SelectItem value="Video">Video</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag"
                  className="glass"
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                />
                <Button type="button" onClick={handleAddTag} variant="outline" className="glass">
                  Add
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="glass flex items-center gap-1">
                      {tag}
                      <X 
                        className="w-3 h-3 cursor-pointer" 
                        onClick={() => handleRemoveTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <Button type="submit" className="w-full gradient-primary glow font-semibold">
              Upload File
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};