<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RedeemReferralRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'referred_user_id' => 'required|exists:users,id',
        ];
    }

    public function messages(): array
    {
        return [
            'referred_user_id.required' => 'Referred user is required',
            'referred_user_id.exists' => 'Selected user does not exist',
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            // Prevent self-referral
            if ($this->referred_user_id == $this->user()->id) {
                $validator->errors()->add('referred_user_id', 'You cannot refer yourself');
            }
        });
    }
}