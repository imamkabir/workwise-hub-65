<?php

namespace App\Http\Requests;

use App\Models\File;
use Illuminate\Foundation\Http\FormRequest;

class RedeemCreditsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'file_id' => 'required|exists:files,id',
        ];
    }

    public function messages(): array
    {
        return [
            'file_id.required' => 'File is required',
            'file_id.exists' => 'Selected file does not exist',
        ];
    }

    protected function passedValidation(): void
    {
        $this->merge([
            'file' => File::findOrFail($this->file_id),
        ]);
    }
}