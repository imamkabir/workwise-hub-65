<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class FileUploadRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('upload-files');
    }

    public function rules(): array
    {
        $allowedTypes = config('app.allowed_file_types', 'pdf,docx,doc,mp3,mp4,avi,mov,png,jpg,jpeg,gif');
        $maxSize = config('app.max_file_size', 104857600); // 100MB

        return [
            'file' => [
                'required',
                'file',
                'max:' . ($maxSize / 1024), // Convert to KB
                'mimes:' . $allowedTypes,
            ],
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:50',
            'category' => 'nullable|string|max:100',
            'credit_cost' => 'nullable|integer|min:1|max:1000',
            'visibility' => 'nullable|in:public,private',
        ];
    }

    public function messages(): array
    {
        return [
            'file.required' => 'Please select a file to upload',
            'file.max' => 'File size cannot exceed ' . (config('app.max_file_size', 104857600) / 1048576) . 'MB',
            'file.mimes' => 'File type not allowed',
            'title.required' => 'File title is required',
            'title.max' => 'Title cannot exceed 255 characters',
            'description.max' => 'Description cannot exceed 1000 characters',
            'tags.array' => 'Tags must be an array',
            'tags.*.string' => 'Each tag must be a string',
            'tags.*.max' => 'Each tag cannot exceed 50 characters',
            'credit_cost.integer' => 'Credit cost must be a number',
            'credit_cost.min' => 'Credit cost must be at least 1',
            'credit_cost.max' => 'Credit cost cannot exceed 1000',
            'visibility.in' => 'Visibility must be either public or private',
        ];
    }
}