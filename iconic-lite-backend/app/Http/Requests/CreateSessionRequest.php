<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateSessionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasRole('student');
    }

    public function rules(): array
    {
        return [
            'lecturer_id' => 'required|exists:users,id',
            'topic' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'scheduled_at' => 'required|date|after:now',
            'price_credits' => 'required|integer|min:100|max:10000',
        ];
    }

    public function messages(): array
    {
        return [
            'lecturer_id.required' => 'Lecturer is required',
            'lecturer_id.exists' => 'Selected lecturer does not exist',
            'topic.required' => 'Session topic is required',
            'scheduled_at.required' => 'Schedule time is required',
            'scheduled_at.after' => 'Schedule time must be in the future',
            'price_credits.required' => 'Price in credits is required',
            'price_credits.min' => 'Minimum price is 100 credits',
            'price_credits.max' => 'Maximum price is 10000 credits',
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            // Verify lecturer role
            $lecturer = \App\Models\User::find($this->lecturer_id);
            if ($lecturer && !$lecturer->hasRole('lecturer')) {
                $validator->errors()->add('lecturer_id', 'Selected user is not a lecturer');
            }
        });
    }
}