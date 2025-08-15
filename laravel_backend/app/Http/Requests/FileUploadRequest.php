<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class FileUploadRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('files.upload');
    }

    public function rules(): array
    {
        $allowedTypes = config('app.allowed_file_types', 'pdf,docx,doc,mp3,mp4,avi,mov,png,jpg,jpeg,gif');
        $maxSize = config('app.max_file_size', 104857600); // 100MB default

        return [
            'file' => [
                'required',
                'file',
                'max:' . ($maxSize / 1024), // Convert to KB for validation
                'mimes:' . $allowedTypes,
            ],
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:50',
            'credits_required' => 'nullable|integer|min:1|max:100',
        ];
    }

    public function messages(): array
    {
        return [
            'file.required' => 'Please select a file to upload',
            'file.max' => 'File size cannot exceed ' . (config('app.max_file_size', 104857600) / 1048576) . 'MB',
            'file.mimes' => 'File type not allowed. Allowed types: ' . config('app.allowed_file_types', 'pdf,docx,doc,mp3,mp4,avi,mov,png,jpg,jpeg,gif'),
            'title.required' => 'File title is required',
            'title.max' => 'Title cannot exceed 255 characters',
            'description.max' => 'Description cannot exceed 1000 characters',
            'tags.array' => 'Tags must be an array',
            'tags.*.string' => 'Each tag must be a string',
            'tags.*.max' => 'Each tag cannot exceed 50 characters',
            'credits_required.integer' => 'Credits required must be a number',
            'credits_required.min' => 'Credits required must be at least 1',
            'credits_required.max' => 'Credits required cannot exceed 100',
        ];
    }
}