<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class RemitaService
{
    private string $merchantId;
    private string $serviceTypeId;
    private string $apiKey;
    private string $baseUrl;
    private string $gatewayUrl;

    public function __construct()
    {
        $this->merchantId = config('services.remita.merchant_id');
        $this->serviceTypeId = config('services.remita.service_type_id');
        $this->apiKey = config('services.remita.api_key');
        $this->baseUrl = config('services.remita.base_url');
        $this->gatewayUrl = config('services.remita.gateway_url');
    }

    public function initiatePayment(array $data): array
    {
        try {
            $payload = [
                'serviceTypeId' => $this->serviceTypeId,
                'amount' => $data['amount'],
                'orderId' => $data['orderId'],
                'payerName' => $data['payerName'],
                'payerEmail' => $data['payerEmail'],
                'payerPhone' => $data['payerPhone'] ?? '',
                'description' => $data['description'],
            ];

            // Generate hash
            $hash = hash('sha512', 
                $this->merchantId . 
                $this->serviceTypeId . 
                $payload['orderId'] . 
                $payload['amount'] . 
                $this->apiKey
            );

            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
                'Authorization' => 'remitaConsumerKey=' . $this->merchantId . ',remitaConsumerToken=' . $hash,
            ])->post($this->baseUrl . '/echannelsvc/merchant/api/paymentinit', $payload);

            if ($response->successful()) {
                $responseData = $response->json();
                
                if ($responseData['status'] === '021') { // Success status
                    return [
                        'success' => true,
                        'rrr' => $responseData['RRR'],
                        'payment_url' => $this->gatewayUrl . '/' . $this->merchantId . '/' . $responseData['RRR'] . '/' . hash('sha512', $responseData['RRR'] . $this->apiKey . $this->merchantId),
                        'message' => 'Payment initiated successfully',
                    ];
                } else {
                    return [
                        'success' => false,
                        'message' => $responseData['statusMessage'] ?? 'Payment initiation failed',
                    ];
                }
            } else {
                return [
                    'success' => false,
                    'message' => 'Failed to connect to Remita service',
                ];
            }
        } catch (\Exception $e) {
            Log::error('Remita payment initiation failed', [
                'error' => $e->getMessage(),
                'data' => $data,
            ]);

            return [
                'success' => false,
                'message' => 'Payment service temporarily unavailable',
            ];
        }
    }

    public function verifyPayment(string $rrr): array
    {
        try {
            $hash = hash('sha512', $rrr . $this->apiKey . $this->merchantId);

            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
                'Authorization' => 'remitaConsumerKey=' . $this->merchantId . ',remitaConsumerToken=' . $hash,
            ])->get($this->baseUrl . '/echannelsvc/' . $this->merchantId . '/' . $rrr . '/' . $hash . '/status.reg');

            if ($response->successful()) {
                $responseData = $response->json();
                
                return [
                    'success' => true,
                    'status' => $responseData['status'],
                    'message' => $responseData['message'] ?? '',
                    'amount' => $responseData['amount'] ?? 0,
                ];
            } else {
                return [
                    'success' => false,
                    'message' => 'Failed to verify payment',
                ];
            }
        } catch (\Exception $e) {
            Log::error('Remita payment verification failed', [
                'error' => $e->getMessage(),
                'rrr' => $rrr,
            ]);

            return [
                'success' => false,
                'message' => 'Payment verification service temporarily unavailable',
            ];
        }
    }
}