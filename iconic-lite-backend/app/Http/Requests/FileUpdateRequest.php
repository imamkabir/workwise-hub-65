<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class FileUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('file'));
    }

    public function rules(): array
    {
        return [
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:50',
            'category' => 'nullable|string|max:100',
            'credit_cost' => 'sometimes|required|integer|min:1|max:1000',
            'visibility' => 'sometimes|required|in:public,private',
        ];
    }
}