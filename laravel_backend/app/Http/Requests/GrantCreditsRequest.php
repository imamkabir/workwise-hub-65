<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class GrantCreditsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('credits.grant');
    }

    public function rules(): array
    {
        return [
            'user_id' => 'required|exists:users,id',
            'amount' => 'required|integer|min:1|max:1000',
            'reason' => 'required|string|max:255',
        ];
    }

    public function messages(): array
    {
        return [
            'user_id.required' => 'User is required',
            'user_id.exists' => 'Selected user does not exist',
            'amount.required' => 'Amount is required',
            'amount.integer' => 'Amount must be a number',
            'amount.min' => 'Amount must be at least 1',
            'amount.max' => 'Amount cannot exceed 1000',
            'reason.required' => 'Reason is required',
            'reason.max' => 'Reason cannot exceed 255 characters',
        ];
    }
}