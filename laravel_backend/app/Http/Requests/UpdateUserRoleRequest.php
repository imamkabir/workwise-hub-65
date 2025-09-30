<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserRoleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('admin.create');
    }

    public function rules(): array
    {
        return [
            'role' => [
                'required',
                'string',
                Rule::in(['user', 'admin']), // super_admin not allowed via API
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'role.required' => 'Role is required',
            'role.in' => 'Invalid role selected',
        ];
    }
}