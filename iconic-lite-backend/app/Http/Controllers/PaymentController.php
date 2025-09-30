<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Services\RemitaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Laravel\Cashier\Cashier;
use Stripe\Stripe;
use Stripe\Checkout\Session as StripeSession;

class PaymentController extends Controller
{
    public function __construct(
        private RemitaService $remitaService
    ) {}

    // Stripe Checkout
    public function stripeCheckout(Request $request): JsonResponse
    {
        $request->validate([
            'credits' => 'required|integer|min:5|max:10000',
        ]);

        $user = $request->user();
        $credits = $request->credits;
        $amountNgn = $credits * config('app.credit_to_ngn_rate', 20); // 20 NGN per credit
        $amountUsd = $amountNgn / 800; // Rough NGN to USD conversion

        // Create payment record
        $payment = Payment::create([
            'user_id' => $user->id,
            'provider' => 'stripe',
            'amount_ngn' => $amountNgn * 100, // Store in kobo
            'currency' => 'USD',
            'credits_amount' => $credits,
            'metadata' => [
                'credits_requested' => $credits,
                'rate_used' => config('app.credit_to_ngn_rate', 20),
            ],
        ]);

        try {
            Stripe::setApiKey(config('services.stripe.secret'));

            $session = StripeSession::create([
                'payment_method_types' => ['card'],
                'line_items' => [[
                    'price_data' => [
                        'currency' => 'usd',
                        'product_data' => [
                            'name' => "Iconic Lite Credits ({$credits} credits)",
                        ],
                        'unit_amount' => round($amountUsd * 100), // Stripe expects cents
                    ],
                    'quantity' => 1,
                ]],
                'mode' => 'payment',
                'success_url' => config('app.frontend_url') . '/payment/success?session_id={CHECKOUT_SESSION_ID}',
                'cancel_url' => config('app.frontend_url') . '/payment/cancel',
                'metadata' => [
                    'payment_id' => $payment->id,
                    'user_id' => $user->id,
                ],
            ]);

            $payment->update(['provider_ref' => $session->id]);

            return response()->json([
                'checkoutUrl' => $session->url,
                'payment_id' => $payment->id,
            ]);
        } catch (\Exception $e) {
            $payment->markAsFailed();

            return response()->json([
                'error' => [
                    'code' => 'stripe_error',
                    'message' => 'Failed to create Stripe checkout session',
                    'details' => $e->getMessage(),
                ],
            ], 500);
        }
    }

    // Remita Payment Initiation
    public function remitaInitiate(Request $request): JsonResponse
    {
        $request->validate([
            'credits' => 'required|integer|min:5|max:10000',
        ]);

        $user = $request->user();
        $credits = $request->credits;
        $amountNgn = $credits * config('app.credit_to_ngn_rate', 20);

        // Create payment record
        $payment = Payment::create([
            'user_id' => $user->id,
            'provider' => 'remita',
            'amount_ngn' => $amountNgn * 100, // Store in kobo
            'currency' => 'NGN',
            'credits_amount' => $credits,
            'metadata' => [
                'credits_requested' => $credits,
                'rate_used' => config('app.credit_to_ngn_rate', 20),
            ],
        ]);

        try {
            $response = $this->remitaService->initiatePayment([
                'amount' => $amountNgn,
                'orderId' => $payment->id,
                'payerName' => $user->name,
                'payerEmail' => $user->email,
                'description' => "Iconic Lite Credits ({$credits} credits)",
            ]);

            if ($response['success']) {
                $payment->update(['provider_ref' => $response['rrr']]);

                return response()->json([
                    'paymentRef' => $response['rrr'],
                    'paymentUrl' => $response['payment_url'],
                    'payment_id' => $payment->id,
                ]);
            } else {
                $payment->markAsFailed();

                return response()->json([
                    'error' => [
                        'code' => 'remita_error',
                        'message' => 'Failed to initiate Remita payment',
                        'details' => $response['message'] ?? 'Unknown error',
                    ],
                ], 500);
            }
        } catch (\Exception $e) {
            $payment->markAsFailed();

            return response()->json([
                'error' => [
                    'code' => 'remita_error',
                    'message' => 'Failed to initiate Remita payment',
                    'details' => $e->getMessage(),
                ],
            ], 500);
        }
    }

    // Stripe Webhook
    public function stripeWebhook(Request $request): JsonResponse
    {
        $payload = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');
        $endpointSecret = config('services.stripe.webhook_secret');

        try {
            $event = \Stripe\Webhook::constructEvent($payload, $sigHeader, $endpointSecret);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Invalid signature'], 400);
        }

        if ($event->type === 'checkout.session.completed') {
            $session = $event->data->object;
            $paymentId = $session->metadata->payment_id ?? null;

            if ($paymentId) {
                $payment = Payment::find($paymentId);
                if ($payment && $payment->isPending()) {
                    $payment->markAsSucceeded();
                }
            }
        }

        return response()->json(['status' => 'success']);
    }

    // Remita Webhook
    public function remitaWebhook(Request $request): JsonResponse
    {
        // Verify webhook signature
        $hash = $request->header('X-Remita-Signature');
        $expectedHash = hash_hmac('sha512', $request->getContent(), config('services.remita.webhook_hash'));

        if (!hash_equals($expectedHash, $hash)) {
            return response()->json(['error' => 'Invalid signature'], 400);
        }

        $data = $request->all();
        $orderId = $data['orderId'] ?? null;
        $status = $data['status'] ?? null;

        if ($orderId && $status === '01') { // Success status
            $payment = Payment::find($orderId);
            if ($payment && $payment->isPending()) {
                $payment->markAsSucceeded();
            }
        }

        return response()->json(['status' => 'success']);
    }
}