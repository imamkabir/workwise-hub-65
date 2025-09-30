<?php

namespace App\Http\Controllers;

use App\Http\Requests\FileUploadRequest;
use App\Http\Requests\FileUpdateRequest;
use App\Models\Download;
use App\Models\File;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class FileController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = File::with('uploader:id,name');

        // Search functionality
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhereJsonContains('tags', $search);
            });
        }

        // Filter by type
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        // Filter by tags
        if ($request->has('tags')) {
            $tags = is_array($request->tags) ? $request->tags : [$request->tags];
            foreach ($tags as $tag) {
                $query->whereJsonContains('tags', $tag);
            }
        }

        $files = $query->orderBy('created_at', 'desc')
                      ->paginate($request->get('per_page', 15));

        return response()->json([
            'files' => $files->items(),
            'pagination' => [
                'current_page' => $files->currentPage(),
                'per_page' => $files->perPage(),
                'total' => $files->total(),
                'last_page' => $files->lastPage(),
            ],
        ]);
    }

    public function store(FileUploadRequest $request): JsonResponse
    {
        $uploadedFile = $request->file('file');
        
        // Generate unique filename
        $filename = Str::uuid() . '.' . $uploadedFile->getClientOriginalExtension();
        $path = $uploadedFile->storeAs('uploads', $filename);

        $file = File::create([
            'title' => $request->title,
            'description' => $request->description,
            'tags' => $request->tags ?? [],
            'type' => $uploadedFile->getMimeType(),
            'path' => $path,
            'size' => $uploadedFile->getSize(),
            'credits_required' => $request->credits_required ?? 1,
            'uploaded_by' => $request->user()->id,
        ]);

        return response()->json([
            'file' => $file->load('uploader:id,name'),
            'message' => 'File uploaded successfully',
        ], 201);
    }

    public function show(File $file): JsonResponse
    {
        return response()->json([
            'file' => $file->load('uploader:id,name'),
        ]);
    }

    public function update(FileUpdateRequest $request, File $file): JsonResponse
    {
        $this->authorize('update', $file);

        $file->update($request->validated());

        return response()->json([
            'file' => $file->load('uploader:id,name'),
            'message' => 'File updated successfully',
        ]);
    }

    public function destroy(File $file): JsonResponse
    {
        $this->authorize('delete', $file);

        $file->delete();

        return response()->json([
            'message' => 'File deleted successfully',
        ]);
    }

    public function download(Request $request, File $file): JsonResponse
    {
        $user = $request->user();

        // Check if user has enough credits
        if (!$user->hasEnoughCredits($file->credits_required)) {
            return response()->json([
                'error' => 'Insufficient credits',
                'required' => $file->credits_required,
                'available' => $user->credits,
            ], 402);
        }

        // Deduct credits
        if (!$user->deductCredits($file->credits_required, "Downloaded: {$file->title}")) {
            return response()->json([
                'error' => 'Failed to deduct credits',
            ], 500);
        }

        // Record download
        Download::create([
            'user_id' => $user->id,
            'file_id' => $file->id,
            'credits_spent' => $file->credits_required,
        ]);

        // Generate signed URL
        $url = $file->generateDownloadUrl();

        return response()->json([
            'download_url' => $url,
            'credits_remaining' => $user->fresh()->credits,
        ]);
    }
}