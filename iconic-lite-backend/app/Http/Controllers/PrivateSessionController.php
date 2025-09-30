<?php

namespace App\Http\Controllers;

use App\Http\Requests\CreateSessionRequest;
use App\Models\PrivateSession;
use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PrivateSessionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        
        $query = PrivateSession::query();

        if ($user->isLecturer()) {
            $query->forLecturer($user->id);
        } elseif ($user->isStudent()) {
            $query->forStudent($user->id);
        } else {
            // Admin can see all sessions
            $this->authorize('view-all-sessions');
        }

        $sessions = $query->with(['lecturer:id,name', 'student:id,name'])
            ->orderBy('scheduled_at', 'desc')
            ->paginate($request->get('per_page', 15));

        return response()->json([
            'data' => $sessions->items(),
            'meta' => [
                'current_page' => $sessions->currentPage(),
                'per_page' => $sessions->perPage(),
                'total' => $sessions->total(),
                'last_page' => $sessions->lastPage(),
            ],
        ]);
    }

    public function store(CreateSessionRequest $request): JsonResponse
    {
        $student = $request->user();
        
        // Ensure user is a student
        if (!$student->isStudent()) {
            return response()->json([
                'error' => [
                    'code' => 'unauthorized',
                    'message' => 'Only students can request private sessions',
                ],
            ], 403);
        }

        $session = PrivateSession::create([
            'lecturer_id' => $request->lecturer_id,
            'student_id' => $student->id,
            'topic' => $request->topic,
            'description' => $request->description,
            'scheduled_at' => $request->scheduled_at,
            'price_credits' => $request->price_credits,
        ]);

        // Notify lecturer
        Notification::createForUser(
            $request->lecturer_id,
            'session_request',
            'New Private Session Request',
            "{$student->name} has requested a private session on '{$request->topic}'",
            ['session_id' => $session->id]
        );

        return response()->json([
            'session' => $session->load(['lecturer:id,name', 'student:id,name']),
            'message' => 'Session request created successfully',
        ], 201);
    }

    public function show(PrivateSession $session): JsonResponse
    {
        $this->authorize('view', $session);

        return response()->json([
            'data' => $session->load(['lecturer:id,name', 'student:id,name']),
        ]);
    }

    public function confirm(PrivateSession $session): JsonResponse
    {
        $this->authorize('confirm', $session);

        $confirmed = $session->confirm();

        if (!$confirmed) {
            return response()->json([
                'error' => [
                    'code' => 'confirmation_failed',
                    'message' => 'Failed to confirm session. Student may have insufficient credits.',
                ],
            ], 400);
        }

        // Notify student
        Notification::createForUser(
            $session->student_id,
            'session_confirmed',
            'Session Confirmed',
            "Your private session on '{$session->topic}' has been confirmed.",
            ['session_id' => $session->id]
        );

        return response()->json([
            'session' => $session->fresh()->load(['lecturer:id,name', 'student:id,name']),
            'message' => 'Session confirmed successfully',
        ]);
    }

    public function start(PrivateSession $session): JsonResponse
    {
        $this->authorize('start', $session);

        $session->start();

        return response()->json([
            'session' => $session->fresh(),
            'message' => 'Session started',
        ]);
    }

    public function complete(Request $request, PrivateSession $session): JsonResponse
    {
        $this->authorize('complete', $session);

        $request->validate([
            'notes' => 'nullable|string|max:1000',
        ]);

        $session->complete($request->notes);

        // Notify student
        Notification::createForUser(
            $session->student_id,
            'session_completed',
            'Session Completed',
            "Your private session on '{$session->topic}' has been completed.",
            ['session_id' => $session->id]
        );

        return response()->json([
            'session' => $session->fresh(),
            'message' => 'Session completed successfully',
        ]);
    }

    public function cancel(PrivateSession $session): JsonResponse
    {
        $this->authorize('cancel', $session);

        $session->cancel();

        // Notify both parties
        $message = "Private session on '{$session->topic}' has been cancelled.";
        
        Notification::createForUser($session->lecturer_id, 'session_cancelled', 'Session Cancelled', $message, ['session_id' => $session->id]);
        Notification::createForUser($session->student_id, 'session_cancelled', 'Session Cancelled', $message, ['session_id' => $session->id]);

        return response()->json([
            'session' => $session->fresh(),
            'message' => 'Session cancelled successfully',
        ]);
    }
}