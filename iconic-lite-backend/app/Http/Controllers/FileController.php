<?php

namespace App\Http\Controllers;

use App\Http\Requests\FileUploadRequest;
use App\Http\Requests\FileUpdateRequest;
use App\Models\File;
use App\Models\Download;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class FileController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = File::with('uploader:id,name')
            ->active()
            ->approved();

        // Search functionality
        if ($request->has('query')) {
            $query->search($request->query);
        }

        // Filter by type
        if ($request->has('type')) {
            $query->byType($request->type);
        }

        // Filter by category
        if ($request->has('category')) {
            $query->byCategory($request->category);
        }

        // Filter by tags
        if ($request->has('tags')) {
            $tags = is_array($request->tags) ? $request->tags : explode(',', $request->tags);
            foreach ($tags as $tag) {
                $query->whereJsonContains('tags', trim($tag));
            }
        }

        // Sorting
        $sortBy = $request->get('sort', 'created_at');
        $sortOrder = $request->get('order', 'desc');
        
        if (in_array($sortBy, ['created_at', 'download_count', 'credit_cost', 'title'])) {
            $query->orderBy($sortBy, $sortOrder);
        }

        $files = $query->paginate($request->get('per_page', 15));

        return response()->json([
            'data' => $files->items(),
            'meta' => [
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
        $path = $uploadedFile->storeAs('uploads', $filename, 'public');

        $file = File::create([
            'title' => $request->title,
            'description' => $request->description,
            'type' => $uploadedFile->getClientOriginalExtension(),
            'tags' => $request->tags ?? [],
            'category' => $request->category,
            'size_bytes' => $uploadedFile->getSize(),
            'storage_path' => $path,
            'credit_cost' => $request->credit_cost ?? 1,
            'visibility' => $request->visibility ?? 'public',
            'uploader_id' => $request->user()->id,
            'approved_at' => $request->user()->hasRole(['admin', 'super_admin']) ? now() : null,
        ]);

        // Notify admins if approval needed
        if (!$file->isApproved()) {
            Notification::notifyAdmins(
                'file_upload',
                'New File Awaiting Approval',
                "File '{$file->title}' uploaded by {$file->uploader->name} needs approval.",
                ['file_id' => $file->id]
            );
        }

        return response()->json([
            'file' => $file->load('uploader:id,name'),
            'message' => 'File uploaded successfully',
        ], 201);
    }

    public function show(File $file): JsonResponse
    {
        $file->load('uploader:id,name');

        return response()->json([
            'data' => $file,
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

        // Check if file is approved
        if (!$file->isApproved()) {
            return response()->json([
                'error' => [
                    'code' => 'file_not_approved',
                    'message' => 'File is not yet approved for download',
                ],
            ], 403);
        }

        // Check if user has enough credits
        if (!$user->hasEnoughCredits($file->credit_cost)) {
            return response()->json([
                'error' => [
                    'code' => 'insufficient_credits',
                    'message' => 'Insufficient credits',
                    'details' => [
                        'required' => $file->credit_cost,
                        'available' => $user->credits_balance,
                    ],
                ],
            ], 402);
        }

        // Rate limiting for downloads
        $key = 'download.' . $user->id;
        if (RateLimiter::tooManyAttempts($key, 10)) {
            return response()->json([
                'error' => [
                    'code' => 'rate_limit_exceeded',
                    'message' => 'Too many download attempts. Please try again later.',
                ],
            ], 429);
        }

        RateLimiter::hit($key, 3600); // 1 hour window

        // Deduct credits
        $user->deductCredits($file->credit_cost, 'download_cost', $file->id);

        // Record download
        Download::create([
            'user_id' => $user->id,
            'file_id' => $file->id,
            'cost_credits' => $file->credit_cost,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        // Increment download count
        $file->incrementDownloadCount();

        // Generate signed download URL
        $downloadUrl = $file->generateSignedDownloadUrl(60);

        return response()->json([
            'downloadUrl' => $downloadUrl,
            'credits_remaining' => $user->fresh()->credits_balance,
        ]);
    }

    public function approve(File $file): JsonResponse
    {
        $this->authorize('approve', $file);

        $file->approve();

        // Notify uploader
        Notification::createForUser(
            $file->uploader_id,
            'file_approved',
            'File Approved',
            "Your file '{$file->title}' has been approved and is now available for download.",
            ['file_id' => $file->id]
        );

        return response()->json([
            'message' => 'File approved successfully',
        ]);
    }
}