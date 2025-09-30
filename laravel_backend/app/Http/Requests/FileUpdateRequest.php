<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class FileUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('files.manage');
    }

    public function rules(): array
    {
        return [
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:50',
            'credits_required' => 'sometimes|required|integer|min:1|max:100',
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => 'File title is required',
            'title.max' => 'Title cannot exceed 255 characters',
            'description.max' => 'Description cannot exceed 1000 characters',
            'tags.array' => 'Tags must be an array',
            'tags.*.string' => 'Each tag must be a string',
            'tags.*.max' => 'Each tag cannot exceed 50 characters',
            'credits_required.required' => 'Credits required is required',
            'credits_required.integer' => 'Credits required must be a number',
            'credits_required.min' => 'Credits required must be at least 1',
            'credits_required.max' => 'Credits required cannot exceed 100',
        ];
    }
}